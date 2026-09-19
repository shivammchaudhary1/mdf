import { Schema, Types } from "mongoose";
export const applicationStatuses = ["Submitted", "Under Review", "Shortlisted", "Selected", "Rejected"] as const;
export const opportunityTypes = ["PROJECT", "CASTING"] as const;
export interface ApplicantSnapshot {
  name: string;
  email: string;
  mobile: string;
  city?: string;
}
export interface Application {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  opportunityType: (typeof opportunityTypes)[number];
  opportunityId: Types.ObjectId;
  projectId?: Types.ObjectId;
  opportunityTitle: string;
  opportunitySlug?: string;
  roleSnapshot?: string;
  applicant: ApplicantSnapshot;
  coverNote: string;
  portfolioMediaIds?: Types.ObjectId[];
  showreelUrl?: string;
  pitch?: string;
  documentMediaId?: Types.ObjectId;
  status: (typeof applicationStatuses)[number];
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const ApplicantSnapshotSchema = new Schema<ApplicantSnapshot>(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 254 },
    mobile: { type: String, required: true, maxlength: 24 },
    city: { type: String, maxlength: 100 },
  },
  { _id: false, versionKey: false },
);
export const ApplicationSchema = new Schema<Application>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    opportunityType: { type: String, enum: opportunityTypes, required: true },
    opportunityId: { type: Schema.Types.ObjectId, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    opportunityTitle: { type: String, required: true, maxlength: 160 },
    opportunitySlug: { type: String, maxlength: 160 },
    roleSnapshot: { type: String, maxlength: 160 },
    applicant: { type: ApplicantSnapshotSchema, required: true },
    coverNote: { type: String, required: true, maxlength: 5000 },
    portfolioMediaIds: { type: [Schema.Types.ObjectId], ref: "Media", default: undefined },
    showreelUrl: { type: String, maxlength: 500 },
    pitch: { type: String, maxlength: 10000 },
    documentMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    status: { type: String, enum: applicationStatuses, default: "Submitted", required: true, index: true },
    adminNotes: { type: String, maxlength: 5000, select: false },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Account" },
    reviewedAt: Date,
  },
  { timestamps: true, versionKey: false, minimize: true },
);
ApplicationSchema.index({ userId: 1, opportunityType: 1, opportunityId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ opportunityId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ projectId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });
