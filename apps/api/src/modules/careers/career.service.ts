import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { RateLimitService } from "../../common/security/rate-limit.service";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { MailService } from "../mail/mail.service";
import { CareerQueryDto, CreateCareerApplicationDto, UpdateCareerApplicationDto } from "./career.dto";
import { CareerApplication } from "./career.model";

@Injectable()
export class CareerService {
  constructor(
    @InjectModel("CareerApplication") private readonly careers: Model<CareerApplication>,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly rateLimits: RateLimitService,
  ) {}

  private serialize(item: CareerApplication | Record<string, unknown>) {
    const record = item as CareerApplication;

    return {
      ...item,
      _id: String((item as { _id: unknown })._id),
      reviewedBy: record.reviewedBy ? String(record.reviewedBy) : undefined,
    };
  }

  async create(input: CreateCareerApplicationDto, requestKey: string) {
    await this.rateLimits.consume("career-application", `${requestKey}:${input.email}`, 5, 24 * 60 * 60 * 1000);

    const application = await this.careers.create({
      ...input,
      name: input.name.trim(),
      mobile: input.mobile.trim(),
      role: input.role.trim(),
      city: input.city?.trim() || undefined,
      coverNote: input.coverNote.trim(),
      status: "Submitted",
    });

    await this.mail
      .send(
        input.email,
        "Career application received",
        `Thank you for applying for ${input.role}. We have received your application and will contact you if your profile matches an opening.`,
      )
      .catch(() => undefined);

    return this.serialize(application.toObject());
  }

  async list(query: CareerQueryDto) {
    const filter: Record<string, unknown> = {
      ...(query.status ? { status: query.status } : {}),
    };

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");
      filter.$or = [{ name: search }, { email: search }, { role: search }, { city: search }];
    }

    const [result] = await this.careers.aggregate<{ items: CareerApplication[]; total: { count: number }[] }>([
      { $match: filter },
      { $sort: { createdAt: -1, _id: -1 } },
      { $facet: { items: [{ $skip: (query.page - 1) * query.limit }, { $limit: query.limit }], total: [{ $count: "count" }] } },
    ]);
    const items = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);

    return {
      items: items.map((item) => this.serialize(item)),
      meta: pageMeta(query.page, query.limit, total),
    };
  }

  async detail(id: string) {
    const item = await this.careers.findById(objectId(id)).lean();
    if (!item) throw new NotFoundException("Career application not found.");
    return this.serialize(item);
  }

  async update(id: string, input: UpdateCareerApplicationDto, actorId: string) {
    const existing = await this.careers.findById(objectId(id)).lean();
    if (!existing) throw new NotFoundException("Career application not found.");

    const item = await this.careers.findByIdAndUpdate(
      objectId(id),
      {
        $set: {
          status: input.status,
          ...(input.adminNotes !== undefined ? { adminNotes: input.adminNotes.trim() } : {}),
          reviewedBy: new Types.ObjectId(actorId),
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!item) throw new NotFoundException("Career application not found.");

    if (existing.status !== item.status) {
      await this.mail
        .send(item.email, "Career application status updated", `Your application for ${item.role} is now ${item.status}.`)
        .catch(() => undefined);
    }

    await this.audit.record({
      actorId,
      action: "career-application.update",
      entityType: "career-application",
      entityId: id,
      summary: `${item.name} → ${item.status}`,
      metadata: { status: item.status },
    });

    return this.serialize(item.toObject());
  }
}
