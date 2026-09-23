import { Schema, Types } from "mongoose";

export const careerStatuses = ["Submitted", "In Review", "Shortlisted", "Closed", "Rejected"] as const;
export type CareerStatus = (typeof careerStatuses)[number];

export interface CareerApplication {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  role: string;
  city?: string;
  coverNote: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  status: CareerStatus;
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CareerApplicationSchema = new Schema<CareerApplication>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, index: true },
    mobile: { type: String, required: true, trim: true, maxlength: 30 },
    role: { type: String, required: true, trim: true, maxlength: 160, index: true },
    city: { type: String, trim: true, maxlength: 120 },
    coverNote: { type: String, required: true, maxlength: 5000 },
    resumeUrl: { type: String, maxlength: 700 },
    portfolioUrl: { type: String, maxlength: 700 },
    linkedinUrl: { type: String, maxlength: 700 },
    status: { type: String, enum: careerStatuses, default: "Submitted", required: true, index: true },
    adminNotes: { type: String, maxlength: 5000 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Account" },
    reviewedAt: Date,
  },
  { timestamps: true, versionKey: false, minimize: true },
);

CareerApplicationSchema.index({ status: 1, createdAt: -1 });
CareerApplicationSchema.index({ email: 1, createdAt: -1 });
CareerApplicationSchema.index({ role: 1, createdAt: -1 });

CareerApplicationSchema.index({ createdAt: -1 });
