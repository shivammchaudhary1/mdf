import { randomUUID } from "node:crypto";
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
  from?: string;
  fromName?: string;
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
  return escapeHtml(text).replace(/\n/g, "<br>");
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
      ? `
        <tr>
          <td style="padding:4px 32px 28px">
            <a href="${escapeHtml(options.action.url)}"
               style="display:inline-block;background:#ea2f3c;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:700;padding:14px 22px;border-radius:8px">
              ${escapeHtml(options.action.label)}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;color:#747474;font-family:Arial,sans-serif;font-size:12px;line-height:1.6">
            If the button does not work, copy this link:<br>
            <span style="word-break:break-all;color:#111111">${escapeHtml(options.action.url)}</span>
          </td>
        </tr>`
      : "";

    return `<!doctype html>
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
                  ${escapeHtml(options.eyebrow ?? "M. Dadu Films")}
                </div>
                <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:600;color:#111111">
                  ${escapeHtml(subject)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.75;color:#4b4b4b">
                ${textToHtml(text)}
              </td>
            </tr>
            ${action}
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
</html>`;
  }

  async send(to: string, subject: string, text: string, options: MailOptions = {}) {
    const safeSubject = subject.replace(/[\r\n]+/g, " ").slice(0, 180);
    const transport = this.getTransport();
    const html = this.html(safeSubject, text, options);

    if (!transport) {
      if (this.config.get("NODE_ENV") === "production") throw new Error("SMTP is not configured.");

      const directory = join(process.cwd(), ".local", "mail");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(
        join(directory, `${randomUUID()}.json`),
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
      const aliasFrom = options.from?.trim();
      const from = aliasFrom
        ? `${options.fromName?.trim() || "M. Dadu Films"} <${aliasFrom}>`
        : this.config.get<string>("SMTP_FROM");

      await transport.sendMail({
        from,
        to,
        subject: safeSubject,
        text,
        html,
        replyTo: options.replyTo,
      });
    } catch (error) {
      this.logger.error(
        `Email delivery failed for ${to}: ${error instanceof Error ? error.message : "Unknown SMTP error"}`,
      );
      throw error;
    }
  }
}
