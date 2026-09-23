import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { MediaService } from "../media/media.service";
import { Project } from "../projects/project.model";
import { CastingQueryDto, CreateCastingDto, UpdateCastingDto } from "./casting.dto";
import { Casting } from "./casting.model";

const DAY_MS = 86_400_000;

function indiaDateKey(now = new Date()) {
  const india = new Date(now.getTime() + 330 * 60_000);
  return new Date(Date.UTC(india.getUTCFullYear(), india.getUTCMonth(), india.getUTCDate()));
}

@Injectable()
export class CastingService {
  constructor(
    @InjectModel("Casting")
    private readonly castings: Model<Casting>,
    @InjectModel("Project")
    private readonly projects: Model<Project>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  private serialize(casting: Casting | Record<string, unknown>) {
    const item = casting as Casting;
    const coverId = item.coverMediaId ? String(item.coverMediaId) : undefined;
    const deadline = item.deadline ? new Date(item.deadline) : undefined;
    const today = indiaDateKey();
    const deadlineExpired = !!deadline && deadline.getTime() < today.getTime();

    return {
      ...casting,
      _id: String((casting as { _id: unknown })._id),
      projectId: item.projectId ? String(item.projectId) : undefined,
      coverMediaId: coverId,
      coverImage: coverId ? this.media.urlsFor(coverId).large : undefined,
      deadlineExpired,
      closingSoon:
        item.status === "Open" &&
        !!deadline &&
        !deadlineExpired &&
        deadline.getTime() < today.getTime() + 7 * DAY_MS,
      acceptingApplications: item.published && !item.archived && item.status === "Open" && !deadlineExpired,
    };
  }

  listPublic(query: CastingQueryDto) {
    return this.list(query, false);
  }

  listAdmin(query: CastingQueryDto) {
    return this.list(query, true);
  }

  private async list(query: CastingQueryDto, admin: boolean) {
    const today = indiaDateKey();
    const activeDeadline = {
      $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: today } }],
    };
    const and: Record<string, unknown>[] = [];

    const filter: Record<string, unknown> = {
      archived: false,
      ...(query.category ? { category: query.category } : {}),
      ...(query.location
        ? {
            location: new RegExp(escapeSearch(query.location.trim()), "i"),
          }
        : {}),
      ...(query.projectId ? { projectId: objectId(query.projectId) } : {}),
    };

    if (!admin) {
      filter.published = true;
      filter.status = "Open";
      and.push(activeDeadline);
    }

    if (admin && query.status === "Open") {
      filter.status = "Open";
      and.push(activeDeadline);
    } else if (admin && query.status === "Closed") {
      and.push({
        $or: [{ status: "Closed" }, { status: "Open", deadline: { $lt: today } }],
      });
    } else if (admin && query.status) {
      filter.status = query.status;
    }

    if (query.closingSoon) {
      filter.status = "Open";
      filter.deadline = {
        $gte: today,
        $lt: new Date(today.getTime() + 7 * DAY_MS),
      };
    }

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");
      and.push({ $or: [{ title: search }, { role: search }, { summary: search }, { location: search }] });
    }

    if (and.length) filter.$and = and;

    const [result] = await this.castings.aggregate<{ items: Casting[]; total: { count: number }[] }>([
      { $match: filter },
      { $sort: { deadline: 1, createdAt: -1, _id: -1 } },
      { $facet: { items: [{ $skip: (query.page - 1) * query.limit }, { $limit: query.limit }], total: [{ $count: "count" }] } },
    ]);
    const items = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);

    const counts = admin
      ? await this.castings.db
          .collection("applications")
          .aggregate<{ _id: Types.ObjectId; count: number }>([
            { $match: { opportunityId: { $in: items.map((item) => item._id) } } },
            { $group: { _id: "$opportunityId", count: { $sum: 1 } } },
          ])
          .toArray()
      : [];
    const totals = new Map(counts.map((item) => [String(item._id), item.count]));
    const ids = [
      ...new Set(
        items
          .map((i) => i.projectId)
          .filter(Boolean)
          .map(String),
      ),
    ].map((id) => new Types.ObjectId(id));
    const rows = ids.length
      ? await this.projects
          .find({ _id: { $in: ids } })
          .select("_id title")
          .lean()
      : [];
    const titles = new Map(rows.map((p) => [String(p._id), p.title]));
    return {
      items: items.map((i) => ({
        ...this.serialize(i),
        projectTitle: i.projectId ? (titles.get(String(i.projectId)) ?? "") : "",
        ...(admin ? { applications: totals.get(String(i._id)) ?? 0 } : {}),
      })),
      meta: pageMeta(query.page, query.limit, total),
    };
  }

  async bySlug(slug: string) {
    const casting = await this.castings
      .findOne({
        slug,
        published: true,
        archived: false,
      })
      .lean();

    if (!casting) {
      throw new NotFoundException("Casting call not found.");
    }

    return this.serialize(casting);
  }

  async byId(id: string) {
    const casting = await this.castings.findById(objectId(id)).lean();

    if (!casting) {
      throw new NotFoundException("Casting call not found.");
    }

    return this.serialize(casting);
  }

  private async validate(input: CreateCastingDto | UpdateCastingDto) {
    if (input.ageMin !== undefined && input.ageMax !== undefined && input.ageMin > input.ageMax) {
      throw new BadRequestException("Minimum age cannot exceed maximum age.");
    }

    if (input.deadline && input.shootDate && new Date(input.deadline) > new Date(input.shootDate)) {
      throw new BadRequestException("Application deadline cannot be after the shoot date.");
    }

    if (
      input.projectId &&
      !(await this.projects.exists({
        _id: objectId(input.projectId, "Project not found."),
        archived: false,
      }))
    ) {
      throw new BadRequestException("Project not found.");
    }
  }

  async create(input: CreateCastingDto, actorId: string) {
    await this.validate(input);
    await this.media.assertOwnedBy(actorId, [input.coverMediaId], "image", "casting");

    const { projectId, coverMediaId, shootDate, deadline, ...rest } = input;

    try {
      const casting = new this.castings({
        ...rest,
        projectId: projectId ? new Types.ObjectId(projectId) : undefined,
        coverMediaId: coverMediaId ? new Types.ObjectId(coverMediaId) : undefined,
        shootDate: shootDate ? new Date(shootDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        createdBy: new Types.ObjectId(actorId),
        updatedBy: new Types.ObjectId(actorId),
      });

      await casting.save();

      if (casting.published && casting.coverMediaId) {
        await this.media.makePublic([String(casting.coverMediaId)]);
      }

      await this.audit.record({
        actorId,
        action: "casting.create",
        entityType: "casting",
        entityId: String(casting._id),
        summary: casting.title,
      });

      return this.serialize(casting.toObject());
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        throw new ConflictException("This casting-call slug is already in use.");
      }

      throw error;
    }
  }

  async update(id: string, input: UpdateCastingDto, actorId: string) {
    const existing = await this.castings.findOne({ _id: objectId(id), archived: false }).lean();
    if (!existing) throw new NotFoundException("Casting call not found.");

    await this.validate({
      ageMin: input.ageMin ?? existing.ageMin,
      ageMax: input.ageMax ?? existing.ageMax,
      deadline: input.deadline === null ? undefined : (input.deadline ?? existing.deadline?.toISOString()),
      shootDate: input.shootDate === null ? undefined : (input.shootDate ?? existing.shootDate?.toISOString()),
      projectId: input.projectId === null ? undefined : input.projectId,
    });
    await this.media.assertOwnedBy(actorId, [input.coverMediaId], "image", "casting");

    const oldCover = existing.coverMediaId ? String(existing.coverMediaId) : undefined;
    const update: Record<string, unknown> = { ...input, updatedBy: new Types.ObjectId(actorId) };
    const unset: Record<string, 1> = {};

    if (input.projectId === null) {
      delete update.projectId;
      unset.projectId = 1;
    } else if (input.projectId) update.projectId = new Types.ObjectId(input.projectId);

    if (input.coverMediaId === null) {
      delete update.coverMediaId;
      unset.coverMediaId = 1;
    } else if (input.coverMediaId) update.coverMediaId = new Types.ObjectId(input.coverMediaId);

    if (input.shootDate === null) {
      delete update.shootDate;
      unset.shootDate = 1;
    } else if (input.shootDate !== undefined) update.shootDate = new Date(input.shootDate);

    if (input.deadline === null) {
      delete update.deadline;
      unset.deadline = 1;
    } else if (input.deadline !== undefined) update.deadline = new Date(input.deadline);

    const casting = await this.castings.findOneAndUpdate(
      { _id: objectId(id), archived: false },
      { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true, runValidators: true },
    );
    if (!casting) throw new NotFoundException("Casting call not found.");

    const currentCover = casting.coverMediaId ? String(casting.coverMediaId) : undefined;
    if (casting.published) await this.media.makePublic([currentCover]);
    else await this.media.makePrivate([currentCover]);
    await this.media.makePrivate([oldCover]);
    if (oldCover && oldCover !== currentCover) await this.media.removeIfUnreferencedOwned(oldCover, actorId);

    await this.audit.record({
      actorId,
      action: "casting.update",
      entityType: "casting",
      entityId: id,
      summary: casting.title,
    });

    return this.serialize(casting.toObject());
  }

  async close(id: string, actorId: string) {
    const casting = await this.castings.findOneAndUpdate(
      {
        _id: objectId(id),
        archived: false,
      },
      {
        $set: {
          status: "Closed",
          updatedBy: new Types.ObjectId(actorId),
        },
      },
      { new: true },
    );

    if (!casting) {
      throw new NotFoundException("Casting call not found.");
    }

    await this.audit.record({
      actorId,
      action: "casting.close",
      entityType: "casting",
      entityId: id,
      summary: casting.title,
    });

    return this.serialize(casting.toObject());
  }

  async archive(id: string, actorId: string) {
    const casting = await this.castings.findByIdAndUpdate(
      objectId(id),
      {
        $set: {
          archived: true,
          published: false,
          status: "Closed",
          updatedBy: new Types.ObjectId(actorId),
        },
      },
      { new: true },
    );

    if (!casting) {
      throw new NotFoundException("Casting call not found.");
    }

    await this.audit.record({
      actorId,
      action: "casting.archive",
      entityType: "casting",
      entityId: id,
      summary: casting.title,
    });

    return {
      message: "Casting call archived.",
      id,
    };
  }
}
