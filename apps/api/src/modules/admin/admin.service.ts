import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { objectId } from "../../common/utils/object-id";
import { AnalyticsService } from "../analytics/analytics.service";
import { Application } from "../applications/application.model";
import { Account } from "../auth/auth.models";
import { Casting } from "../castings/casting.model";
import { ContactMessage } from "../contact/contact.model";
import { MediaService } from "../media/media.service";
import { ContentRecord } from "../platform/platform.models";
import { Project } from "../projects/project.model";
import { AdminProfileDto } from "./admin.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel("Account") private readonly accounts: Model<Account>,
    @InjectModel("Project") private readonly projects: Model<Project>,
    @InjectModel("Casting") private readonly castings: Model<Casting>,
    @InjectModel("Application") private readonly applications: Model<Application>,
    @InjectModel("Contact") private readonly contacts: Model<ContactMessage>,
    @InjectModel("Content") private readonly content: Model<ContentRecord>,
    private readonly analytics: AnalyticsService,
    private readonly audit: AuditService,
    private readonly media: MediaService,
  ) {}

  private serializeProfile(account: Account) {
    const photoMediaId = account.photoMediaId ? String(account.photoMediaId) : undefined;
    return {
      id: String(account._id),
      name: account.name,
      email: account.email,
      mobile: account.mobile,
      role: account.role,
      verified: account.verified,
      authProvider: account.authProvider,
      photoMediaId,
      photo: photoMediaId ? `/api/v1/media/${photoMediaId}/profile` : undefined,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      lastLoginAt: account.lastLoginAt,
      loginCount: Number(account.loginCount ?? 0),
    };
  }

  async profile(accountId: string) {
    const account = await this.accounts.findOne({ _id: objectId(accountId), role: "SUPER_ADMIN" }).lean();
    if (!account) throw new NotFoundException("Administrator account not found.");
    return this.serializeProfile(account as Account);
  }

  async updateProfile(accountId: string, input: AdminProfileDto) {
    const account = await this.accounts.findOne({ _id: objectId(accountId), role: "SUPER_ADMIN" });
    if (!account) throw new NotFoundException("Administrator account not found.");

    await this.media.assertOwnedBy(accountId, [input.photoMediaId], "image", "member-profile");

    const previousPhotoId = account.photoMediaId ? String(account.photoMediaId) : undefined;
    if (input.name !== undefined) account.name = input.name;
    if (input.mobile !== undefined) account.mobile = input.mobile;
    if (input.photoMediaId === null) account.set("photoMediaId", undefined);
    else if (input.photoMediaId !== undefined) account.photoMediaId = new Types.ObjectId(input.photoMediaId);

    await account.save();

    const currentPhotoId = account.photoMediaId ? String(account.photoMediaId) : undefined;
    if (currentPhotoId) await this.media.makePrivate([currentPhotoId]);
    if (previousPhotoId && previousPhotoId !== currentPhotoId) {
      await this.media.removeIfUnreferencedOwned(previousPhotoId, accountId).catch(() => undefined);
    }

    return this.serializeProfile(account);
  }

  async metrics() {
    const d = new Date(Date.now() - 30 * 86400000);

    const [members, verified, newMembers, projects, activeProjects, openCastings, applications, pending, newContacts] = await Promise.all([
      this.accounts.countDocuments({ role: "MEMBER" }),
      this.accounts.countDocuments({ role: "MEMBER", verified: true }),
      this.accounts.countDocuments({ role: "MEMBER", createdAt: { $gte: d } }),
      this.projects.countDocuments({ archived: false }),
      this.projects.countDocuments({ archived: false, status: { $in: ["Development", "Pre-production", "In Production"] } }),
      this.castings.countDocuments({ archived: false, published: true, status: "Open" }),
      this.applications.countDocuments(),
      this.applications.countDocuments({ status: { $in: ["Submitted", "Under Review"] } }),
      this.contacts.countDocuments({ status: "New" }),
    ]);

    return {
      members,
      verified,
      newMembers,
      projects,
      activeProjects,
      openCastings,
      applications,
      pending,
      newContacts,
    };
  }

  async applicationPipeline() {
    const rows = await this.applications.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    return Object.fromEntries(rows.map((row) => [String(row._id), Number(row.count)]));
  }

  async memberGrowth() {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCMonth(start.getUTCMonth() - 5);

    return this.accounts.aggregate([
      { $match: { role: "MEMBER", createdAt: { $gte: start } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  }

  async activity(limit = 30) {
    return this.audit.recent(limit);
  }

  async latestApplications(limit = 3) {
    const items = await this.applications
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .select({
        applicant: 1,
        opportunityTitle: 1,
        roleSnapshot: 1,
        status: 1,
        createdAt: 1,
      })
      .lean();

    return items.map((item) => ({
      _id: String(item._id),
      applicant: item.applicant,
      opportunityTitle: item.opportunityTitle,
      roleSnapshot: item.roleSnapshot,
      status: item.status,
      createdAt: item.createdAt,
    }));
  }

  async dashboard() {
    const [metrics, pipeline, growth, activity, totalVisitors, draftBlogCount, latestApplications] = await Promise.all([
      this.metrics(),
      this.applicationPipeline(),
      this.memberGrowth(),
      this.activity(20),
      this.analytics.totalVisitors(),
      this.content.countDocuments({ kind: "blog", archived: false, published: false }),
      this.latestApplications(3),
    ]);

    return {
      metrics: {
        ...metrics,
        totalVisitors,
        draftBlogCount,
      },
      pipeline,
      growth,
      activity,
      latestApplications,
    };
  }
}
