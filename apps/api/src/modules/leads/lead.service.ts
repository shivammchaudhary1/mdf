import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, type QueryFilter } from "mongoose";

import { AuditService } from "../../common/audit/audit.service";
import { pageMeta } from "../../common/dto/pagination.dto";
import { objectId } from "../../common/utils/object-id";
import { escapeSearch } from "../../common/utils/search";
import { Account } from "../auth/auth.models";
import { CreateLeadDto, LeadActivityDto, LeadActivityQueryDto, LeadDuplicateQueryDto, LeadQueryDto, UpdateLeadDto } from "./lead.dto";
import {
  Lead,
  LeadActivity,
  leadActivityTypes,
  leadPriorities,
  type LeadStatus,
  leadStatuses,
  standardCallOutcomes,
  standardLeadServices,
  standardLeadSources,
} from "./lead.model";

const clean = (value?: string | null) => value?.trim() || undefined;
const uniqueList = (values?: string[]) => (values ? [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 20) : undefined);
const normalizePhone = (value?: string | null) => value?.replace(/\D/g, "") || undefined;

function indiaDayBounds() {
  const offset = 330 * 60 * 1000;
  const shifted = new Date(Date.now() + offset);
  const start = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - offset);
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

@Injectable()
export class LeadService {
  constructor(
    @InjectModel("Lead") private readonly leads: Model<Lead>,
    @InjectModel("LeadActivity") private readonly activities: Model<LeadActivity>,
    @InjectModel("Account") private readonly accounts: Model<Account>,
    private readonly audit: AuditService,
  ) {}

  private serializeLead(item: Lead | Record<string, unknown>) {
    const lead = item as Lead;
    const plain = item as Record<string, unknown>;
    const { mobileNormalized: _mobileNormalized, ...visible } = plain;

    return {
      ...visible,
      _id: String(lead._id),
      assignedTo: lead.assignedTo ? String(lead.assignedTo) : undefined,
      createdBy: String(lead.createdBy),
      updatedBy: String(lead.updatedBy),
    };
  }

  private serializeActivity(item: LeadActivity | Record<string, unknown>) {
    const activity = item as LeadActivity;
    return {
      ...item,
      _id: String(activity._id),
      leadId: String(activity.leadId),
      actorId: String(activity.actorId),
    };
  }

  private async actorName(actorId: string) {
    const actor = await this.accounts.findById(objectId(actorId)).select("name").lean();
    return actor?.name?.trim() || "Administrator";
  }

  private async assertAssignee(value?: string | null) {
    if (!value) return;
    const exists = await this.accounts.exists({ _id: objectId(value), role: "SUPER_ADMIN", suspended: false });
    if (!exists) throw new BadRequestException("Choose an active administrator for this lead.");
  }

  private async statusActivity(leadId: string, actorId: string, fromStatus: LeadStatus, toStatus: LeadStatus) {
    if (fromStatus === toStatus) return;
    await this.activities.create({
      leadId: objectId(leadId),
      type: "STATUS_CHANGE",
      actorId: objectId(actorId),
      actorName: await this.actorName(actorId),
      fromStatus,
      toStatus,
      note: `Status changed from ${fromStatus} to ${toStatus}.`,
    });
  }

