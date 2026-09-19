import { Schema, Types } from "mongoose";
export const projectStatuses = ["Development", "Pre-production", "In Production", "Completed", "Archived"] as const;
export interface ProjectCredit {
  name: string;
  role: string;
}
export interface Project {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  type?: string;
  summary?: string;
  description?: string;
  body?: string[];
  creditsText?: string;
  status: (typeof projectStatuses)[number];
  location?: string;
  startDate?: Date;
  endDate?: Date;
  coverMediaId?: Types.ObjectId;
  galleryMediaIds?: Types.ObjectId[];
  credits?: ProjectCredit[];
  trailerUrl?: string;
  tags?: string[];
  published: boolean;
  archived: boolean;
  order: number;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const CreditSchema = new Schema<ProjectCredit>(
  { name: { type: String, required: true, maxlength: 100 }, role: { type: String, required: true, maxlength: 100 } },
  { _id: false, versionKey: false },
);
export const ProjectSchema = new Schema<Project>(
  {
    slug: { type: String, required: true, maxlength: 160 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, trim: true, maxlength: 100 },
    summary: { type: String, maxlength: 1000 },
    description: { type: String, maxlength: 15000 },
    body: { type: [String], default: undefined },
    creditsText: { type: String, maxlength: 5000 },
    status: { type: String, enum: projectStatuses, default: "Development", required: true },
    location: { type: String, maxlength: 200 },
    startDate: Date,
    endDate: Date,
    coverMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    galleryMediaIds: { type: [Schema.Types.ObjectId], ref: "Media", default: undefined },
    credits: { type: [CreditSchema], default: undefined },
    trailerUrl: { type: String, maxlength: 500 },
    tags: { type: [String], default: undefined },
    published: { type: Boolean, default: false, required: true },
    archived: { type: Boolean, default: false, required: true },
    order: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  },
  { timestamps: true, versionKey: false, minimize: true },
);
ProjectSchema.index({ slug: 1 }, { unique: true });
ProjectSchema.index({ published: 1, archived: 1, order: 1, createdAt: -1 });
ProjectSchema.index({ status: 1, archived: 1, createdAt: -1 });
ProjectSchema.index({ type: 1, archived: 1, createdAt: -1 });
ProjectSchema.index({ tags: 1 });
