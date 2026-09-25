import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { OAuth2Client } from "google-auth-library";
import { type Model, Types } from "mongoose";

import { RateLimitService } from "../../common/security/rate-limit.service";
import { randomToken, sha256 } from "../../common/utils/crypto";
import { MailService } from "../mail/mail.service";
import { AccountSettingsDto, EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from "./auth.dto";
import { Account, type AuthProvider, EmailVerification, PasswordReset, Session } from "./auth.models";
import { MemberCodeService } from "./member-code.service";
import { hashPassword, tokenDigest, verifyPassword } from "./password";

export type SessionContext = { ip?: string; userAgent?: string };
export type AuthPrincipal = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "MEMBER" | "SUPER_ADMIN";
  verified: boolean;
  sessionId: string;
  sessionExpiresAt: Date;
};
type AccountLike = Account & { _id: unknown };

@Injectable()
export class AuthService {
  private readonly google?: OAuth2Client;
  private readonly legalVersion = "2026-09-19";
  constructor(
    @InjectModel("Account") private readonly accounts: Model<Account>,
    @InjectModel("Session") private readonly sessions: Model<Session>,
    @InjectModel("EmailVerification") private readonly emailVerifications: Model<EmailVerification>,
    @InjectModel("PasswordReset") private readonly resets: Model<PasswordReset>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly rateLimits: RateLimitService,
    private readonly memberCodes: MemberCodeService,
  ) {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (clientId) this.google = new OAuth2Client(clientId);
  }

  publicAccount(account: AccountLike) {
    return {
      id: String(account._id),
      name: account.name,
      email: account.email,
      mobile: account.mobile,
      role: account.role,
      verified: account.verified,
    };
  }
  publicPrincipal(principal: AuthPrincipal) {
    return {
      id: principal.id,
      name: principal.name,
      email: principal.email,
      mobile: principal.mobile,
      role: principal.role,
      verified: principal.verified,
    };
  }
  private contextHash(value?: string) {
    if (!value) return undefined;
    const pepper = String(this.config.get("COOKIE_SECRET") ?? "development");
    return sha256(`${pepper}:${value.slice(0, 1000)}`);
  }

  private deviceLabel(userAgent?: string) {
    if (!userAgent) return "Browser session";

    const value = userAgent.slice(0, 500);
    const device = /iPhone/i.test(value)
      ? "iPhone"
      : /iPad/i.test(value)
        ? "iPad"
        : /Android/i.test(value)
          ? "Android mobile"
          : /Windows/i.test(value)
            ? "Windows PC"
            : /Macintosh|Mac OS X/i.test(value)
              ? "Mac"
              : /Linux/i.test(value)
                ? "Linux device"
                : "Device";

    const browser = /Edg\//i.test(value)
      ? "Edge"
      : /Chrome\//i.test(value)
        ? "Chrome"
        : /Firefox\//i.test(value)
          ? "Firefox"
          : /Safari\//i.test(value) && !/Chrome\//i.test(value)
            ? "Safari"
            : /undici|node/i.test(value)
              ? "App browser"
              : "Browser";

    return `${browser} on ${device}`.slice(0, 80);
  }
  private accountId(account: AccountLike) {
    return new Types.ObjectId(String(account._id));
  }

  private frontendOrigin() {
    return String(this.config.get("FRONTEND_URL") ?? "http://localhost:3333").split(",")[0];
  }

  private transactionalFrom() {
    return this.config.get<string>("NOREPLY_EMAIL")?.trim() || undefined;
  }