  async list(query: LeadQueryDto) {
    const filter: QueryFilter<Lead> = {
      archived: query.archived === "true",
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.assignedTo ? { assignedTo: objectId(query.assignedTo) } : {}),
    };

    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");
      filter.$or = [
        { companyName: search },
        { contactPerson: search },
        { mobile: search },
        { email: search },
        { city: search },
        { services: search },
        { source: search },
      ];
    }

    if (query.followUp) {
      const { start, end } = indiaDayBounds();
      if (query.followUp === "TODAY") filter.nextFollowUpAt = { $gte: start, $lt: end };
      if (query.followUp === "OVERDUE") filter.nextFollowUpAt = { $lt: start };
      if (query.followUp === "UPCOMING") filter.nextFollowUpAt = { $gte: end };
    }

    const [items, total] = await Promise.all([
      this.leads
        .find(filter)
        .sort({ nextFollowUpAt: 1, updatedAt: -1, _id: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.leads.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => this.serializeLead(item as unknown as Record<string, unknown>)),
      meta: pageMeta(query.page, query.limit, total),
    };
  }

  async summary() {
    const { start, end } = indiaDayBounds();
    const active = { archived: false };
    const [total, newCount, converted, today, overdue, pipeline, convertedValue, statusRows] = await Promise.all([
      this.leads.countDocuments(active),
      this.leads.countDocuments({ ...active, status: "NEW" }),
      this.leads.countDocuments({ ...active, status: "CONVERTED" }),
      this.leads.countDocuments({ ...active, nextFollowUpAt: { $gte: start, $lt: end } }),
      this.leads.countDocuments({ ...active, nextFollowUpAt: { $lt: start } }),
      this.leads.aggregate<{ _id: null; value: number }>([
        { $match: { ...active, status: { $nin: ["CONVERTED", "LOST"] } } },
        { $group: { _id: null, value: { $sum: { $ifNull: ["$estimatedValue", 0] } } } },
      ]),
      this.leads.aggregate<{ _id: null; value: number }>([
        { $match: { ...active, status: "CONVERTED" } },
        { $group: { _id: null, value: { $sum: { $ifNull: ["$convertedValue", 0] } } } },
      ]),
      this.leads.aggregate<{ _id: LeadStatus; count: number }>([
        { $match: active },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      new: newCount,
      converted,
      followUpsToday: today,
      overdue,
      conversionRate: total ? Math.round((converted / total) * 1000) / 10 : 0,
      pipelineValue: Number(pipeline[0]?.value ?? 0),
      convertedValue: Number(convertedValue[0]?.value ?? 0),
      statuses: Object.fromEntries(statusRows.map((row) => [row._id, row.count])),
    };
  }

  async options() {
    const [sourceValues, serviceValues, outcomeValues, admins] = await Promise.all([
      this.leads.distinct("source"),
      this.leads.distinct("services"),
      this.activities.distinct("callOutcome", { callOutcome: { $exists: true, $ne: "" } }),
      this.accounts.find({ role: "SUPER_ADMIN", suspended: false }).select("_id name email").sort({ name: 1 }).lean(),
    ]);
    const customSources = sourceValues.filter((value): value is string => typeof value === "string" && value.length > 0);
    const customServices = serviceValues.filter((value): value is string => typeof value === "string" && value.length > 0);
    const customOutcomes = outcomeValues.filter((value): value is string => typeof value === "string" && value.length > 0);

    return {
      statuses: [...leadStatuses],
      priorities: [...leadPriorities],
      sources: [...new Set([...standardLeadSources, ...customSources])],
      services: [...new Set([...standardLeadServices, ...customServices])],
      callOutcomes: [...new Set([...standardCallOutcomes, ...customOutcomes])],
      activityTypes: [...leadActivityTypes],
      assignees: admins.map((admin) => ({ id: String(admin._id), name: admin.name, email: admin.email })),
    };
  }

  async duplicates(query: LeadDuplicateQueryDto) {
    const mobileNormalized = normalizePhone(query.mobile);
    const email = clean(query.email)?.toLowerCase();

    if (!mobileNormalized && !email) return { items: [] };

    const filter: QueryFilter<Lead> = {
      archived: false,
      ...(query.excludeId ? { _id: { $ne: objectId(query.excludeId) } } : {}),
      $or: [
        ...(mobileNormalized ? [{ mobileNormalized }] : []),
        ...(email ? [{ email }] : []),
      ],
    };

    const items = await this.leads.find(filter).sort({ updatedAt: -1 }).limit(10).lean();
    return { items: items.map((item) => this.serializeLead(item as unknown as Record<string, unknown>)) };
  }

  async detail(id: string) {
    const item = await this.leads.findById(objectId(id)).lean();
    if (!item) throw new NotFoundException("Lead not found.");
    return this.serializeLead(item as unknown as Record<string, unknown>);
  }

  async create(input: CreateLeadDto, actorId: string) {
    const companyName = input.companyName.trim();
    const mobile = clean(input.mobile);
    const email = clean(input.email)?.toLowerCase();

    if (companyName.length < 2) throw new BadRequestException("Company / client name must have at least 2 characters.");
    if (!mobile && !email) throw new BadRequestException("Add at least a mobile number or email address.");

    await this.assertAssignee(input.assignedTo);

    const status = input.status ?? "NEW";
    if (status === "LOST" && !clean(input.lostReason)) throw new BadRequestException("Add a reason before marking a lead lost.");

    const lead = await this.leads.create({
      companyName,
      contactPerson: clean(input.contactPerson),
      mobile,
      mobileNormalized: normalizePhone(mobile),
      email,
      website: clean(input.website),
      city: clean(input.city),
      services: uniqueList(input.services),
      source: clean(input.source) ?? "Other",
      status,
      priority: input.priority ?? "MEDIUM",
      estimatedValue: input.estimatedValue,
      convertedValue: input.convertedValue,
      assignedTo: input.assignedTo ? objectId(input.assignedTo) : undefined,
      nextFollowUpAt: input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : undefined,
      lostReason: status === "LOST" ? clean(input.lostReason) : undefined,
      convertedAt: status === "CONVERTED" ? new Date() : undefined,
      createdBy: objectId(actorId),
      updatedBy: objectId(actorId),
      archived: false,
    });

    const actorName = await this.actorName(actorId);
    await this.activities.create({
      leadId: lead._id,
      type: "NOTE",
      actorId: objectId(actorId),
      actorName,
      note: "Lead created.",
    });

    await this.audit.record({
      actorId,
      action: "lead.create",
      entityType: "lead",
      entityId: String(lead._id),
      summary: lead.companyName,
      metadata: { status: lead.status, source: lead.source },
    });

    return this.serializeLead(lead.toObject() as unknown as Record<string, unknown>);
  }

  async update(id: string, input: UpdateLeadDto, actorId: string) {
    const lead = await this.leads.findById(objectId(id));
    if (!lead) throw new NotFoundException("Lead not found.");

    await this.assertAssignee(input.assignedTo);
    const previousStatus = lead.status;

    if (input.companyName !== undefined) {
      const companyName = input.companyName.trim();
      if (companyName.length < 2) throw new BadRequestException("Company / client name must have at least 2 characters.");
      lead.companyName = companyName;
    }
    if (input.contactPerson !== undefined) lead.contactPerson = clean(input.contactPerson);
    if (input.mobile !== undefined) {
      lead.mobile = clean(input.mobile);
      lead.mobileNormalized = normalizePhone(input.mobile);
    }
    if (input.email !== undefined) lead.email = clean(input.email)?.toLowerCase();
    if (input.website !== undefined) lead.website = clean(input.website);
    if (input.city !== undefined) lead.city = clean(input.city);
    if (input.services !== undefined) lead.services = uniqueList(input.services);
    if (input.source !== undefined) lead.source = clean(input.source) ?? "Other";
    if (input.priority !== undefined) lead.priority = input.priority;
    if (input.estimatedValue !== undefined) lead.estimatedValue = input.estimatedValue ?? undefined;
    if (input.convertedValue !== undefined) lead.convertedValue = input.convertedValue ?? undefined;
    if (input.assignedTo !== undefined) lead.assignedTo = input.assignedTo ? objectId(input.assignedTo) : undefined;
    if (input.nextFollowUpAt !== undefined) lead.nextFollowUpAt = input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : undefined;
    if (input.lostReason !== undefined) lead.lostReason = clean(input.lostReason);

    if (input.status !== undefined) {
      if (input.status === "LOST" && !clean(input.lostReason) && !lead.lostReason) {
        throw new BadRequestException("Add a reason before marking a lead lost.");
      }
      lead.status = input.status;
      if (input.status === "CONVERTED") lead.convertedAt = lead.convertedAt ?? new Date();
      if (input.status !== "CONVERTED") lead.convertedAt = undefined;
      if (input.status !== "LOST" && input.lostReason === undefined) lead.lostReason = undefined;
    }

    if (!lead.mobile && !lead.email) throw new BadRequestException("Keep at least a mobile number or email address on the lead.");

    lead.updatedBy = objectId(actorId);
    await lead.save();
    await this.statusActivity(id, actorId, previousStatus, lead.status);

    await this.audit.record({
      actorId,
      action: "lead.update",
      entityType: "lead",
      entityId: id,
      summary: lead.companyName,
      metadata: { status: lead.status, priority: lead.priority },
    });

    return this.serializeLead(lead.toObject() as unknown as Record<string, unknown>);
  }

  async activitiesForLead(id: string, query: LeadActivityQueryDto) {
    await this.detail(id);

    const filter: QueryFilter<LeadActivity> = {
      leadId: objectId(id),
      ...(query.type ? { type: query.type } : {}),
    };
    if (query.search) {
      const search = new RegExp(escapeSearch(query.search.trim()), "i");
      filter.$or = [{ note: search }, { callOutcome: search }, { actorName: search }];
    }

    const [items, total] = await Promise.all([
      this.activities
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.activities.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => this.serializeActivity(item as unknown as Record<string, unknown>)),
      meta: pageMeta(query.page, query.limit, total),
    };
  }

  async addActivity(id: string, input: LeadActivityDto, actorId: string) {
    const lead = await this.leads.findById(objectId(id));
    if (!lead) throw new NotFoundException("Lead not found.");
    if (lead.archived) throw new BadRequestException("Restore this lead before adding activity.");

    const note = clean(input.note);
    const outcome = clean(input.callOutcome);

    if (input.type === "NOTE" && !note) throw new BadRequestException("Add a note.");
    if (input.type === "CALL" && !outcome) throw new BadRequestException("Choose a call outcome.");
    if (input.type === "FOLLOW_UP" && !input.followUpAt) throw new BadRequestException("Choose a follow-up date and time.");
    if (input.type === "STATUS_CHANGE") throw new BadRequestException("Change status from the lead details form.");

    const activity = await this.activities.create({
      leadId: lead._id,
      type: input.type,
      actorId: objectId(actorId),
      actorName: await this.actorName(actorId),
      note,
      callOutcome: outcome,
      followUpAt: input.followUpAt ? new Date(input.followUpAt) : undefined,
    });

    if (["CALL", "EMAIL", "WHATSAPP", "PROPOSAL"].includes(input.type)) lead.lastContactedAt = new Date();
    if (input.followUpAt) lead.nextFollowUpAt = new Date(input.followUpAt);
    if (input.type === "PROPOSAL" && lead.status !== "CONVERTED" && lead.status !== "LOST") {
      const previousStatus = lead.status;
      lead.status = "PROPOSAL_SENT";
      await this.statusActivity(id, actorId, previousStatus, lead.status);
    }
    lead.updatedBy = objectId(actorId);
    await lead.save();

    await this.audit.record({
      actorId,
      action: "lead.activity",
      entityType: "lead",
      entityId: id,
      summary: `${lead.companyName}: ${input.type}`,
      metadata: { activityType: input.type, callOutcome: outcome ?? null },
    });

    return this.serializeActivity(activity.toObject() as unknown as Record<string, unknown>);
  }

  async archive(id: string, actorId: string) {
    const lead = await this.leads.findByIdAndUpdate(
      objectId(id),
      { $set: { archived: true, updatedBy: objectId(actorId) } },
      { new: true },
    );
    if (!lead) throw new NotFoundException("Lead not found.");

    await this.audit.record({
      actorId,
      action: "lead.archive",
      entityType: "lead",
      entityId: id,
      summary: lead.companyName,
    });

    return this.serializeLead(lead.toObject() as unknown as Record<string, unknown>);
  }

  async restore(id: string, actorId: string) {
    const lead = await this.leads.findByIdAndUpdate(
      objectId(id),
      { $set: { archived: false, updatedBy: objectId(actorId) } },
      { new: true },
    );
    if (!lead) throw new NotFoundException("Lead not found.");

    await this.audit.record({
      actorId,
      action: "lead.restore",
      entityType: "lead",
      entityId: id,
      summary: lead.companyName,
    });

    return this.serializeLead(lead.toObject() as unknown as Record<string, unknown>);
  }
}
