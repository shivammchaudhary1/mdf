import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { Application } from "../applications/application.model";
import { Account } from "../auth/auth.models";
import { Casting } from "../castings/casting.model";
import { ContactMessage } from "../contact/contact.model";
import { ContentRecord } from "../platform/platform.models";
import { Project } from "../projects/project.model";

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
  ) {}

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
