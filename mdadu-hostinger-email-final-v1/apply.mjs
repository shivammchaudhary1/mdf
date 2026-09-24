import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const EXPECTED_BRANCH = "feature/hostinger-smtp";
const EXPECTED_HEAD = "92ec00bde6446caf41cba8ee188535e5a2e1fd9c";

const targets = [
  "apps/api/.env.example",
  "apps/api/src/common/middleware/security.middleware.ts",
  "apps/api/src/config/environment.ts",
  "apps/api/src/modules/applications/application.service.ts",
  "apps/api/src/modules/auth/auth.controller.ts",
  "apps/api/src/modules/auth/auth.dto.ts",
  "apps/api/src/modules/auth/auth.models.ts",
  "apps/api/src/modules/auth/auth.module.ts",
  "apps/api/src/modules/auth/auth.service.ts",
  "apps/api/src/modules/careers/career.service.ts",
  "apps/api/src/modules/contact/contact.service.ts",
  "apps/api/src/modules/mail/mail.service.ts",
  "apps/api/src/modules/talent/talent.dto.ts",
  "apps/api/src/modules/talent/talent.service.ts",
  "apps/web/src/components/account-form.tsx",
  "apps/web/src/components/admin/admin-members-view.tsx",
  "apps/web/src/services/api.ts",
  "scripts/integration-test.mjs",
];

const verifyPage = "apps/web/src/app/verify-email/page.tsx";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function normalize(raw) {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  return { eol, text: raw.replace(/\r\n/g, "\n") };
}

function restoreEol(text, eol) {
  return eol === "\r\n" ? text.replace(/\n/g, "\r\n") : text;
}

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) fail(`${label}: expected exactly one match, found ${count}.`);
  return source.replace(before, after);
}

if (git("branch", "--show-current") !== EXPECTED_BRANCH) {
  fail(`Switch to ${EXPECTED_BRANCH} first.`);
}

const head = git("rev-parse", "HEAD");
if (head !== EXPECTED_HEAD) {
  fail(`Unexpected HEAD ${head}. Expected ${EXPECTED_HEAD}.`);
}

/*
 * We intentionally allow local .env.dev/.env.prod changes because they are secrets
 * and are NOT patch targets. Every tracked source target must still equal HEAD.
 */
for (const path of targets) {
  const current = normalize(await readFile(resolve(path), "utf8")).text;
  const fromHead = normalize(execFileSync("git", ["show", `HEAD:${path}`], { encoding: "utf8" })).text;
  if (current !== fromHead) {
    fail(`${path} has local source changes. Revert/commit that file before applying this patch.`);
  }
}

if (existsSync(resolve(verifyPage))) {
  fail(`${verifyPage} already exists. Remove the previous untracked SMTP attempt first.`);
}

const originals = new Map();
for (const path of targets) originals.set(path, await readFile(resolve(path), "utf8"));
const outputs = new Map();

/* -------------------------------------------------------------------------- */
/* Central themed mail service                                                */
/* -------------------------------------------------------------------------- */

