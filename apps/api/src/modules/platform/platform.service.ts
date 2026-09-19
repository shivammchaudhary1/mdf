import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { MediaService } from "../media/media.service";
import { Project } from "../projects/project.model";
import { ContentDto, ContentQueryDto, UpdateContentDto } from "./platform.dto";
import { ContentKind, contentKinds, ContentRecord } from "./platform.models";

@Injectable()
export class PlatformService {
  constructor(
    @InjectModel("Content") private readonly content: Model<ContentRecord>,
    @InjectModel("Project") private readonly projects: Model<Project>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  private kind(k: string) {
    if (!(contentKinds as readonly string[]).includes(k)) throw new NotFoundException("Content type not found.");
    return k as ContentKind;
  }

  private serialize(item: ContentRecord | Record<string, unknown>) {
    const record = item as ContentRecord;
    const cover = record.coverMediaId ? String(record.coverMediaId) : undefined;
    const ids = (record.mediaIds ?? []).map(String);
    return {
      ...item,
      _id: String((item as { _id: unknown })._id),
      projectId: record.projectId ? String(record.projectId) : undefined,
      coverMediaId: cover,
      coverImage: cover ? this.media.urlsFor(cover).large : undefined,
      mediaIds: ids,
      media: ids.map((id) => this.media.urlsFor(id).large),
    };
  }

  async list(kind: string, q: ContentQueryDto, admin = false) {
    const filter: Record<string, unknown> = {
      kind: this.kind(kind),
      archived: false,
      ...(admin
        ? {}
        : { published: true, $or: [{ publishedAt: { $exists: false } }, { publishedAt: null }, { publishedAt: { $lte: new Date() } }] }),
      ...(q.category ? { category: q.category } : {}),
      ...(q.projectId ? { projectId: objectId(q.projectId) } : {}),
    };
    const conditions: Record<string, unknown>[] = [];
    if (q.status) {
      if (q.status === "Published") conditions.push({ $or: [{ status: "Published" }, { status: { $exists: false }, published: true }] });
      else if (q.status === "Draft") conditions.push({ $or: [{ status: "Draft" }, { status: { $exists: false }, published: false }] });
      else conditions.push({ status: q.status });
    }
    if (q.search) {
      const s = new RegExp(escapeSearch(q.search.trim()), "i");
      conditions.push({ $or: [{ title: s }, { description: s }, { category: s }] });
    }
    if (conditions.length) filter.$and = conditions;
    const [result] = await this.content.aggregate<{ items: ContentRecord[]; total: { count: number }[] }>([
      { $match: filter },
      { $sort: { order: 1, createdAt: -1, _id: -1 } },
      { $facet: { items: [{ $skip: (q.page - 1) * q.limit }, { $limit: q.limit }], total: [{ $count: "count" }] } },
    ]);
    const items = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);
    return { items: items.map((item) => this.serialize(item)), meta: pageMeta(q.page, q.limit, total) };
  }

  async publicItem(kind: string, slug: string) {
    const item = await this.content
      .findOne({
        kind: this.kind(kind),
        slug,
        published: true,
        archived: false,
        $or: [{ publishedAt: { $exists: false } }, { publishedAt: null }, { publishedAt: { $lte: new Date() } }],
      })
      .lean();
    if (!item) throw new NotFoundException("Content not found.");
    return this.serialize(item);
  }

  async adminItem(kind: string, id: string) {
    const item = await this.content.findOne({ _id: objectId(id), kind: this.kind(kind) }).lean();
    if (!item) throw new NotFoundException("Content not found.");
    return this.serialize(item);
  }

  private async validate(input: ContentDto | UpdateContentDto, actorId: string) {
    if (
      input.data &&
      (Object.keys(input.data).length > 60 ||
        Object.entries(input.data).some(([k, v]) => !/^[a-zA-Z][a-zA-Z0-9_]{0,60}$/.test(k) || typeof v !== "string" || v.length > 10000))
    ) {
      throw new BadRequestException("Settings values must be short named text fields.");
    }

    if (input.status === "Scheduled") {
      if (!input.publishedAt || new Date(input.publishedAt).getTime() <= Date.now()) {
        throw new BadRequestException("Scheduled content requires a future publish date.");
      }
    }

    await this.media.assertOwnedBy(actorId, [input.coverMediaId, ...(input.mediaIds ?? [])]);

    if (input.projectId && !(await this.projects.exists({ _id: objectId(input.projectId, "Project not found."), archived: false }))) {
      throw new BadRequestException("Project not found.");
    }
  }

