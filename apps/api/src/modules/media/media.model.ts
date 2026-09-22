import { Schema, Types } from "mongoose";

export const mediaPurposes = [
  "website-image",
  "project",
  "casting",
  "blog",
  "gallery",
  "team",
  "bts",
  "show",
  "member-profile",
  "member-portfolio",
  "member-resume",
] as const;

export type MediaPurpose = (typeof mediaPurposes)[number];
export type MediaKind = "image" | "document";
export type MediaVisibility = "private" | "public";

export interface Media {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  kind: MediaKind;
  purpose?: MediaPurpose;
  storagePrefix?: string;
  visibility: MediaVisibility;
  originalName?: string;
  sourceMime: string;
  sourceBytes: number;
  width?: number;
  height?: number;
  contentHash: Buffer;
  createdAt: Date;
}

export const MediaSchema = new Schema<Media>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    kind: { type: String, enum: ["image", "document"], required: true },
    purpose: { type: String, enum: mediaPurposes, index: true },
    storagePrefix: { type: String, maxlength: 260 },
    visibility: { type: String, enum: ["private", "public"], default: "private", required: true, index: true },
    originalName: { type: String, maxlength: 150 },
    sourceMime: { type: String, required: true, maxlength: 100 },
    sourceBytes: { type: Number, required: true, min: 0 },
    width: Number,
    height: Number,
    contentHash: { type: Buffer, required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, minimize: true },
);

MediaSchema.index({ ownerId: 1, purpose: 1, createdAt: -1 });
MediaSchema.index({ ownerId: 1, purpose: 1, contentHash: 1 });
MediaSchema.index({ visibility: 1, createdAt: -1 });
