import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { sha256 } from "../../common/utils/crypto";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { MailService } from "../mail/mail.service";
import { ContactDto, ContactQueryDto, ContactUpdateDto } from "./contact.dto";
import { ContactMessage } from "./contact.model";

@Injectable()
export class ContactService {
  constructor(
    @InjectModel("Contact") private readonly contacts: Model<ContactMessage>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async create(input: ContactDto, ip?: string) {
    const pepper = String(this.config.get("COOKIE_SECRET") ?? "development");
    await this.contacts.create({
      ...input,
      email: input.email.trim().toLowerCase(),
      status: "New",
      ipHash: ip ? sha256(`${pepper}:${ip}`) : undefined,
    });
    const recipient = this.config.get<string>("CONTACT_EMAIL");
    if (recipient)
      await this.mail
        .send(recipient, `Contact: ${input.subject}`, `${input.name} (${input.email})\n\n${input.message}`)
        .catch(() => undefined);
    return { message: "Your message has been received." };
  }

  async list(q: ContactQueryDto) {
    const filter: Record<string, unknown> = { ...(q.status ? { status: q.status } : {}) };
    if (q.search) {
      const s = new RegExp(escapeSearch(q.search.trim()), "i");
      filter.$or = [{ name: s }, { email: s }, { subject: s }];
    }
    const [result] = await this.contacts.aggregate<{ items: ContactMessage[]; total: { count: number }[] }>([
      { $match: filter },
      { $project: { ipHash: 0 } },
      { $sort: { createdAt: -1, _id: -1 } },
      { $facet: { items: [{ $skip: (q.page - 1) * q.limit }, { $limit: q.limit }], total: [{ $count: "count" }] } },
    ]);
    const items = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);
    return { items: items.map((item) => ({ ...item, _id: String(item._id) })), meta: pageMeta(q.page, q.limit, total) };
  }

  async detail(id: string) {
    const item = await this.contacts.findById(objectId(id)).lean();
    if (!item) throw new NotFoundException("Contact query not found.");
    return { ...item, _id: String(item._id) };
  }
  async update(id: string, input: ContactUpdateDto, actorId: string) {
    const item = await this.contacts.findByIdAndUpdate(
      objectId(id),
      { $set: { status: input.status } },
      { new: true, runValidators: true },
    );
    if (!item) throw new NotFoundException("Contact query not found.");
    await this.audit.record({
      actorId,
      action: "contact.update",
      entityType: "contact",
      entityId: id,
      summary: item.subject,
      metadata: { status: item.status },
    });
    return { ...item.toObject(), _id: String(item._id) };
  }
  async remove(id: string, actorId: string) {
    const item = await this.contacts.findByIdAndDelete(objectId(id));
    if (!item) throw new NotFoundException("Contact query not found.");
    await this.audit.record({ actorId, action: "contact.delete", entityType: "contact", entityId: id, summary: item.subject });
    return { message: "Contact query deleted." };
  }
}
