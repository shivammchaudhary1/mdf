import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, type PipelineStage, type QueryFilter, Types } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { RateLimitService } from "../../common/security/rate-limit.service";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { Account } from "../auth/auth.models";
import { Casting } from "../castings/casting.model";
import { MailService } from "../mail/mail.service";
import { MediaService } from "../media/media.service";
import { Project } from "../projects/project.model";
import {
  AdminApplicationQueryDto,
  CreateApplicationDto,
  MemberApplicationQueryDto,
  OpportunityQueryDto,
  UpdateApplicationDto,
} from "./application.dto";
import { Application } from "./application.model";

function indiaDateKey(now = new Date()) {
  const india = new Date(now.getTime() + 330 * 60_000);
  return new Date(Date.UTC(india.getUTCFullYear(), india.getUTCMonth(), india.getUTCDate()));
}

type ResolvedOpportunity = {
  type: "PROJECT" | "CASTING";
  id: Types.ObjectId;
  title: string;
  slug?: string;
  role?: string;
  projectId?: Types.ObjectId;
};

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel("Application")
    private readonly applications: Model<Application>,
    @InjectModel("Account")
    private readonly accounts: Model<Account>,
    @InjectModel("Project")
    private readonly projects: Model<Project>,
    @InjectModel("Casting")
    private readonly castings: Model<Casting>,
    private readonly media: MediaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly rateLimits: RateLimitService,
  ) {}

  private serialize(application: Application | Record<string, unknown>) {
    const item = application as Application;
    const portfolio = (item.portfolioMediaIds ?? []).map(String);
    const documentId = item.documentMediaId ? String(item.documentMediaId) : undefined;

    return {
      ...application,
      _id: String((application as { _id: unknown })._id),
      memberId: String(item.memberId),
      opportunityId: String(item.opportunityId),
      projectId: item.projectId ? String(item.projectId) : undefined,
      portfolioMediaIds: portfolio,
      portfolioImages: portfolio.map((id) => this.media.urlsFor(id).medium),
      documentMediaId: documentId,
      documentUrl: documentId ? this.media.urlsFor(documentId, "document").document : undefined,
    };
  }

  private async resolveOpportunity(input: CreateApplicationDto): Promise<ResolvedOpportunity> {
    const id = objectId(input.opportunityId, "Opportunity not found.");
    const today = indiaDateKey();

    if (!input.opportunityType || input.opportunityType === "CASTING") {
      const casting = await this.castings
        .findOne({
          _id: id,
          published: true,
          archived: false,
          status: "Open",
          $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: today } }],
        })
        .lean();

      if (casting) {
        return {
          type: "CASTING",
          id: casting._id,
          title: casting.title,
          slug: casting.slug,
          role: casting.role,
          projectId: casting.projectId,
        };
      }
    }

    if (!input.opportunityType || input.opportunityType === "PROJECT") {
      const project = await this.projects
        .findOne({
          _id: id,
          published: true,
          archived: false,
          status: { $nin: ["Completed", "Archived"] },
        })
        .lean();

      if (project) {
        return {
          type: "PROJECT",
          id: project._id,
          title: project.title,
          slug: project.slug,
          projectId: project._id,
        };
      }
    }

    throw new BadRequestException("This opportunity is no longer accepting applications.");
  }

  async apply(memberId: string, input: CreateApplicationDto) {
    await this.rateLimits.consume("member-application", memberId, 30, 86_400_000);

    const opportunity = await this.resolveOpportunity(input);

    await this.media.assertOwnedBy(memberId, [...(input.portfolioMediaIds ?? [])], "image", "member-portfolio");
    await this.media.assertOwnedBy(memberId, [input.documentMediaId], "document", "member-resume");

    const account = await this.accounts.findById(objectId(memberId)).lean();

    if (!account || account.suspended) {
      throw new BadRequestException("Account is not available.");
    }
    const applicantProfile = await this.applications.db
      .collection("profiles")
      .findOne({ memberId: account._id }, { projection: { city: 1 } });

    try {
      const application = await this.applications.create({
        memberId: account._id,
        opportunityType: opportunity.type,
        opportunityId: opportunity.id,
        projectId: opportunity.projectId,
        opportunityTitle: opportunity.title,
        opportunitySlug: opportunity.slug,
        roleSnapshot: opportunity.role,
        applicant: {
          name: account.name,
          email: account.email,
          mobile: account.mobile,
          city: typeof applicantProfile?.city === "string" ? applicantProfile.city : undefined,
        },
        coverNote: input.coverNote,
        portfolioMediaIds: input.portfolioMediaIds?.map((id) => new Types.ObjectId(id)),
        showreelUrl: input.showreelUrl,
        pitch: input.pitch,
        documentMediaId: input.documentMediaId ? new Types.ObjectId(input.documentMediaId) : undefined,
        status: "Submitted",
      });

      await this.mail
        .send(
          account.email,
          "Application received",
          `Hi ${account.name},\n\nYour application for ${opportunity.title} has been received. You can track its status from your member dashboard.`,
          {
            eyebrow: "Application confirmation",
            from: this.config.get<string>("PRODUCTION_EMAIL")?.trim(),
            fromName: "M. Dadu Films Production",
          },
        )
        .catch(() => undefined);

      const recipient = this.config.get<string>("PRODUCTION_EMAIL");
      if (recipient) {
        await this.mail
          .send(
            recipient,
            `New application: ${opportunity.title}`,
            `Name: ${account.name}\nEmail: ${account.email}\nMobile: ${account.mobile}\nType: ${opportunity.type}\nOpportunity: ${opportunity.title}\nRole: ${opportunity.role || "Not specified"}`,
            {
              replyTo: account.email,
              eyebrow: "New production application",
              from: recipient,
              fromName: "M. Dadu Films Production",
            },
          )
          .catch(() => undefined);
      }

      return this.serialize(application.toObject());
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        throw new ConflictException("You have already applied to this opportunity.");
      }

      throw error;
    }
  }

  async mine(memberId: string, query: MemberApplicationQueryDto) {
    const filter: QueryFilter<Application> = {
      memberId: objectId(memberId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [result] = await this.applications.aggregate<{ items: Application[]; total: { count: number }[] }>([
      { $match: filter },
      { $project: { adminNotes: 0, reviewedBy: 0, reviewedAt: 0 } },
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

  async mineById(memberId: string, id: string) {
    const application = await this.applications
      .findOne({
        _id: objectId(id),
        memberId: objectId(memberId),
      })
      .lean();

    if (!application) {
      throw new NotFoundException("Application not found.");
    }

    return this.serialize(application);
  }

  async adminList(query: AdminApplicationQueryDto) {
    const filter: QueryFilter<Application> = {};

    if (query.status) filter.status = query.status;
    if (query.opportunityType) {
      filter.opportunityType = query.opportunityType;
    }
    if (query.opportunityId) {
      filter.opportunityId = objectId(query.opportunityId);
    }
    if (query.projectId) {
      filter.projectId = objectId(query.projectId);
    }

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");

      filter.$or = [
        { "applicant.name": search },
        { "applicant.email": search },
        { "applicant.mobile": search },
        { "applicant.city": search },
        { opportunityTitle: search },
        { roleSnapshot: search },
      ];
    }

    const [result] = await this.applications.aggregate<{ items: Application[]; total: { count: number }[] }>([
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

  async adminById(id: string) {
    const application = await this.applications.findById(objectId(id)).select("+adminNotes").lean();

    if (!application) {
      throw new NotFoundException("Application not found.");
    }

    return this.serialize(application);
  }

  async update(id: string, input: UpdateApplicationDto, actorId: string) {
    const application = await this.applications.findById(objectId(id)).select("+adminNotes");
    if (!application) {
      throw new NotFoundException("Application not found.");
    }

    const previousStatus = application.status;
    application.status = input.status;
    if (input.adminNotes !== undefined) application.adminNotes = input.adminNotes.trim();
    application.reviewedBy = objectId(actorId);
    application.reviewedAt = new Date();

    await application.save();

    if (previousStatus !== application.status) {
      const memberStatus = application.status === "Rejected" ? "Not Selected" : application.status;
      await this.mail
        .send(
          application.applicant.email,
          "Application status updated",
          `Hi ${application.applicant.name},\n\nYour application for ${application.opportunityTitle} is now ${memberStatus}.`,
          {
          eyebrow: "Application update",
          from: this.config.get<string>("PRODUCTION_EMAIL")?.trim(),
          fromName: "M. Dadu Films Production",
        },
        )
        .catch(() => undefined);
    }

    await this.audit.record({
      actorId,
      action: "application.update",
      entityType: "application",
      entityId: id,
      summary: `${application.applicant.name} → ${application.status}`,
      metadata: {
        status: application.status,
        opportunityType: application.opportunityType,
      },
    });

    return this.serialize(application.toObject());
  }

  async opportunities(query: OpportunityQueryDto) {
    const today = indiaDateKey();
    const castingMatch: Record<string, unknown> = {
      published: true,
      archived: false,
      status: "Open",
      $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: today } }],
    };

    const projectMatch: Record<string, unknown> = {
      published: true,
      archived: false,
      status: { $nin: ["Completed", "Archived"] },
    };

    if (query.category) {
      castingMatch.category = query.category;
      projectMatch.type = query.category;
    }

    if (query.location) {
      const location = new RegExp(escapeSearch(query.location.trim()), "i");
      castingMatch.location = location;
      projectMatch.location = location;
    }

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");
      castingMatch.$and = [
        {
          $or: [{ title: search }, { role: search }, { summary: search }],
        },
      ];
      projectMatch.$or = [{ title: search }, { summary: search }];
    }

    const pipeline: PipelineStage[] = [
      { $match: castingMatch },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          category: 1,
          role: 1,
          location: 1,
          status: 1,
          deadline: 1,
          compensation: 1,
          coverMediaId: 1,
          createdAt: 1,
          opportunityType: { $literal: "CASTING" },
        },
      },
      {
        $unionWith: {
          coll: this.projects.collection.name,
          pipeline: [
            { $match: projectMatch },
            {
              $project: {
                _id: 1,
                title: 1,
                slug: 1,
                category: "$type",
                location: 1,
                status: 1,
                coverMediaId: 1,
                createdAt: 1,
                opportunityType: { $literal: "PROJECT" },
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.castings.aggregate<{ items: Array<Record<string, unknown>>; total: { count: number }[] }>([
      ...pipeline,
      { $sort: { createdAt: -1, _id: -1 } },
      { $facet: { items: [{ $skip: (query.page - 1) * query.limit }, { $limit: query.limit }], total: [{ $count: "count" }] } },
    ]);
    const items = result?.items ?? [];
    const total = Number(result?.total?.[0]?.count ?? 0);

    return {
      items: items.map((item) => {
        const coverId = item.coverMediaId ? String(item.coverMediaId) : undefined;

        return {
          ...item,
          _id: String(item._id),
          coverMediaId: coverId,
          coverImage: coverId ? this.media.urlsFor(coverId).medium : undefined,
        };
      }),
      meta: pageMeta(query.page, query.limit, total),
    };
  }
}