  private async sendVerification(account: AccountLike) {
    const token = randomToken(32);
    await this.emailVerifications.deleteMany({ accountId: this.accountId(account) });
    await this.emailVerifications.create({
      accountId: this.accountId(account),
      tokenHash: tokenDigest(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const url = `${this.frontendOrigin()}/verify-email#token=${token}`;
    await this.mail.send(
      account.email,
      "Verify your email",
      `Hi ${account.name},\n\nVerify your email address to complete your M. Dadu Films account verification.\n\nThis link expires in 24 hours.`,
      { action: { label: "Verify Email", url }, eyebrow: "Account verification", from: this.transactionalFrom() },
    );
  }

  async register(input: RegisterDto, context: SessionContext) {
    if (input.password !== input.confirmPassword) throw new BadRequestException("Passwords must match.");
    await this.rateLimits.consume("register-email", input.email, 5, 60 * 60 * 1000);
    try {
      if (await this.accounts.exists({ email: input.email })) {
        throw new ConflictException("An account with this email already exists.");
      }

      const acceptedAt = new Date();
      const account = await this.accounts.create({
        memberCode: await this.memberCodes.next(acceptedAt),
        name: input.name.trim(),
        email: input.email,
        mobile: input.mobile.trim(),
        passwordHash: await hashPassword(input.password),
        authProvider: "local",
        termsAcceptedAt: acceptedAt,
        termsVersion: this.legalVersion,
        privacyAcceptedAt: acceptedAt,
        privacyVersion: this.legalVersion,
      });
      await this.sendVerification(account).catch(() => undefined);
      return this.createSession(account, false, context);
    } catch (error: unknown) {
      if (typeof error === "object" && error && "code" in error && error.code === 11000)
        throw new ConflictException("An account with this email already exists.");
      throw error;
    }
  }

  async login(input: LoginDto, context: SessionContext) {
    await this.rateLimits.consume("login-email", input.email, 20, 15 * 60 * 1000);
    const account = await this.accounts.findOne({ email: input.email }).select("+passwordHash +googleSub");
    const fakeHash = `${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(input.password, account?.passwordHash ?? fakeHash);
    if (!account || !valid || account.suspended) throw new UnauthorizedException("Login failed. Check your email and password.");
    await this.accounts.updateOne({ _id: account._id }, { $set: { lastLoginAt: new Date() }, $inc: { loginCount: 1 } });
    return this.createSession(account, !!input.remember, context);
  }

  async googleLogin(input: GoogleAuthDto, context: SessionContext) {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (!this.google || !clientId) throw new ServiceUnavailableException("Google sign-in is not configured yet.");

    let payload;
    try {
      const ticket = await this.google.verifyIdToken({ idToken: input.credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException("Google sign-in could not be verified.");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException("Google did not return a verified email address.");
    }

    const email = payload.email.trim().toLowerCase();
    let account = await this.accounts
      .findOne({ $or: [{ googleSub: payload.sub }, { email }] })
      .select("+googleSub +passwordHash");

    if (!account) {
      const acceptedAt = new Date();

      account = await this.accounts.create({
        memberCode: await this.memberCodes.next(acceptedAt),
        name: (payload.name || email.split("@")[0]).slice(0, 100),
        email,
        mobile: "",
        authProvider: "google",
        googleSub: payload.sub,
        verified: true,
        termsAcceptedAt: acceptedAt,
        termsVersion: this.legalVersion,
        privacyAcceptedAt: acceptedAt,
        privacyVersion: this.legalVersion,
      });
    } else {
      if (account.suspended) throw new UnauthorizedException("Login failed. Check your account status.");

      if (!account.googleSub) {
        account.googleSub = payload.sub;
        account.authProvider = account.passwordHash ? "both" : "google";
      }

      account.verified = true;
      account.lastLoginAt = new Date();
      account.loginCount = Number(account.loginCount ?? 0) + 1;
      await account.save();
    }

    return this.createSession(account, !!input.remember, context);
  }

  private async createSession(account: AccountLike, remember: boolean, context: SessionContext) {
    const token = randomToken(32);
    const shortHours = Math.max(1, Number(this.config.get("SESSION_SHORT_HOURS") ?? 12));
    const rememberDays = Math.max(1, Number(this.config.get("SESSION_REMEMBER_DAYS") ?? 30));
    const duration = remember ? rememberDays * 86_400_000 : shortHours * 3_600_000;
    const now = new Date();
    const session = await this.sessions.create({
      accountId: this.accountId(account),
      tokenHash: tokenDigest(token),
      remember,
      ipHash: this.contextHash(context.ip),
      userAgentHash: this.contextHash(context.userAgent),
      deviceLabel: this.deviceLabel(context.userAgent),
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + duration),
    });
    const maxSessions = Math.max(1, Math.min(25, Number(this.config.get("SESSION_MAX_PER_ACCOUNT") ?? 10)));
    const stale = await this.sessions
      .find({ accountId: this.accountId(account) })
      .sort({ createdAt: -1 })
      .skip(maxSessions)
      .select("_id")
      .lean();
    if (stale.length) await this.sessions.deleteMany({ _id: { $in: stale.map((item) => item._id) } });
    return { token, duration, remember, sessionId: String(session._id), account: this.publicAccount(account) };
  }

  async authenticate(token?: string): Promise<AuthPrincipal> {
    if (!token || !/^[A-Za-z0-9_-]{40,128}$/.test(token)) throw new UnauthorizedException("Please sign in.");
    const session = await this.sessions.findOne({ tokenHash: tokenDigest(token), expiresAt: { $gt: new Date() } }).lean();
    const account = session ? await this.accounts.findById(session.accountId).lean() : null;
    if (!session || !account || account.suspended) throw new UnauthorizedException("Your session has expired. Please sign in.");
    if (!session.lastSeenAt || session.lastSeenAt.getTime() < Date.now() - 15 * 60 * 1000) {
      void this.sessions
        .updateOne({ _id: session._id, lastSeenAt: { $lt: new Date(Date.now() - 15 * 60 * 1000) } }, { $set: { lastSeenAt: new Date() } })
        .catch(() => undefined);
    }
    return { ...this.publicAccount(account as AccountLike), sessionId: String(session._id), sessionExpiresAt: session.expiresAt };
  }

  async logout(token?: string) {
    if (token && /^[A-Za-z0-9_-]{40,128}$/.test(token)) await this.sessions.deleteOne({ tokenHash: tokenDigest(token) });
    return { message: "Logged out." };
  }
  async updateAccount(principal: AuthPrincipal, input: AccountSettingsDto) {
    const account = await this.accounts.findById(principal.id);
    if (!account) throw new NotFoundException("Account not found.");
    // Changing an identity used by Google requires a separate verified linking flow.
    if (input.email && input.email !== account.email && account.verified) {
      throw new BadRequestException(
        "Verified account email cannot be changed here. Contact support if your verified email must be updated.",
      );
    }
    if (input.email && input.email !== account.email && account.authProvider !== "local") {
      throw new BadRequestException("The email linked to Google sign-in cannot be changed here.");
    }
    const emailChanged = input.email !== undefined && input.email !== account.email;
    try {
      if (input.email !== undefined) account.email = input.email;
      if (input.mobile !== undefined) account.mobile = input.mobile;
      await account.save();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000)
        throw new ConflictException("This email is already registered.");
      throw error;
    }
    if (emailChanged) await this.sendVerification(account).catch(() => undefined);
    return this.publicAccount(account);
  }
  async logoutAll(accountId: string) {
    await this.sessions.deleteMany({ accountId: new Types.ObjectId(accountId) });
    return { message: "All sessions have been signed out." };
  }
  async deactivate(accountId: string) {
    const account = await this.accounts.findOneAndUpdate(
      { _id: new Types.ObjectId(accountId), role: "MEMBER" },
      { $set: { suspended: true } },
      { new: true },
    );
    if (!account) throw new BadRequestException("An administrator account cannot be deactivated here.");
    await this.sessions.deleteMany({ accountId: account._id });
    return { message: "Account deactivated. Contact the team to reactivate it." };
  }
  async listSessions(accountId: string, currentSessionId: string) {
    const sessions = await this.sessions
      .find({ accountId: new Types.ObjectId(accountId), expiresAt: { $gt: new Date() } })
      .select("_id remember deviceLabel createdAt lastSeenAt expiresAt")
      .sort({ createdAt: -1 })
      .lean();
    return sessions.map((session) => ({
      id: String(session._id),
      remember: session.remember,
      deviceLabel: session.deviceLabel ?? "Existing browser session",
      createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
      current: String(session._id) === currentSessionId,
    }));
  }
  async revokeSession(accountId: string, sessionId: string, currentSessionId: string) {
    if (!Types.ObjectId.isValid(sessionId)) throw new NotFoundException("Session not found.");
    const result = await this.sessions.deleteOne({ _id: new Types.ObjectId(sessionId), accountId: new Types.ObjectId(accountId) });
    if (!result.deletedCount) throw new NotFoundException("Session not found.");
    return { message: "Session revoked.", currentSessionRevoked: sessionId === currentSessionId };
  }

  async verifyEmail(input: VerifyEmailDto) {
    const verification = await this.emailVerifications.findOneAndDelete({
      tokenHash: tokenDigest(input.token),
      expiresAt: { $gt: new Date() },
    });

    if (!verification) throw new BadRequestException("This verification link is invalid or expired.");

    const account = await this.accounts.findByIdAndUpdate(
      verification.accountId,
      { $set: { verified: true } },
      { new: true },
    );

    if (!account) throw new BadRequestException("This verification link is invalid or expired.");

    await this.emailVerifications.deleteMany({ accountId: account._id });
    await this.mail
      .send(
        account.email,
        "Email verified",
        `Hi ${account.name},\n\nYour email has been verified successfully. Welcome to the M. Dadu Films community.`,
        { eyebrow: "Account verified", from: this.transactionalFrom() },
      )
      .catch(() => undefined);

    return { message: "Email verified successfully." };
  }

  async resendVerification(input: EmailDto) {
    await this.rateLimits.consume("verify-email", input.email, 5, 60 * 60 * 1000);
    const account = await this.accounts.findOne({ email: input.email, suspended: false });

    if (account && !account.verified) {
      await this.sendVerification(account).catch(() => undefined);
    }

    return { message: "If this account needs verification, a new verification email will be sent." };
  }

  async forgot(input: EmailDto) {
    await this.rateLimits.consume("forgot-email", input.email, 5, 60 * 60 * 1000);
    const account = await this.accounts.findOne({ email: input.email, suspended: false });
    if (account) {
      const token = randomToken(32);
      await this.resets.deleteMany({ accountId: account._id });
      await this.resets.create({ accountId: account._id, tokenHash: tokenDigest(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
      const resetUrl = `${this.frontendOrigin()}/reset-password#token=${token}`;
      await this.mail
        .send(
          account.email,
          "Reset your password",
          `Hi ${account.name},\n\nWe received a request to reset your M. Dadu Films password. The link expires in one hour.\n\nIf you did not request this, you can ignore this email.`,
          { action: { label: "Reset Password", url: resetUrl }, eyebrow: "Account security", from: this.transactionalFrom() },
        )
        .catch(() => undefined);
    }
    return { message: "If that email is registered, a reset link will be sent." };
  }

  async reset(input: ResetPasswordDto) {
    if (input.password !== input.confirmPassword) throw new BadRequestException("Passwords must match.");
    const reset = await this.resets.findOneAndDelete({ tokenHash: tokenDigest(input.token), expiresAt: { $gt: new Date() } });
    if (!reset) throw new BadRequestException("This reset link is invalid or expired.");
    const account = await this.accounts.findById(reset.accountId).select("+googleSub +passwordHash");
    if (!account) throw new BadRequestException("This reset link is invalid or expired.");
    account.passwordHash = await hashPassword(input.password);
    const provider: AuthProvider = account.googleSub ? "both" : "local";
    account.authProvider = provider;
    await account.save();
    await this.sessions.deleteMany({ accountId: reset.accountId });
    await this.mail
      .send(
        account.email,
        "Password changed",
        `Hi ${account.name},\n\nYour M. Dadu Films password was changed successfully. All previous sessions have been signed out.\n\nIf you did not make this change, contact the M. Dadu Films team immediately.`,
        { eyebrow: "Account security", from: this.transactionalFrom() },
      )
      .catch(() => undefined);
    return { message: "Password updated. Please sign in." };
  }
}
