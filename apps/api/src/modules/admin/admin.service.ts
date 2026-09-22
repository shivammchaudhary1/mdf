import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { Application } from "../applications/application.model";
import { Account } from "../auth/auth.models";
import { Casting } from "../castings/casting.model";
import { ContactMessage } from "../contact/contact.model";
import { Project } from "../projects/project.model";
@Injectable()
export class AdminService {
  constructor(
    @InjectModel("Account") private readonly accounts: Model<Account>,
    @InjectModel("Project") private readonly projects: Model<Project>,
    @InjectModel("Casting") private readonly castings: Model<Casting>,
    @InjectModel("Application") private readonly applications: Model<Application>,
    @InjectModel("Contact") private readonly contacts: Model<ContactMessage>,
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
    return { members, verified, newMembers, projects, activeProjects, openCastings, applications, pending, newContacts };
  }
  async applicationPipeline() {
    const rows = await this.applications.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    return Object.fromEntries(rows.map((r) => [String(r._id), Number(r.count)]));
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
  async dashboard() {
    const [metrics, pipeline, growth, activity] = await Promise.all([
      this.metrics(),
      this.applicationPipeline(),
      this.memberGrowth(),
      this.activity(20),
    ]);
    return { metrics, pipeline, growth, activity };
  }
}
