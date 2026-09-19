import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { MediaService } from "../media/media.service";
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from "./project.dto";
import { Project } from "./project.model";

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel("Project")
    private readonly projects: Model<Project>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}

  private serialize(project: Project | Record<string, unknown>) {
    const item = project as Project;
    const coverId = item.coverMediaId ? String(item.coverMediaId) : undefined;
    const galleryIds = (item.galleryMediaIds ?? []).map(String);

    return {
      ...project,
      _id: String((project as { _id: unknown })._id),
      coverMediaId: coverId,
      galleryMediaIds: galleryIds,
      coverImage: coverId ? this.media.urlsFor(coverId).large : undefined,
      galleryImages: galleryIds.map((id) => this.media.urlsFor(id).medium),
    };
  }

  listPublic(query: ProjectQueryDto) {
    return this.list(query, false);
  }

  listAdmin(query: ProjectQueryDto) {
    return this.list(query, true);
  }

  private async list(query: ProjectQueryDto, admin: boolean) {
    const filter: Record<string, unknown> = {
      archived: false,
      ...(admin ? {} : { published: true }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.tag ? { tags: query.tag } : {}),
    };

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");

      filter.$or = [{ title: search }, { summary: search }, { location: search }];
    }

    const [result] = await this.projects.aggregate<{ items: Project[]; total: { count: number }[] }>([
      { $match: filter },
      { $sort: { order: 1, createdAt: -1, _id: -1 } },
      { $facet: { items: [{ $skip: (query.page - 1) * query.limit }, { $limit: query.limit }], total: [{ $count: "count" }] } },
    ]);
    const items = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);

    const counts = admin
      ? await this.projects.db
          .collection("applications")
          .aggregate<{ _id: Types.ObjectId; count: number }>([
            { $match: { projectId: { $in: items.map((item) => item._id) } } },
            { $group: { _id: "$projectId", count: { $sum: 1 } } },
          ])
          .toArray()
      : [];
    const totals = new Map(counts.map((item) => [String(item._id), item.count]));
    return {
      items: items.map((item) => ({ ...this.serialize(item), ...(admin ? { applications: totals.get(String(item._id)) ?? 0 } : {}) })),
      meta: pageMeta(query.page, query.limit, total),
    };
  }

  async bySlug(slug: string) {
    const project = await this.projects
      .findOne({
        slug,
        published: true,
        archived: false,
      })
      .lean();

    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    return this.serialize(project);
  }

  async byId(id: string) {
    const project = await this.projects.findById(objectId(id)).lean();

    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    return this.serialize(project);
  }

  async create(input: CreateProjectDto, actorId: string) {
    if (input.startDate && input.endDate && new Date(input.startDate) > new Date(input.endDate)) {
      throw new BadRequestException("Project end date must follow start date.");
    }

    await this.media.assertOwnedBy(actorId, [input.coverMediaId, ...(input.galleryMediaIds ?? [])], "image", "project");

    const { startDate, endDate, coverMediaId, galleryMediaIds, ...rest } = input;

    try {
      const project = new this.projects({
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        coverMediaId: coverMediaId ? new Types.ObjectId(coverMediaId) : undefined,
        galleryMediaIds: galleryMediaIds?.map((id) => new Types.ObjectId(id)),
        createdBy: new Types.ObjectId(actorId),
        updatedBy: new Types.ObjectId(actorId),
      });

      await project.save();

      if (project.published) {
        await this.media.makePublic([coverMediaId, ...(galleryMediaIds ?? [])]);
      }

      await this.audit.record({
        actorId,
        action: "project.create",
        entityType: "project",
        entityId: String(project._id),
        summary: project.title,
      });

      return this.serialize(project.toObject());
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        throw new ConflictException("This project slug is already in use.");
      }

      throw error;
    }
  }

  async update(id: string, input: UpdateProjectDto, actorId: string) {
    const existing = await this.projects.findOne({ _id: objectId(id), archived: false }).lean();
    if (!existing) throw new NotFoundException("Project not found.");

    const mergedStart =
      input.startDate === null ? undefined : input.startDate !== undefined ? new Date(input.startDate) : existing.startDate;
    const mergedEnd = input.endDate === null ? undefined : input.endDate !== undefined ? new Date(input.endDate) : existing.endDate;
    if (mergedStart && mergedEnd && mergedStart > mergedEnd) {
      throw new BadRequestException("Project end date must follow start date.");
    }

    await this.media.assertOwnedBy(actorId, [input.coverMediaId, ...(input.galleryMediaIds ?? [])], "image", "project");

    const oldMedia = [existing.coverMediaId ? String(existing.coverMediaId) : undefined, ...(existing.galleryMediaIds ?? []).map(String)];
    const update: Record<string, unknown> = { ...input, updatedBy: new Types.ObjectId(actorId) };
    const unset: Record<string, 1> = {};

    if (input.startDate === null) {
      delete update.startDate;
      unset.startDate = 1;
    } else if (input.startDate !== undefined) update.startDate = new Date(input.startDate);

    if (input.endDate === null) {
      delete update.endDate;
      unset.endDate = 1;
    } else if (input.endDate !== undefined) update.endDate = new Date(input.endDate);

    if (input.coverMediaId === null) {
      delete update.coverMediaId;
      unset.coverMediaId = 1;
    } else if (input.coverMediaId) update.coverMediaId = new Types.ObjectId(input.coverMediaId);

    if (input.galleryMediaIds !== undefined) update.galleryMediaIds = input.galleryMediaIds.map((value) => new Types.ObjectId(value));

    if (input.trailerUrl === null) {
      delete update.trailerUrl;
      unset.trailerUrl = 1;
    }

    const project = await this.projects.findOneAndUpdate(
      { _id: objectId(id), archived: false },
      { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { new: true, runValidators: true },
    );
    if (!project) throw new NotFoundException("Project not found.");

    const currentMedia = [project.coverMediaId ? String(project.coverMediaId) : undefined, ...(project.galleryMediaIds ?? []).map(String)];
    if (project.published) await this.media.makePublic(currentMedia);
    else await this.media.makePrivate(currentMedia);
    await this.media.makePrivate(oldMedia);

    const currentIds = new Set(currentMedia.filter((value): value is string => !!value));
    for (const mediaId of oldMedia.filter((value): value is string => !!value && !currentIds.has(value))) {
      await this.media.removeIfUnreferencedOwned(mediaId, actorId);
    }

    await this.audit.record({
      actorId,
      action: "project.update",
      entityType: "project",
      entityId: id,
      summary: project.title,
    });

    return this.serialize(project.toObject());
  }

  async archive(id: string, actorId: string) {
    const project = await this.projects.findByIdAndUpdate(
      objectId(id),
      {
        $set: {
          archived: true,
          published: false,
          status: "Archived",
          updatedBy: new Types.ObjectId(actorId),
        },
      },
      { new: true },
    );

    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    await this.audit.record({
      actorId,
      action: "project.archive",
      entityType: "project",
      entityId: id,
      summary: project.title,
    });

    return {
      message: "Project archived.",
      id,
    };
  }
}
