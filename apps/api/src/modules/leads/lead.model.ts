import { Schema, Types } from "mongoose";

export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "CONVERTED",
  "LOST",
  "ON_HOLD",
] as const;

export const leadPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const leadActivityTypes = ["CALL", "NOTE", "FOLLOW_UP", "STATUS_CHANGE", "EMAIL", "WHATSAPP", "PROPOSAL"] as const;

export const standardLeadSources = [
  "Cold Call",
  "WhatsApp",
  "Instagram",
  "Website",
  "Email",
  "Referral",
  "Existing Client",
  "LinkedIn",
  "Walk-in",
  "Other",
] as const;

export const standardLeadServices = [
  "Film Production",
  "Ad Film",
  "Corporate Film",
  "Music Video",
  "Casting",
  "Photography",
  "Post Production",
  "Social Media Content",
  "Event Coverage",
  "Creative / Direction",
  "Other",
] as const;

export const standardCallOutcomes = [
  "No Answer",
  "Connected",
  "Busy",
  "Call Back Later",
  "Not Interested",
  "Interested",
  "Wrong Number",
  "Converted",
  "Other",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadPriority = (typeof leadPriorities)[number];
export type LeadActivityType = (typeof leadActivityTypes)[number];

export interface Lead {
  _id: Types.ObjectId;
  companyName: string;
  contactPerson?: string;
  mobile?: string;
  mobileNormalized?: string;
  email?: string;
  website?: string;
  city?: string;
  services?: string[];
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValue?: number;
  convertedValue?: number;
  assignedTo?: Types.ObjectId;
  nextFollowUpAt?: Date;
  lastContactedAt?: Date;
  lostReason?: string;
  convertedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const LeadSchema = new Schema<Lead>(
  {
    companyName: { type: String, required: true, trim: true, maxlength: 180, index: true },
    contactPerson: { type: String, trim: true, maxlength: 120 },
    mobile: { type: String, trim: true, maxlength: 30 },
    mobileNormalized: { type: String, trim: true, maxlength: 30, index: true, select: false },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, index: true },
    website: { type: String, trim: true, maxlength: 700 },
    city: { type: String, trim: true, maxlength: 120, index: true },
    services: {
      type: [String],
      default: undefined,
      validate: { validator: (value?: string[]) => !value || value.length <= 20, message: "A lead can have up to 20 services." },
    },
    source: { type: String, required: true, trim: true, maxlength: 100, default: "Other", index: true },
    status: { type: String, enum: leadStatuses, required: true, default: "NEW", index: true },
    priority: { type: String, enum: leadPriorities, required: true, default: "MEDIUM", index: true },
    estimatedValue: { type: Number, min: 0 },
    convertedValue: { type: Number, min: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Account", index: true },
    nextFollowUpAt: { type: Date, index: true },
    lastContactedAt: Date,
    lostReason: { type: String, trim: true, maxlength: 1000 },
    convertedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    archived: { type: Boolean, required: true, default: false, index: true },
  },
  { timestamps: true, versionKey: false, minimize: true },
);

LeadSchema.index({ archived: 1, status: 1, priority: 1, updatedAt: -1 });
LeadSchema.index({ archived: 1, nextFollowUpAt: 1 });
LeadSchema.index({ assignedTo: 1, archived: 1, nextFollowUpAt: 1 });
LeadSchema.index({ source: 1, archived: 1, updatedAt: -1 });
LeadSchema.index({ createdAt: -1 });

export interface LeadActivity {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  type: LeadActivityType;
  actorId: Types.ObjectId;
  actorName: string;
  note?: string;
  callOutcome?: string;
  followUpAt?: Date;
  fromStatus?: LeadStatus;
  toStatus?: LeadStatus;
  createdAt: Date;
}

export const LeadActivitySchema = new Schema<LeadActivity>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: { type: String, enum: leadActivityTypes, required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    actorName: { type: String, required: true, trim: true, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 5000 },
    callOutcome: { type: String, trim: true, maxlength: 120 },
    followUpAt: Date,
    fromStatus: { type: String, enum: leadStatuses },
    toStatus: { type: String, enum: leadStatuses },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, minimize: true },
);

LeadActivitySchema.index({ leadId: 1, createdAt: -1 });
LeadActivitySchema.index({ actorId: 1, createdAt: -1 });
