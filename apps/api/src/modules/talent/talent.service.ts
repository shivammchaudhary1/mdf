import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, type PipelineStage, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { Account, Session } from "../auth/auth.models";
import { MediaService } from "../media/media.service";
import { Profile } from "../profiles/profile.model";
import { profileCompletion } from "../profiles/profile.service";
import { Project } from "../projects/project.model";
import { ProfileView } from "./profile-view.model";
import { SavedTalentList } from "./saved-list.model";
import { CreateListDto, MemberUpdateDto, TalentListQueryDto, TalentQueryDto, UpdateListDto } from "./talent.dto";
type TalentRecord = Pick<Account, "_id" | "name" | "email" | "mobile" | "suspended" | "createdAt" | "verified"> & {
  profile?: Profile | null;
};
interface TalentPage {
  items: TalentRecord[];
  total: { count: number }[];
}
function yearsAgo(years: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d;
}
function exact(value: string) {
  return new RegExp(`^${escapeSearch(value.trim())}$`, "i");
}
@Injectable()
export class TalentService {
  constructor(
    @InjectModel("Account") private readonly accounts: Model<Account>,
    @InjectModel("Session") private readonly sessions: Model<Session>,
    @InjectModel("Profile") private readonly profiles: Model<Profile>,
    @InjectModel("ProfileView") private readonly profileViews: Model<ProfileView>,
    @InjectModel("SavedTalentList")
    private readonly lists: Model<SavedTalentList>,
    @InjectModel("Project") private readonly projects: Model<Project>,
    private readonly media: MediaService,
    private readonly audit: AuditService,
  ) {}
  private pipeline(q: TalentQueryDto, publicOnly: boolean): PipelineStage[] {
    const a: Record<string, unknown> = {
      role: "MEMBER",
      ...(publicOnly
        ? { verified: true, suspended: false }
        : {
            ...(q.verified !== undefined ? { verified: q.verified } : {}),
            ...(q.suspended !== undefined ? { suspended: q.suspended } : {}),
          }),
    };
    const p: Record<string, unknown> = {
      ...(publicOnly ? { "profile.publicVisible": true } : {}),
    };
    if (q.group === "actor") p["profile.profession"] = /actor/i;
    else if (q.group === "writer") p["profile.profession"] = /writer/i;
    else if (q.group === "crew") p["profile.profession"] = { $not: /actor|writer/i };
    if (q.city) p["profile.city"] = exact(q.city);
    if (q.profession)
      p["profile.profession"] = q.group
        ? { $regex: escapeSearch(q.profession.trim()), $options: "i" }
        : new RegExp(escapeSearch(q.profession.trim()), "i");
    if (q.availability) p["profile.availability"] = exact(q.availability);
    if (q.experience) p["profile.experience"] = new RegExp(escapeSearch(q.experience.trim()), "i");
    if (q.skills) p["profile.skills"] = exact(q.skills);
    if (q.languages) p["profile.languages"] = exact(q.languages);
    if (q.gender) p["profile.gender"] = exact(q.gender);
    if (q.ageMin !== undefined || q.ageMax !== undefined) {
      const b: Record<string, Date> = {};
      if (q.ageMin !== undefined) b.$lte = yearsAgo(q.ageMin);
      if (q.ageMax !== undefined) b.$gt = yearsAgo(q.ageMax + 1);
      p["profile.birthDate"] = b;
    }
    const pipe: PipelineStage[] = [
      { $match: a },
      { $project: { passwordHash: 0, googleSub: 0 } },
      {
        $lookup: {
          from: this.profiles.collection.name,
          localField: "_id",
          foreignField: "memberId",
          as: "profile",
        },
      },
      {
        $unwind: { path: "$profile", preserveNullAndEmptyArrays: !publicOnly },
      },
    ];
    if (Object.keys(p).length) pipe.push({ $match: p });
    if (q.search?.trim()) {
      const s = new RegExp(escapeSearch(q.search.trim()), "i");
      pipe.push({
        $match: {
          $or: [
            { name: s },
            ...(publicOnly ? [] : [{ email: s }]),
            { "profile.city": s },
            { "profile.profession": s },
            { "profile.skills": s },
            { "profile.languages": s },
          ],
        },
      });
    }
    return pipe;
  }
  private serialize(item: TalentRecord, publicOnly: boolean) {
    const p = item.profile ?? null;
    const photo = p?.photoMediaId ? String(p.photoMediaId) : undefined;
    const completion = p ? profileCompletion(p) : 0;
    const publicProfile = p
      ? {
          bio: p.bio,
          city: p.city,
          profession: p.profession,
          gender: p.gender,
          age: p.birthDate ? Math.max(0, Math.floor((Date.now() - new Date(p.birthDate).getTime()) / 31557600000)) : undefined,
          skills: p.skills,
          languages: p.languages,
          experience: p.experience,
          availability: p.availability,
          photoMediaId: photo,
          photo: photo ? this.media.urlsFor(photo).profile : undefined,
          portfolioMediaIds: (p.portfolioMediaIds ?? []).map(String),
          portfolio: (p.portfolioMediaIds ?? []).map((id: unknown) => this.media.urlsFor(String(id)).medium),
          videos: p.videos,
          showreel: p.showreel,
          previousWork: p.previousWork,
          socialLinks: p.socialLinks,
          completion,
        }
      : null;
    const adminProfile = p
      ? {
          ...p,
          _id: p._id ? String(p._id) : undefined,
          memberId: String(item._id),
          photoMediaId: photo,
          photo: photo ? this.media.urlsFor(photo).profile : undefined,
          portfolioMediaIds: (p.portfolioMediaIds ?? []).map(String),
          completion,
        }
      : null;
    return {
      id: String(item._id),
      name: item.name,
      ...(publicOnly
        ? {}
        : {
            email: item.email,
            mobile: item.mobile,
            suspended: item.suspended,
            createdAt: item.createdAt,
          }),
      verified: item.verified,
      profile: publicOnly ? publicProfile : adminProfile,
    };
  }
  private async list(q: TalentQueryDto, publicOnly: boolean) {
    const pipe = this.pipeline(q, publicOnly);
    const [result] = await this.accounts.aggregate<TalentPage>([
      ...pipe,
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $facet: {
          items: [{ $skip: (q.page - 1) * q.limit }, { $limit: q.limit }],
          total: [{ $count: "count" }],
        },
      },
    ]);
    const items = (result?.items ?? []) as TalentRecord[];
    const total = Number(result?.total?.[0]?.count ?? 0);
    return {
      items: items.map((i) => this.serialize(i, publicOnly)),
      meta: pageMeta(q.page, q.limit, total),
    };
  }
  listPublic(q: TalentQueryDto) {
    return this.list(q, true);
  }
  async publicOptions() {
    const eligibleMemberIds = await this.accounts.find({ role: "MEMBER", verified: true, suspended: false }).distinct("_id");

    const base = { memberId: { $in: eligibleMemberIds }, publicVisible: true };
    const [cities, professions, genders, languages, availabilities] = await Promise.all([
      this.profiles.distinct("city", base),
      this.profiles.distinct("profession", base),
      this.profiles.distinct("gender", base),
      this.profiles.distinct("languages", base),
      this.profiles.distinct("availability", base),
    ]);

    const tidy = (values: unknown[]) =>
      [
        ...new Set(values.filter((value): value is string => typeof value === "string" && !!value.trim()).map((value) => value.trim())),
      ].sort((left, right) => left.localeCompare(right));

    return {
      cities: tidy(cities),
      professions: tidy(professions),
      genders: tidy(genders),
      languages: tidy(languages),
      availabilities: tidy(availabilities),
    };
  }
  async recordPublicView(id: string, visitorKey: string) {
    const memberId = objectId(id);
    const account = await this.accounts.exists({ _id: memberId, role: "MEMBER", verified: true, suspended: false });
    if (!account) throw new NotFoundException("Talent profile not found.");

    const profile = await this.profiles.findOne({ memberId, publicVisible: true }).select("_id profileViews").lean();
    if (!profile) throw new NotFoundException("Talent profile not found.");

    const dayKey = new Date().toISOString().slice(0, 10);
    let inserted = false;

    try {
      const result = await this.profileViews.updateOne(
        { memberId, visitorKey, dayKey },
        { $setOnInsert: { memberId, visitorKey, dayKey } },
        { upsert: true },
      );
      inserted = result.upsertedCount === 1;
    } catch (error) {
      if ((error as { code?: number })?.code !== 11000) throw error;
    }

    if (inserted) {
      await this.profiles.updateOne({ _id: profile._id }, { $inc: { profileViews: 1 } });
    }

    const fresh = await this.profiles.findById(profile._id).select("profileViews").lean();
    return { counted: inserted, profileViews: Number(fresh?.profileViews ?? 0) };
  }
  listAdmin(q: TalentQueryDto) {
    return this.list(q, false);
  }
  async publicDetail(id: string) {
    const a = await this.accounts
      .findOne({
        _id: objectId(id),
        role: "MEMBER",
        verified: true,
        suspended: false,
      })
      .lean();
    const p = a ? await this.profiles.findOne({ memberId: a._id, publicVisible: true }).lean() : null;
    if (!a || !p) throw new NotFoundException("Talent profile not found.");
    return this.serialize({ ...a, profile: p }, true);
  }
  async adminDetail(id: string) {
    const a = await this.accounts.findOne({ _id: objectId(id), role: "MEMBER" }).lean();
    if (!a) throw new NotFoundException("Member not found.");
    const p = await this.profiles.findOne({ memberId: a._id }).lean();
    return this.serialize({ ...a, profile: p }, false);
  }
  async updateMember(id: string, input: MemberUpdateDto, actorId: string) {
    if (id === actorId && input.suspended === true) throw new ForbiddenException("You cannot suspend your own account.");
    const a = await this.accounts.findOneAndUpdate(
      { _id: objectId(id), role: "MEMBER" },
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!a) throw new NotFoundException("Member not found.");
    if (input.suspended === true) await this.sessions.deleteMany({ accountId: a._id });
    await this.audit.record({
      actorId,
      action: "member.update",
      entityType: "account",
      entityId: id,
      summary: a.name,
      metadata: {
        ...(input.verified !== undefined ? { verified: input.verified } : {}),
        ...(input.suspended !== undefined ? { suspended: input.suspended } : {}),
      },
    });
    return this.adminDetail(id);
  }
  async listSavedLists(ownerId: string, q: TalentListQueryDto) {
    const filter: Record<string, unknown> = {
      ownerId: objectId(ownerId),
      ...(q.projectId ? { projectId: objectId(q.projectId) } : {}),
    };
    if (q.search?.trim()) {
      const s = new RegExp(escapeSearch(q.search.trim()), "i");
      filter.$or = [{ name: s }, { purpose: s }];
    }
    const [result] = await this.lists.aggregate<{
      items: SavedTalentList[];
      total: { count: number }[];
    }>([
      { $match: filter },
      { $sort: { updatedAt: -1, _id: -1 } },
      {
        $facet: {
          items: [{ $skip: (q.page - 1) * q.limit }, { $limit: q.limit }],
          total: [{ $count: "count" }],
        },
      },
    ]);
    const ls = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);
    return {
      items: ls.map((l) => ({
        ...l,
        _id: String(l._id),
        ownerId: String(l.ownerId),
        projectId: l.projectId ? String(l.projectId) : undefined,
        memberIds: (l.memberIds ?? []).map(String),
        memberCount: l.memberIds?.length ?? 0,
      })),
      meta: pageMeta(q.page, q.limit, total),
    };
  }
  private async validateList(ownerId: string, input: CreateListDto | UpdateListDto) {
    if (input.memberIds) {
      const u = [...new Set(input.memberIds)];
      const count = await this.accounts.countDocuments({
        _id: { $in: u.map((id) => objectId(id)) },
        role: "MEMBER",
      });
      if (count !== u.length) throw new BadRequestException("One or more members no longer exist.");
    }
    if (
      input.projectId &&
      !(await this.projects.exists({
        _id: objectId(input.projectId),
        archived: false,
      }))
    )
      throw new BadRequestException("Project not found.");
    return {
      ...(input.purpose !== undefined ? { purpose: input.purpose.trim() } : {}),
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.memberIds !== undefined
        ? {
            memberIds: [...new Set(input.memberIds)].map((id) => new Types.ObjectId(id)),
          }
        : {}),
      ...(input.projectId ? { projectId: new Types.ObjectId(input.projectId) } : {}),
      ownerId: objectId(ownerId),
    };
  }
  async createList(ownerId: string, input: CreateListDto) {
    const v = await this.validateList(ownerId, input);
    const l = await this.lists.create(v);
    await this.audit.record({
      actorId: ownerId,
      action: "talent-list.create",
      entityType: "talent-list",
      entityId: String(l._id),
      summary: l.name,
    });
    return {
      ...l.toObject(),
      _id: String(l._id),
      ownerId: String(l.ownerId),
      projectId: l.projectId ? String(l.projectId) : undefined,
      memberIds: (l.memberIds ?? []).map(String),
    };
  }
  async updateList(ownerId: string, id: string, input: UpdateListDto) {
    const v = await this.validateList(ownerId, input);
    delete (v as Record<string, unknown>).ownerId;
    const update: Record<string, unknown> = { $set: v };
    if (input.projectId === null) update.$unset = { projectId: 1 };
    const l = await this.lists.findOneAndUpdate({ _id: objectId(id), ownerId: objectId(ownerId) }, update, {
      new: true,
      runValidators: true,
    });
    if (!l) throw new NotFoundException("Talent list not found.");
    await this.audit.record({
      actorId: ownerId,
      action: "talent-list.update",
      entityType: "talent-list",
      entityId: id,
      summary: l.name,
    });
    return {
      ...l.toObject(),
      _id: String(l._id),
      ownerId: String(l.ownerId),
      projectId: l.projectId ? String(l.projectId) : undefined,
      memberIds: (l.memberIds ?? []).map(String),
    };
  }
  async listDetail(ownerId: string, id: string) {
    const l = await this.lists.findOne({ _id: objectId(id), ownerId: objectId(ownerId) }).lean();
    if (!l) throw new NotFoundException("Talent list not found.");
    const members = l.memberIds?.length
      ? (
          await this.accounts.aggregate<TalentRecord>([
            ...this.pipeline(new TalentQueryDto(), false),
            { $match: { _id: { $in: l.memberIds } } },
          ])
        ).map((item) => this.serialize(item, false))
      : [];
    return {
      ...l,
      _id: String(l._id),
      ownerId: String(l.ownerId),
      projectId: l.projectId ? String(l.projectId) : undefined,
      memberIds: (l.memberIds ?? []).map(String),
      members: members.filter(Boolean),
    };
  }
  async addMember(ownerId: string, id: string, memberId: string) {
    if (!(await this.accounts.exists({ _id: objectId(memberId), role: "MEMBER" }))) throw new NotFoundException("Member not found.");
    const l = await this.lists.findOneAndUpdate(
      {
        _id: objectId(id),
        ownerId: objectId(ownerId),
        $or: [{ memberIds: objectId(memberId) }, { "memberIds.499": { $exists: false } }],
      },
      { $addToSet: { memberIds: objectId(memberId) } },
      { new: true },
    );
    if (!l) {
      if (
        await this.lists.exists({
          _id: objectId(id),
          ownerId: objectId(ownerId),
        })
      )
        throw new BadRequestException("A talent list can contain up to 500 members.");
      throw new NotFoundException("Talent list not found.");
    }
    await this.audit.record({
      actorId: ownerId,
      action: "talent-list.add-member",
      entityType: "talent-list",
      entityId: id,
      summary: l.name,
    });
    return this.listDetail(ownerId, id);
  }
  async removeMember(ownerId: string, id: string, memberId: string) {
    const l = await this.lists.findOneAndUpdate(
      { _id: objectId(id), ownerId: objectId(ownerId) },
      { $pull: { memberIds: objectId(memberId) } },
      { new: true },
    );
    if (!l) throw new NotFoundException("Talent list not found.");
    await this.audit.record({
      actorId: ownerId,
      action: "talent-list.remove-member",
      entityType: "talent-list",
      entityId: id,
      summary: l.name,
    });
    return this.listDetail(ownerId, id);
  }
  async deleteList(ownerId: string, id: string) {
    const r = await this.lists.deleteOne({
      _id: objectId(id),
      ownerId: objectId(ownerId),
    });
    if (!r.deletedCount) throw new NotFoundException("Talent list not found.");
    await this.audit.record({
      actorId: ownerId,
      action: "talent-list.delete",
      entityType: "talent-list",
      entityId: id,
    });
    return { message: "Talent list deleted." };
  }
}
