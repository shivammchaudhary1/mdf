import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const EXPECTED_BRANCH = "feature/hostinger-smtp";

const targets = [
  "apps/api/.env.example",
  "apps/api/src/config/environment.ts",
  "apps/api/src/modules/applications/application.service.ts",
  "apps/api/src/modules/auth/auth.service.ts",
  "apps/api/src/modules/careers/career.service.ts",
  "apps/api/src/modules/contact/contact.service.ts",
  "apps/api/src/modules/mail/mail.service.ts",
];

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

const originals = new Map();
for (const path of targets) originals.set(path, await readFile(resolve(path), "utf8"));
const outputs = new Map();

/* -------------------------------------------------------------------------- */
/* MailService: optional alias From while SMTP auth remains hello@             */
/* -------------------------------------------------------------------------- */
{
  const path = "apps/api/src/modules/mail/mail.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `type MailOptions = {
  action?: MailAction;
  eyebrow?: string;
  replyTo?: string;
};`,
    `type MailOptions = {
  action?: MailAction;
  eyebrow?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
};`,
    "Mail options From fields",
  );

  source = replaceOnce(
    source,
    `      await transport.sendMail({
        from: this.config.get<string>("SMTP_FROM"),
        to,
        subject: safeSubject,
        text,
        html,
        replyTo: options.replyTo,
      });`,
    `      const aliasFrom = options.from?.trim();
      const from = aliasFrom
        ? \`\${options.fromName?.trim() || "M. Dadu Films"} <\${aliasFrom}>\`
        : this.config.get<string>("SMTP_FROM");

      await transport.sendMail({
        from,
        to,
        subject: safeSubject,
        text,
        html,
        replyTo: options.replyTo,
      });`,
    "Mail sender alias routing",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* AUTH: all automatic account/security emails come from noreply@              */
/* -------------------------------------------------------------------------- */
{
  const path = "apps/api/src/modules/auth/auth.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `  private frontendOrigin() {
    return String(this.config.get("FRONTEND_URL") ?? "http://localhost:3333").split(",")[0];
  }

  private async sendVerification`,
    `  private frontendOrigin() {
    return String(this.config.get("FRONTEND_URL") ?? "http://localhost:3333").split(",")[0];
  }

  private transactionalFrom() {
    return this.config.get<string>("NOREPLY_EMAIL")?.trim() || undefined;
  }

  private async sendVerification`,
    "Auth noreply helper",
  );

  source = replaceOnce(
    source,
    `{ action: { label: "Verify Email", url }, eyebrow: "Account verification" },`,
    `{ action: { label: "Verify Email", url }, eyebrow: "Account verification", from: this.transactionalFrom() },`,
    "Verification sender",
  );

  source = replaceOnce(
    source,
    `{ eyebrow: "Account verified" },`,
    `{ eyebrow: "Account verified", from: this.transactionalFrom() },`,
    "Verification success sender",
  );

  source = replaceOnce(
    source,
    `{ action: { label: "Reset Password", url: resetUrl }, eyebrow: "Account security" },`,
    `{ action: { label: "Reset Password", url: resetUrl }, eyebrow: "Account security", from: this.transactionalFrom() },`,
    "Forgot password sender",
  );

  source = replaceOnce(
    source,
    `{ eyebrow: "Account security" },
      )`,
    `{ eyebrow: "Account security", from: this.transactionalFrom() },
      )`,
    "Password changed sender",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* CONTACT: all contact mail uses contact@                                    */
/* -------------------------------------------------------------------------- */
{
  const path = "apps/api/src/modules/contact/contact.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `          { replyTo: email, eyebrow: "Website enquiry" },`,
    `          { replyTo: email, eyebrow: "Website enquiry", from: recipient, fromName: "M. Dadu Films Contact" },`,
    "Internal contact sender",
  );

  source = replaceOnce(
    source,
    `        { eyebrow: "Contact confirmation" },`,
    `        {
          eyebrow: "Contact confirmation",
          from: recipient || this.config.get<string>("CONTACT_EMAIL")?.trim(),
          fromName: "M. Dadu Films Contact",
        },`,
    "Contact receipt sender",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* CAREERS: all career mail uses careers@                                     */
/* -------------------------------------------------------------------------- */
{
  const path = "apps/api/src/modules/careers/career.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `        { eyebrow: "Careers" },
      )`,
    `        {
          eyebrow: "Careers",
          from: this.config.get<string>("CAREERS_EMAIL")?.trim(),
          fromName: "M. Dadu Films Careers",
        },
      )`,
    "Career applicant receipt sender",
  );

  source = replaceOnce(
    source,
    `          { replyTo: input.email, eyebrow: "New career application" },`,
    `          {
            replyTo: input.email,
            eyebrow: "New career application",
            from: recipient,
            fromName: "M. Dadu Films Careers",
          },`,
    "Internal career sender",
  );

  source = replaceOnce(
    source,
    `{ eyebrow: "Careers" },
        )`,
    `{
          eyebrow: "Careers",
          from: this.config.get<string>("CAREERS_EMAIL")?.trim(),
          fromName: "M. Dadu Films Careers",
        },
        )`,
    "Career status sender",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* PRODUCTION: all project/casting application mail uses production@          */
/* -------------------------------------------------------------------------- */
{
  const path = "apps/api/src/modules/applications/application.service.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `          { eyebrow: "Application confirmation" },
        )`,
    `          {
            eyebrow: "Application confirmation",
            from: this.config.get<string>("PRODUCTION_EMAIL")?.trim(),
            fromName: "M. Dadu Films Production",
          },
        )`,
    "Application confirmation sender",
  );

  source = replaceOnce(
    source,
    `            { replyTo: account.email, eyebrow: "New production application" },`,
    `            {
              replyTo: account.email,
              eyebrow: "New production application",
              from: recipient,
              fromName: "M. Dadu Films Production",
            },`,
    "Internal production sender",
  );

  source = replaceOnce(
    source,
    `{ eyebrow: "Application update" },
        )`,
    `{
          eyebrow: "Application update",
          from: this.config.get<string>("PRODUCTION_EMAIL")?.trim(),
          fromName: "M. Dadu Films Production",
        },
        )`,
    "Application status sender",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Environment                                                               */
/* -------------------------------------------------------------------------- */
{
  const path = "apps/api/.env.example";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `# Hostinger aliases (all may deliver into hello@mdadufilms.com)
