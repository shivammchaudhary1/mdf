import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { randomBytes } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import { Account, Session } from "./auth.models";
import { EmailDto, LoginDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
import { hashPassword, tokenDigest, verifyPassword } from "./password";
import { MailService } from "../mail/mail.service";
@Injectable()
export class AuthService {
  constructor(
    @InjectModel("Account") private readonly accounts: Model<Account>,
    @InjectModel("Session") private readonly sessions: Model<Session>,
    @InjectModel("PasswordReset") private readonly resets: Model<Session>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}
  publicAccount(account: Account) {
    return {
      id: String(account._id),
      name: account.name,
      email: account.email,
      mobile: account.mobile,
      role: account.role,
      verified: account.verified,
    };
  }
  async register(input: RegisterDto) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException("Passwords must match.");
    try {
      const account = await this.accounts.create({
        name: input.name.trim(),
        email: input.email,
        mobile: input.mobile,
        passwordHash: await hashPassword(input.password),
      });
      await this.mail
        .send(
          account.email,
          "Welcome to M. Dadu Films",
          `Welcome ${account.name}. Your community account is ready.`,
        )
        .catch(() => undefined);
      return this.createSession(account, false);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        error.code === 11000
      )
        throw new ConflictException(
          "An account with this email already exists.",
        );
      throw error;
    }
  }
  async login(input: LoginDto) {
    const account = await this.accounts
      .findOne({ email: input.email })
      .select("+passwordHash");
    // Do comparable password work for unknown accounts.
    const stored =
      account?.passwordHash ?? `${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(input.password, stored);
    if (!account || !valid || account.suspended)
      throw new UnauthorizedException(
        "Login failed. Check your email and password.",
      );
    return this.createSession(account, !!input.remember);
  }
  private async createSession(account: Account, remember: boolean) {
    const token = randomBytes(32).toString("hex");
    const duration = remember ? 30 * 86400000 : 12 * 3600000;
    await this.sessions.create({
      tokenHash: tokenDigest(token),
      userId: String(account._id),
      expiresAt: new Date(Date.now() + duration),
    });
    return { token, duration, remember, user: this.publicAccount(account) };
  }
  async authenticate(token?: string) {
    if (!token || !/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException("Please sign in.");
    const session = await this.sessions.findOne({
      tokenHash: tokenDigest(token),
      expiresAt: { $gt: new Date() },
    });
    const account = session
      ? await this.accounts.findById(session.userId)
      : null;
    if (!account || account.suspended)
      throw new UnauthorizedException(
        "Your session has expired. Please sign in.",
      );
    return this.publicAccount(account);
  }
  async logout(token?: string) {
    if (token) await this.sessions.deleteOne({ tokenHash: tokenDigest(token) });
    return { message: "Logged out." };
  }
  async forgot(input: EmailDto) {
    const account = await this.accounts.findOne({
      email: input.email,
      suspended: false,
    });
    if (account) {
      const token = randomBytes(32).toString("hex");
      await this.resets.deleteMany({ userId: String(account._id) });
      await this.resets.create({
        userId: String(account._id),
        tokenHash: tokenDigest(token),
        expiresAt: new Date(Date.now() + 3600000),
      });
      const origin = String(
        this.config.get("FRONTEND_URL") ?? "http://localhost:3333",
      ).split(",")[0];
      await this.mail
        .send(
          account.email,
          "Reset your password",
          `Reset your password within one hour: ${origin}/reset-password#token=${token}`,
        )
        .catch(() => undefined);
    }
    return {
      message: "If that email is registered, a reset link will be sent.",
    };
  }
  async reset(input: ResetPasswordDto) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException("Passwords must match.");
    const reset = await this.resets.findOneAndDelete({
      tokenHash: tokenDigest(input.token),
      expiresAt: { $gt: new Date() },
    });
    if (!reset)
      throw new BadRequestException("This reset link is invalid or expired.");
    await this.accounts.findByIdAndUpdate(reset.userId, {
      passwordHash: await hashPassword(input.password),
    });
    await this.sessions.deleteMany({ userId: reset.userId });
    return { message: "Password updated. Please sign in." };
  }
}