  async create(kind: string, input: ContentDto, actorId: string) {
    const k = this.kind(kind);
    await this.validate(input, actorId);

    const status = input.status ?? (input.published ? "Published" : "Draft");
    const published = status === "Published" || status === "Scheduled" ? true : (input.published ?? false);
    const publishedAt =
      input.publishedAt === null
        ? undefined
        : input.publishedAt
          ? new Date(input.publishedAt)
          : published && status !== "Scheduled"
            ? new Date()
            : undefined;

    try {
      const item = await this.content.create({
        ...input,
        status,
        published,
        publishedAt,
        videoUrl: input.videoUrl ?? undefined,
        kind: k,
        coverMediaId: input.coverMediaId ? new Types.ObjectId(input.coverMediaId) : undefined,
        mediaIds: input.mediaIds?.map((id) => new Types.ObjectId(id)),
        projectId: input.projectId ? new Types.ObjectId(input.projectId) : undefined,
        createdBy: new Types.ObjectId(actorId),
        updatedBy: new Types.ObjectId(actorId),
      });

      const mediaIds = [input.coverMediaId, ...(input.mediaIds ?? [])];
      if (item.published) await this.media.makePublic(mediaIds);
      else await this.media.makePrivate(mediaIds);

      await this.audit.record({ actorId, action: "content.create", entityType: k, entityId: String(item._id), summary: item.title });
      return this.serialize(item.toObject());
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        throw new ConflictException("This content slug is already in use.");
      }
      throw error;
    }
  }

  async update(kind: string, id: string, input: UpdateContentDto, actorId: string) {
    const k = this.kind(kind);
    const existing = await this.content.findOne({ _id: objectId(id), kind: k, archived: false }).lean();
    if (!existing) throw new NotFoundException("Content not found.");

    const mergedStatus = input.status ?? existing.status ?? (existing.published ? "Published" : "Draft");
    const mergedPublishedAt =
      input.publishedAt === null ? undefined : input.publishedAt !== undefined ? input.publishedAt : existing.publishedAt?.toISOString();

    await this.validate(
      {
        ...input,
        status: mergedStatus,
        publishedAt: mergedPublishedAt,
      },
      actorId,
    );

    const oldMedia = [existing.coverMediaId ? String(existing.coverMediaId) : undefined, ...(existing.mediaIds ?? []).map(String)];

    const update: Record<string, unknown> = { ...input, updatedBy: new Types.ObjectId(actorId) };
    const unset: Record<string, 1> = {};

    if (input.status !== undefined) {
      update.published = input.status === "Published" || input.status === "Scheduled";
    } else if (input.published !== undefined) {
      update.status = input.published ? "Published" : "Draft";
    }

    if (input.publishedAt === null) {
      delete update.publishedAt;
      unset.publishedAt = 1;
    } else if (input.publishedAt !== undefined) {
      update.publishedAt = new Date(input.publishedAt);
    } else if (update.published === true && !existing.publishedAt && mergedStatus !== "Scheduled") {
      update.publishedAt = new Date();
    }

    if (input.coverMediaId === null) {
      delete update.coverMediaId;
      unset.coverMediaId = 1;
    } else if (input.coverMediaId) {
      update.coverMediaId = new Types.ObjectId(input.coverMediaId);
    }

    if (input.mediaIds !== undefined) {
      update.mediaIds = input.mediaIds.map((value) => new Types.ObjectId(value));
    }

    if (input.videoUrl === null) {
      delete update.videoUrl;
      unset.videoUrl = 1;
    }

    if (input.projectId === null) {
      delete update.projectId;
      unset.projectId = 1;
    } else if (input.projectId) {
      update.projectId = new Types.ObjectId(input.projectId);
    }

    const item = await this.content.findOneAndUpdate(
      { _id: objectId(id), kind: k, archived: false },
      { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true, runValidators: true },
    );
    if (!item) throw new NotFoundException("Content not found.");

    const currentMedia = [item.coverMediaId ? String(item.coverMediaId) : undefined, ...(item.mediaIds ?? []).map(String)];

    if (item.published) await this.media.makePublic(currentMedia);
    else await this.media.makePrivate(currentMedia);
    await this.media.makePrivate(oldMedia);

    const currentIds = new Set(currentMedia.filter((value): value is string => !!value));
    for (const mediaId of oldMedia.filter((value): value is string => !!value && !currentIds.has(value))) {
      await this.media.removeIfUnreferencedOwned(mediaId, actorId);
    }

    await this.audit.record({ actorId, action: "content.update", entityType: k, entityId: id, summary: item.title });
    return this.serialize(item.toObject());
  }

  async archive(kind: string, id: string, actorId: string) {
    const k = this.kind(kind);
    const item = await this.content.findOneAndUpdate(
      { _id: objectId(id), kind: k },
      { $set: { archived: true, published: false, status: "Draft", updatedBy: new Types.ObjectId(actorId) } },
      { new: true },
    );
    if (!item) throw new NotFoundException("Content not found.");

    await this.media.makePrivate([item.coverMediaId ? String(item.coverMediaId) : undefined, ...(item.mediaIds ?? []).map(String)]);

    await this.audit.record({ actorId, action: "content.archive", entityType: k, entityId: id, summary: item.title });
    return { message: "Content archived.", id };
  }
}