outputs.set(
  "apps/api/src/modules/mail/mail.service.ts",
  `import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

type MailAction = {
  label: string;
  url: string;
};

type MailOptions = {
  action?: MailAction;
  eyebrow?: string;
  replyTo?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char] ?? char;
  });
}

function textToHtml(text: string) {
  return escapeHtml(text).replace(/\\n/g, "<br>");
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transport?: Transporter;

  constructor(private readonly config: ConfigService) {}

  private getTransport() {
    if (this.transport) return this.transport;

    const host = this.config.get<string>("SMTP_HOST")?.trim();
    if (!host) return undefined;

    const port = Number(this.config.get("SMTP_PORT") ?? 465);
    const user = this.config.get<string>("SMTP_USER")?.trim();
    const pass = this.config.get<string>("SMTP_PASSWORD");

    this.transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transport;
  }

  private html(subject: string, text: string, options: MailOptions) {
    const action = options.action
      ? \`
        <tr>
          <td style="padding:4px 32px 28px">
            <a href="\${escapeHtml(options.action.url)}"
               style="display:inline-block;background:#ea2f3c;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:700;padding:14px 22px;border-radius:8px">
              \${escapeHtml(options.action.label)}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;color:#747474;font-family:Arial,sans-serif;font-size:12px;line-height:1.6">
            If the button does not work, copy this link:<br>
            <span style="word-break:break-all;color:#111111">\${escapeHtml(options.action.url)}</span>
          </td>
        </tr>\`
      : "";

    return \`<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f7f5">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f7f5;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #e9e9e6;border-radius:16px;overflow:hidden">
            <tr>
              <td style="background:#0b0b0b;padding:24px 32px">
                <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:.04em;color:#ffffff">M. DADU FILMS</div>
                <div style="margin-top:6px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c8a36a">Stories · Production · Community</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 8px">
                <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#ea2f3c">
                  \${escapeHtml(options.eyebrow ?? "M. Dadu Films")}
                </div>
                <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:600;color:#111111">
                  \${escapeHtml(subject)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.75;color:#4b4b4b">
                \${textToHtml(text)}
              </td>
            </tr>
            \${action}
            <tr>
              <td style="border-top:1px solid #e9e9e6;padding:20px 32px;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:#747474">
                M. Dadu Films<br>
                This is a transactional email related to your activity on M. Dadu Films.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>\`;
  }

  async send(to: string, subject: string, text: string, options: MailOptions = {}) {
    const safeSubject = subject.replace(/[\\r\\n]+/g, " ").slice(0, 180);
    const transport = this.getTransport();
    const html = this.html(safeSubject, text, options);

    if (!transport) {
      if (this.config.get("NODE_ENV") === "production") throw new Error("SMTP is not configured.");

      const directory = join(process.cwd(), ".local", "mail");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(
        join(directory, \`\${randomUUID()}.json\`),
        JSON.stringify(
          {
            to,
            subject: safeSubject,
            text,
            html,
            replyTo: options.replyTo,
            createdAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        { mode: 0o600 },
      );
      this.logger.log("Development email saved to the private local mail outbox.");
      return;
    }

    try {
      await transport.sendMail({
        from: this.config.get<string>("SMTP_FROM"),
        to,
        subject: safeSubject,
        text,
        html,
        replyTo: options.replyTo,
      });
    } catch (error) {
      this.logger.error(
        \`Email delivery failed for \${to}: \${error instanceof Error ? error.message : "Unknown SMTP error"}\`,
      );
      throw error;
    }
  }
}
`,
);

