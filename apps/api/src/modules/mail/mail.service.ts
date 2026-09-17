import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly config: ConfigService) {}
  async send(to: string, subject: string, text: string) {
    const host = this.config.get<string>("SMTP_HOST");
    if (!host) {
      if (this.config.get("NODE_ENV") === "production")
        throw new Error("SMTP is not configured.");
      const directory = join(process.cwd(), ".local", "mail");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(
        join(directory, `${randomUUID()}.json`),
        JSON.stringify({ to, subject, text, createdAt: new Date() }),
        { mode: 0o600 },
      );
      this.logger.log(
        "Development email saved to the private local mail outbox.",
      );
      return;
    }
    const port = Number(this.config.get("SMTP_PORT") ?? 465);
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: this.config.get<string>("SMTP_USER"),
        pass: this.config.get<string>("SMTP_PASSWORD"),
      },
    });
    await transport.sendMail({
      from: this.config.get<string>("SMTP_FROM"),
      to,
      subject,
      text,
    });
  }
}
