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

    return {
      ...casting,
      _id: String((casting as { _id: unknown })._id),
      projectId: item.projectId ? String(item.projectId) : undefined,
      coverMediaId: coverId,
      coverImage: coverId ? this.media.urlsFor(coverId).large : undefined,
      closingSoon:
        item.status === "Open" && !!deadline && deadline.getTime() > Date.now() && deadline.getTime() < Date.now() + 7 * 86_400_000,
      acceptingApplications: item.published && !item.archived && item.status === "Open" && (!deadline || deadline.getTime() > Date.now()),
    };
  }

  listPublic(query: CastingQueryDto) {
    return this.list(query, false);
  }

  listAdmin(query: CastingQueryDto) {
    return this.list(query, true);
  }

  private async list(query: CastingQueryDto, admin: boolean) {
    const filter: Record<string, unknown> = {
      archived: false,
      ...(admin
        ? {}
        : {
            published: true,
            status: "Open",
          }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.location
        ? {
            location: new RegExp(escapeSearch(query.location.trim()), "i"),
          }
        : {}),
      ...(query.projectId ? { projectId: objectId(query.projectId) } : {}),
      ...(query.closingSoon
        ? {
            status: "Open",
            deadline: {
              $gt: new Date(),
              $lt: new Date(Date.now() + 7 * 86_400_000),
            },
          }
        : {}),
    };

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");

      filter.$or = [{ title: search }, { role: search }, { summary: search }, { location: search }];
    }

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
    await this.media.assertOwnedBy(actorId, [input.coverMediaId]);

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
      ageMin: existing.ageMin,
      ageMax: existing.ageMax,
      deadline: existing.deadline?.toISOString(),
      shootDate: existing.shootDate?.toISOString(),
      ...input,
    });
    await this.media.assertOwnedBy(actorId, [input.coverMediaId]);

    const update: Record<string, unknown> = {
      ...input,
      updatedBy: new Types.ObjectId(actorId),
    };

    if (input.projectId) {
      update.projectId = new Types.ObjectId(input.projectId);
    }

    if (input.coverMediaId) {
      update.coverMediaId = new Types.ObjectId(input.coverMediaId);
    }

    if (input.shootDate !== undefined) {
      update.shootDate = new Date(input.shootDate);
    }

    if (input.deadline !== undefined) {
      update.deadline = new Date(input.deadline);
    }

    const casting = await this.castings.findOneAndUpdate(
      {
        _id: objectId(id),
        archived: false,
      },
      { $set: update },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!casting) {
      throw new NotFoundException("Casting call not found.");
    }

    if (casting.published && casting.coverMediaId) {
      await this.media.makePublic([String(casting.coverMediaId)]);
    }

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