/* -------------------------------------------------------------------------- */
/* Email verification token model; account.verified remains the ONLY flag     */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/modules/auth/auth.models.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  const tokenModel = `export interface EmailVerification {
  _id: Types.ObjectId;
  accountId: Types.ObjectId;
  tokenHash: Buffer;
  expiresAt: Date;
  createdAt: Date;
}
export const EmailVerificationSchema = new Schema<EmailVerification>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    tokenHash: { type: Buffer, required: true, select: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);
EmailVerificationSchema.index({ tokenHash: 1 }, { unique: true });
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailVerificationSchema.index({ accountId: 1, createdAt: -1 });

`;

  source = replaceOnce(
    source,
    `export interface PasswordReset {`,
    tokenModel + `export interface PasswordReset {`,
    "Email verification token model",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* DTO */
{
  const path = "apps/api/src/modules/auth/auth.dto.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `export class ResetPasswordDto {`,
    `export class VerifyEmailDto {
  @ApiProperty() @IsString() @Matches(/^[A-Za-z0-9_-]{40,128}$/) token!: string;
}
export class ResetPasswordDto {`,
    "VerifyEmailDto",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* Auth module */
{
  const path = "apps/api/src/modules/auth/auth.module.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `import { AccountSchema, ResetSchema, SessionSchema } from "./auth.models";`,
    `import { AccountSchema, EmailVerificationSchema, ResetSchema, SessionSchema } from "./auth.models";`,
    "Auth verification schema import",
  );

  source = replaceOnce(
    source,
    `      { name: "Session", schema: SessionSchema },
      { name: "PasswordReset", schema: ResetSchema },`,
    `      { name: "Session", schema: SessionSchema },
      { name: "EmailVerification", schema: EmailVerificationSchema },
      { name: "PasswordReset", schema: ResetSchema },`,
    "Auth verification model registration",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* Controller */
{
  const path = "apps/api/src/modules/auth/auth.controller.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `import { AccountSettingsDto, EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto } from "./auth.dto";`,
    `import { AccountSettingsDto, EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from "./auth.dto";`,
    "Auth DTO import",
  );

  source = replaceOnce(
    source,
    `  @Post("forgot-password") forgot(@Body() input: EmailDto) {
    return this.auth.forgot(input);
  }`,
    `  @Post("verify-email") verifyEmail(@Body() input: VerifyEmailDto) {
    return this.auth.verifyEmail(input);
  }
  @Post("resend-verification") resendVerification(@Body() input: EmailDto) {
    return this.auth.resendVerification(input);
  }
  @Post("forgot-password") forgot(@Body() input: EmailDto) {
    return this.auth.forgot(input);
  }`,
    "Email verification controller routes",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* Auth service */
{
  const path = "apps/api/src/modules/auth/auth.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `import { AccountSettingsDto, EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
import { Account, type AuthProvider, PasswordReset, Session } from "./auth.models";`,
    `import { AccountSettingsDto, EmailDto, GoogleAuthDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from "./auth.dto";
import { Account, type AuthProvider, EmailVerification, PasswordReset, Session } from "./auth.models";`,
    "Auth service imports",
  );

  source = replaceOnce(
    source,
    `    @InjectModel("Session") private readonly sessions: Model<Session>,
    @InjectModel("PasswordReset") private readonly resets: Model<PasswordReset>,`,
    `    @InjectModel("Session") private readonly sessions: Model<Session>,
    @InjectModel("EmailVerification") private readonly emailVerifications: Model<EmailVerification>,
    @InjectModel("PasswordReset") private readonly resets: Model<PasswordReset>,`,
    "Auth verification model injection",
  );

  source = replaceOnce(
    source,
    `  private accountId(account: AccountLike) {
    return new Types.ObjectId(String(account._id));
  }

  async register`,
    `  private accountId(account: AccountLike) {
    return new Types.ObjectId(String(account._id));
  }

  private frontendOrigin() {
    return String(this.config.get("FRONTEND_URL") ?? "http://localhost:3333").split(",")[0];
  }

  private async sendVerification(account: AccountLike) {
    const token = randomToken(32);
    await this.emailVerifications.deleteMany({ accountId: this.accountId(account) });
    await this.emailVerifications.create({
      accountId: this.accountId(account),
      tokenHash: tokenDigest(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const url = \`\${this.frontendOrigin()}/verify-email#token=\${token}\`;
    await this.mail.send(
      account.email,
      "Verify your email",
      \`Hi \${account.name},\\n\\nVerify your email address to complete your M. Dadu Films account verification.\\n\\nThis link expires in 24 hours.\`,
      { action: { label: "Verify Email", url }, eyebrow: "Account verification" },
    );
  }

  async register`,
    "Auth verification helper",
  );

  source = replaceOnce(
    source,
    `      await this.mail
        .send(account.email, "Welcome to M. Dadu Films", \`Welcome \${account.name}. Your community account is ready.\`)
        .catch(() => undefined);`,
    `      await this.sendVerification(account).catch(() => undefined);`,
    "Signup verification email",
  );

  source = replaceOnce(
    source,
    `        authProvider: "google",
        googleSub: payload.sub,
        termsAcceptedAt: acceptedAt,`,
    `        authProvider: "google",
        googleSub: payload.sub,
        verified: true,
        termsAcceptedAt: acceptedAt,`,
    "Google registration verification",
  );

  source = replaceOnce(
    source,
    `      account.lastLoginAt = new Date();
      account.loginCount = Number(account.loginCount ?? 0) + 1;`,
    `      account.verified = true;
      account.lastLoginAt = new Date();
      account.loginCount = Number(account.loginCount ?? 0) + 1;`,
    "Existing Google account verification",
  );

  source = replaceOnce(
    source,
    `    try {
      if (input.email !== undefined) account.email = input.email;
      if (input.mobile !== undefined) account.mobile = input.mobile;
      await account.save();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000)
        throw new ConflictException("This email is already registered.");
      throw error;
    }
    return this.publicAccount(account);`,
    `    const emailChanged = input.email !== undefined && input.email !== account.email;
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
    return this.publicAccount(account);`,
    "Unverified email-change verification",
  );

  source = replaceOnce(
    source,
    `  async forgot(input: EmailDto) {`,
    `  async verifyEmail(input: VerifyEmailDto) {
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
        \`Hi \${account.name},\\n\\nYour email has been verified successfully. Welcome to the M. Dadu Films community.\`,
        { eyebrow: "Account verified" },
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

  async forgot(input: EmailDto) {`,
    "Verify/resend email service",
  );

  source = replaceOnce(
    source,
    `      const origin = String(this.config.get("FRONTEND_URL") ?? "http://localhost:3333").split(",")[0];
      await this.mail
        .send(account.email, "Reset your password", \`Reset your password within one hour: \${origin}/reset-password#token=\${token}\`)
        .catch(() => undefined);`,
    `      const resetUrl = \`\${this.frontendOrigin()}/reset-password#token=\${token}\`;
      await this.mail
        .send(
          account.email,
          "Reset your password",
          \`Hi \${account.name},\\n\\nWe received a request to reset your M. Dadu Films password. The link expires in one hour.\\n\\nIf you did not request this, you can ignore this email.\`,
          { action: { label: "Reset Password", url: resetUrl }, eyebrow: "Account security" },
        )
        .catch(() => undefined);`,
    "Forgot-password themed email",
  );

  source = replaceOnce(
    source,
    `    await account.save();
    await this.sessions.deleteMany({ accountId: reset.accountId });
    return { message: "Password updated. Please sign in." };`,
    `    await account.save();
    await this.sessions.deleteMany({ accountId: reset.accountId });
    await this.mail
      .send(
        account.email,
        "Password changed",
        \`Hi \${account.name},\\n\\nYour M. Dadu Films password was changed successfully. All previous sessions have been signed out.\\n\\nIf you did not make this change, contact the M. Dadu Films team immediately.\`,
        { eyebrow: "Account security" },
      )
      .catch(() => undefined);
    return { message: "Password updated. Please sign in." };`,
    "Password changed confirmation email",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Admin must NOT manually mutate verified; verified means email verified     */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/modules/talent/talent.dto.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `export class MemberUpdateDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() verified?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() suspended?: boolean;
}`,
    `export class MemberUpdateDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() suspended?: boolean;
}`,
    "Remove manual verified mutation DTO",
  );

  outputs.set(path, restoreEol(source, eol));
}

{
  const path = "apps/api/src/modules/talent/talent.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `      metadata: {
        ...(input.verified !== undefined ? { verified: input.verified } : {}),
        ...(input.suspended !== undefined ? { suspended: input.suspended } : {}),
      },`,
    `      metadata: {
        ...(input.suspended !== undefined ? { suspended: input.suspended } : {}),
      },`,
    "Remove manual verified audit mutation",
  );

  outputs.set(path, restoreEol(source, eol));
}

{
  const path = "apps/web/src/components/admin/admin-members-view.tsx";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `      active === "Verified" ? "&verified=true" : active === "Unverified" || active === "Needs Review" ? "&verified=false" : ""`,
    `      active === "Verified" ? "&verified=true" : active === "Unverified" ? "&verified=false" : ""`,
    "Admin verification filter",
  );

  source = replaceOnce(
    source,
    `  async function toggleVerify() {
    if (!selectedView) return;

    try {
      await api(\`/admin/members/\${selectedView.id}\`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !selectedView.verified }),
      });
      await Promise.all([refresh(), loadOverview()]);
      toast.success("Verification updated.");
      setSelected(null);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update member.");
    }
  }

`,
    ``,
    "Remove admin manual verify function",
  );

  source = replaceOnce(source, `<span>Verified</span>`, `<span>Verified emails</span>`, "Admin metric label");

  source = replaceOnce(
    source,
    `<AdminFilters values={["All", "Verified", "Unverified", "Needs Review"]} active={active} onChange={setActive} />`,
    `<AdminFilters values={["All", "Verified", "Unverified"]} active={active} onChange={setActive} />`,
    "Admin verified filters",
  );

  source = replaceOnce(
    source,
    `<span className="verified">✓ Verified</span>
                ) : (
                  <AdminStatus value="Needs Review" />`,
    `<span className="verified">✓ Email verified</span>
                ) : (
                  <span>Email not verified</span>`,
    "Admin member email verification status",
  );

  source = replaceOnce(
    source,
    `<div><span>Verification</span><strong>{selected.verified ? "Verified" : "Not verified"}</strong></div>`,
    `<div><span>Email verification</span><strong>{selected.verified ? "Verified" : "Not verified"}</strong></div>`,
    "Admin email verification detail",
  );

  source = replaceOnce(
    source,
    `              <button type="button" className="ad-dialog-primary" onClick={toggleVerify}>
                {selectedView.verified ? "Remove Verification" : "Verify Member"}
              </button>
`,
    ``,
    "Remove admin verify/unverify button",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Contact mail: receipt + alias notification with Reply-To                   */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/modules/contact/contact.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `    const recipient = this.config.get<string>("CONTACT_EMAIL");
    if (recipient) {
      await this.mail.send(recipient, \`Contact: \${input.subject}\`, \`\${input.name} (\${email})\\n\\n\${input.message}\`).catch(() => undefined);
    }

    await this.mail
      .send(
        email,
        "We received your message",
        \`Hi \${input.name},\\n\\nThanks for contacting M. Dadu Films. We have received your message about "\${input.subject}".\`,
      )
      .catch(() => undefined);`,
    `    const recipient = this.config.get<string>("CONTACT_EMAIL");
    if (recipient) {
      await this.mail
        .send(
          recipient,
          \`New contact: \${input.subject}\`,
          \`Name: \${input.name.trim()}\\nEmail: \${email}\\nSubject: \${input.subject.trim()}\\n\\n\${input.message.trim()}\`,
          { replyTo: email, eyebrow: "Website enquiry" },
        )
        .catch(() => undefined);
    }

    await this.mail
      .send(
        email,
        "We received your message",
        \`Hi \${input.name.trim()},\\n\\nThanks for contacting M. Dadu Films. We received your message about "\${input.subject.trim()}". Our team will review it and respond when appropriate.\`,
        { eyebrow: "Contact confirmation" },
      )
      .catch(() => undefined);`,
    "Contact emails",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Careers: applicant + careers@ alias + status email                         */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/modules/careers/career.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";`,
    `import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";`,
    "Career ConfigService import",
  );

  source = replaceOnce(
    source,
    `    @InjectModel("CareerApplication") private readonly careers: Model<CareerApplication>,
    private readonly mail: MailService,
    private readonly audit: AuditService,`,
    `    @InjectModel("CareerApplication") private readonly careers: Model<CareerApplication>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,`,
    "Career ConfigService injection",
  );

  source = replaceOnce(
    source,
    `    await this.mail
      .send(
        input.email,
        "Career application received",
        \`Thank you for applying for \${input.role}. We have received your application and will contact you if your profile matches an opening.\`,
      )
      .catch(() => undefined);

    return this.serialize(application.toObject());`,
    `    await this.mail
      .send(
        input.email,
        "Career application received",
        \`Hi \${input.name.trim()},\\n\\nThank you for applying for \${input.role.trim()}. We received your application and will contact you if your profile matches an opening.\`,
        { eyebrow: "Careers" },
      )
      .catch(() => undefined);

    const recipient = this.config.get<string>("CAREERS_EMAIL");
    if (recipient) {
      await this.mail
        .send(
          recipient,
          \`Career application: \${input.role.trim()}\`,
          \`Name: \${input.name.trim()}\\nEmail: \${input.email}\\nMobile: \${input.mobile.trim()}\\nRole: \${input.role.trim()}\\nCity: \${input.city?.trim() || "Not provided"}\\n\\nCover note:\\n\${input.coverNote.trim()}\`,
          { replyTo: input.email, eyebrow: "New career application" },
        )
        .catch(() => undefined);
    }

    return this.serialize(application.toObject());`,
    "Career receipt and internal notification",
  );

  source = replaceOnce(
    source,
    `.send(item.email, "Career application status updated", \`Your application for \${item.role} is now \${item.status}.\`)`,
    `.send(
          item.email,
          "Career application status updated",
          \`Hi \${item.name},\\n\\nYour application for \${item.role} is now \${item.status}.\`,
          { eyebrow: "Careers" },
        )`,
    "Career status themed email",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Casting/project applications: member + production@ alias + status          */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/modules/applications/application.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";`,
    `import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";`,
    "Application ConfigService import",
  );

  source = replaceOnce(
    source,
    `    private readonly media: MediaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,`,
    `    private readonly media: MediaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,`,
    "Application ConfigService injection",
  );

  source = replaceOnce(
    source,
    `      await this.mail
        .send(account.email, "Application received", \`Your application for \${opportunity.title} has been received.\`)
        .catch(() => undefined);

      return this.serialize(application.toObject());`,
    `      await this.mail
        .send(
          account.email,
          "Application received",
          \`Hi \${account.name},\\n\\nYour application for \${opportunity.title} has been received. You can track its status from your member dashboard.\`,
          { eyebrow: "Application confirmation" },
        )
        .catch(() => undefined);

      const recipient = this.config.get<string>("PRODUCTION_EMAIL");
      if (recipient) {
        await this.mail
          .send(
            recipient,
            \`New application: \${opportunity.title}\`,
            \`Name: \${account.name}\\nEmail: \${account.email}\\nMobile: \${account.mobile}\\nType: \${opportunity.type}\\nOpportunity: \${opportunity.title}\\nRole: \${opportunity.role || "Not specified"}\`,
            { replyTo: account.email, eyebrow: "New production application" },
          )
          .catch(() => undefined);
      }

      return this.serialize(application.toObject());`,
    "Application receipt and internal notification",
  );

  source = replaceOnce(
    source,
    `          \`Your application for \${application.opportunityTitle} is now \${memberStatus}.\`,
        )`,
    `          \`Hi \${application.applicant.name},\\n\\nYour application for \${application.opportunityTitle} is now \${memberStatus}.\`,
          { eyebrow: "Application update" },
        )`,
    "Application status themed email",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* SMTP/environment configuration                                             */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/config/environment.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `  const cookieDomain = String(input.COOKIE_DOMAIN ?? "").trim();
  if (cookieDomain && /[/\\s:]/.test(cookieDomain)) throw new Error("COOKIE_DOMAIN must be a hostname/domain without scheme or path.");
  return {`,
    `  const cookieDomain = String(input.COOKIE_DOMAIN ?? "").trim();
  if (cookieDomain && /[/\\s:]/.test(cookieDomain)) throw new Error("COOKIE_DOMAIN must be a hostname/domain without scheme or path.");

  const smtpKeys = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"];
  const smtpConfigured = smtpKeys.some((key) => String(input[key] ?? "").trim());

  if (smtpConfigured && smtpKeys.some((key) => !String(input[key] ?? "").trim())) {
    throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_FROM must be configured together.");
  }

  if (
    nodeEnv === "production" &&
    [...smtpKeys, "CONTACT_EMAIL", "CAREERS_EMAIL", "PRODUCTION_EMAIL"].some(
      (key) => !String(input[key] ?? "").trim(),
    )
  ) {
    throw new Error(
      "Production requires SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, CONTACT_EMAIL, CAREERS_EMAIL and PRODUCTION_EMAIL.",
    );
  }

  return {`,
    "SMTP production validation",
  );

  outputs.set(path, restoreEol(source, eol));
}

{
  const path = "apps/api/.env.example";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `# SMTP
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
CONTACT_EMAIL=`,
    `# SMTP / HOSTINGER EMAIL
# Authenticate using the one real mailbox. Never commit SMTP_PASSWORD.
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hello@mdadufilms.com
SMTP_PASSWORD=
SMTP_FROM="M. Dadu Films <hello@mdadufilms.com>"

# Hostinger aliases (all may deliver into hello@mdadufilms.com)
CONTACT_EMAIL=contact@mdadufilms.com
CAREERS_EMAIL=careers@mdadufilms.com
PRODUCTION_EMAIL=production@mdadufilms.com`,
    "Hostinger SMTP env example",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Security + frontend auth client exemptions                                 */
/* -------------------------------------------------------------------------- */

{
  const path = "apps/api/src/common/middleware/security.middleware.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `      { match: "/auth/register", scope: "auth-register-ip", limit: 10, windowMs: 3600000 },
      { match: "/auth/forgot-password", scope: "auth-forgot-ip", limit: 8, windowMs: 3600000 },`,
    `      { match: "/auth/register", scope: "auth-register-ip", limit: 10, windowMs: 3600000 },
      { match: "/auth/verify-email", scope: "auth-verify-ip", limit: 30, windowMs: 3600000 },
      { match: "/auth/resend-verification", scope: "auth-resend-verify-ip", limit: 8, windowMs: 3600000 },
      { match: "/auth/forgot-password", scope: "auth-forgot-ip", limit: 8, windowMs: 3600000 },`,
    "Verification IP rate limits",
  );

  source = replaceOnce(
    source,
    `      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",`,
    `      "/auth/register",
      "/auth/verify-email",
      "/auth/resend-verification",
      "/auth/forgot-password",
      "/auth/reset-password",`,
    "Verification CSRF exemptions",
  );

  outputs.set(path, restoreEol(source, eol));
}

{
  const path = "apps/web/src/services/api.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `const EXEMPT = new Set(["/auth/login", "/auth/google", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/contact"]);`,
    `const EXEMPT = new Set([
  "/auth/login",
  "/auth/google",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/contact",
]);`,
    "Frontend auth CSRF exemptions",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* Signup message */
{
  const path = "apps/web/src/components/account-form.tsx";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `      } else if (mode === "signup") {
        toast.success("Account created successfully.");
      } else {`,
    `      } else if (mode === "signup") {
        toast.success(
          result.verified
            ? "Account created successfully."
            : "Account created. Check your email to verify your email address.",
        );
      } else {`,
    "Signup verification feedback",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Verification page                                                         */
/* -------------------------------------------------------------------------- */

outputs.set(
  verifyPage,
  `"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { api } from "@/services/api";
import { refreshSession } from "@/services/auth-session";

type VerificationState = "checking" | "success" | "error" | "missing";

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerificationState>("checking");
  const [message, setMessage] = useState("Verifying your email address…");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";

    if (!token) {
      setState("missing");
      setMessage("Open the verification link from your email, or request a new link below.");
      return;
    }

    void api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(async (result) => {
        window.history.replaceState(null, "", "/verify-email");
        await refreshSession().catch(() => undefined);
        setState("success");
        setMessage(result.message);
      })
      .catch((error) => {
        window.history.replaceState(null, "", "/verify-email");
        setState("error");
        setMessage(error instanceof Error ? error.message : "Unable to verify this email.");
      });
  }, []);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resending) return;

    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) return;

    setResending(true);
    setResendMessage("");

    try {
      const result = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendMessage(result.message);
      form.reset();
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : "Unable to request a new verification email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] px-5 py-12">
      <div className="mx-auto max-w-xl">
        <Link href="/" aria-label="M. Dadu Films home" className="inline-flex">
          <BrandLogo darkInk className="!w-[132px]" />
        </Link>

        <section className="site-card mt-8 p-7 sm:p-10">
          <p className="site-kicker">Account verification</p>
          <h1 className="font-display mt-3 text-4xl font-semibold">
            {state === "success" ? "Email verified" : "Verify your email"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#666]">{message}</p>

          {state === "success" ? (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/member" className="site-button site-button-primary">
                Go to Dashboard
              </Link>
              <Link href="/" className="site-button site-button-outline">
                Back to Website
              </Link>
            </div>
          ) : (
            <form onSubmit={resend} className="mt-8 border-t border-black/6 pt-7">
              <label className="grid gap-2 text-sm font-semibold">
                Need a new verification link?
                <input
                  className="field"
                  name="email"
                  type="email"
                  placeholder="Enter your registered email"
                  required
                />
              </label>

              <button type="submit" disabled={resending} className="site-button site-button-primary mt-4">
                {resending ? "Sending…" : "Resend Verification Email"}
              </button>

              {resendMessage && <p className="mt-4 text-sm leading-6 text-[#666]">{resendMessage}</p>}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
`,
);

/* -------------------------------------------------------------------------- */
/* Integration contract: verified is email verification, not admin action     */
/* -------------------------------------------------------------------------- */

{
  const path = "scripts/integration-test.mjs";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `  const memberId = r.data.id;
  const registration = r;

  r = await request("/analytics/visit", { method: "POST", state: visitor });`,
    `  const memberId = r.data.id;
  const registration = r;
  assert.equal(r.data.verified, false);

  const verificationToken = randomBytes(32).toString("base64url");
  await mongoose.connection.collection("emailverifications").deleteMany({
    accountId: new mongoose.Types.ObjectId(memberId),
  });
  await mongoose.connection.collection("emailverifications").insertOne({
    accountId: new mongoose.Types.ObjectId(memberId),
    tokenHash: createHash("sha256").update(verificationToken).digest(),
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
  });

  r = await request("/auth/verify-email", {
    method: "POST",
    body: { token: verificationToken },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(
    (await mongoose.connection.collection("accounts").findOne({ _id: new mongoose.Types.ObjectId(memberId) })).verified,
    true,
  );
  assert.equal((await request("/auth/me", { state: member })).data.verified, true);
  assert.equal(
    (await request("/auth/verify-email", { method: "POST", body: { token: verificationToken } })).status,
    400,
  );
  assert.equal(
    (await request("/auth/resend-verification", { method: "POST", body: { email: memberInput.email } })).status,
    201,
  );

  r = await request("/analytics/visit", { method: "POST", state: visitor });`,
    "Email verification integration flow",
  );

  source = replaceOnce(
    source,
    `  r = await request(\`/admin/members/\${memberId}\`, { method: "PATCH", state: admin, body: { verified: true } });
  assert.equal(r.status, 200);
  r = await request("/talent?city=Indore&profession=Actor");`,
    `  r = await request("/talent?city=Indore&profession=Actor");`,
    "Remove admin manual verification from integration flow",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Atomic write: all transformations above had to succeed first               */
/* -------------------------------------------------------------------------- */

for (const [path, content] of outputs) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, "utf8");
}

console.log("PATCH APPLIED: Hostinger SMTP + transactional email system");
console.log("");
console.log("Important:");
console.log("  verified = email verified (existing field)");
console.log("  no separate emailVerified field was added");
console.log("  admin manual verify/unverify was removed");
console.log("  .env.dev and .env.prod were NOT touched");
console.log("");
console.log(git("status", "--short", "--", ...targets, verifyPage));
