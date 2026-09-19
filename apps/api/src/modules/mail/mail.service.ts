import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transport?: Transporter;
  constructor(private readonly config: ConfigService) {}

  private getTransport() {
    if (this.transport) return this.transport;
    const host = this.config.get<string>("SMTP_HOST");
    if (!host) return undefined;
    const port = Number(this.config.get("SMTP_PORT") ?? 465);
    this.transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: { user: this.config.get<string>("SMTP_USER"), pass: this.config.get<string>("SMTP_PASSWORD") },
    });
    return this.transport;
  }

  async send(to: string, subject: string, text: string) {
    const safeSubject = subject.replace(/[\r\n]+/g, " ").slice(0, 180);
    const transport = this.getTransport();
    if (!transport) {
      if (this.config.get("NODE_ENV") === "production") throw new Error("SMTP is not configured.");
      const directory = join(process.cwd(), ".local", "mail");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(
        join(directory, `${randomUUID()}.json`),
        JSON.stringify({ to, subject: safeSubject, text, createdAt: new Date().toISOString() }),
        { mode: 0o600 },
      );
      this.logger.log("Development email saved to the private local mail outbox.");
      return;
    }
    await transport.sendMail({ from: this.config.get<string>("SMTP_FROM"), to, subject: safeSubject, text });
  }
}
