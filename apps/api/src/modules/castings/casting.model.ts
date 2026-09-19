import { Schema, Types } from "mongoose";
export const castingStatuses = ["Draft", "Open", "Closed"] as const;
export interface Casting {
  _id: Types.ObjectId;
  projectId?: Types.ObjectId;
  slug: string;
  title: string;
  role?: string;
  category?: string;
  summary?: string;
  description?: string;
  details?: string[];
  status: (typeof castingStatuses)[number];
  published: boolean;
  archived: boolean;
  location?: string;
  shootDate?: Date;
  deadline?: Date;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  experience?: string;
  compensation?: string;
  requirements?: string;
  coverMediaId?: Types.ObjectId;
  tags?: string[];
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export const CastingSchema = new Schema<Casting>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    slug: { type: String, required: true, maxlength: 160 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    role: { type: String, trim: true, maxlength: 160 },
    category: { type: String, trim: true, maxlength: 100, index: true },
    summary: { type: String, maxlength: 1000 },
    description: { type: String, maxlength: 10000 },
    details: { type: [String], default: undefined },
    status: { type: String, enum: castingStatuses, default: "Draft", required: true, index: true },
    published: { type: Boolean, default: false, required: true, index: true },
    archived: { type: Boolean, default: false, required: true, index: true },
    location: { type: String, trim: true, maxlength: 200, index: true },
    shootDate: Date,
    deadline: { type: Date, index: true },
    ageMin: { type: Number, min: 0, max: 120 },
    ageMax: { type: Number, min: 0, max: 120 },
    gender: { type: String, trim: true, maxlength: 50, index: true },
    experience: { type: String, maxlength: 1000 },
    compensation: { type: String, maxlength: 1000 },
    requirements: { type: String, maxlength: 5000 },
    coverMediaId: { type: Schema.Types.ObjectId, ref: "Media" },
    tags: { type: [String], default: undefined },
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  },
  { timestamps: true, versionKey: false, minimize: true },
);
CastingSchema.index({ slug: 1 }, { unique: true });
CastingSchema.index({ published: 1, archived: 1, status: 1, deadline: 1, createdAt: -1 });
CastingSchema.index({ projectId: 1, status: 1, createdAt: -1 });
CastingSchema.index({ category: 1, location: 1, status: 1 });
CastingSchema.index({ tags: 1 });