CONTACT_EMAIL=contact@mdadufilms.com
CAREERS_EMAIL=careers@mdadufilms.com
PRODUCTION_EMAIL=production@mdadufilms.com`,
    `# Hostinger aliases (all may deliver into hello@mdadufilms.com)
# SMTP authentication remains SMTP_USER=hello@mdadufilms.com.
NOREPLY_EMAIL=noreply@mdadufilms.com
CONTACT_EMAIL=contact@mdadufilms.com
CAREERS_EMAIL=careers@mdadufilms.com
PRODUCTION_EMAIL=production@mdadufilms.com`,
    "Alias env example",
  );

  outputs.set(path, restoreEol(source, eol));
}

{
  const path = "apps/api/src/config/environment.ts";
  const { eol, text: original } = normalize(originals.get(path));
  let source = original;

  source = replaceOnce(
    source,
    `[...smtpKeys, "CONTACT_EMAIL", "CAREERS_EMAIL", "PRODUCTION_EMAIL"].some(`,
    `[...smtpKeys, "NOREPLY_EMAIL", "CONTACT_EMAIL", "CAREERS_EMAIL", "PRODUCTION_EMAIL"].some(`,
    "Production alias validation list",
  );

  source = replaceOnce(
    source,
    `"Production requires SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, CONTACT_EMAIL, CAREERS_EMAIL and PRODUCTION_EMAIL.",`,
    `"Production requires SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, NOREPLY_EMAIL, CONTACT_EMAIL, CAREERS_EMAIL and PRODUCTION_EMAIL.",`,
    "Production alias validation message",
  );

  outputs.set(path, restoreEol(source, eol));
}

/* -------------------------------------------------------------------------- */
/* Atomic write                                                              */
/* -------------------------------------------------------------------------- */
for (const [path, content] of outputs) {
  await writeFile(resolve(path), content, "utf8");
}

console.log("PATCH APPLIED: sender aliases routed by email purpose.");
console.log("");
console.log("SMTP auth/fallback: hello@mdadufilms.com");
console.log("Transactional:     noreply@mdadufilms.com");
console.log("Careers:           careers@mdadufilms.com");
console.log("Production:        production@mdadufilms.com");
console.log("Contact:           contact@mdadufilms.com");
console.log("");
console.log(git("status", "--short", "--", ...targets));
