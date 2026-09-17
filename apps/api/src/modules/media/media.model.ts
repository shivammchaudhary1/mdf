import { Schema, Types } from "mongoose";
export type MediaKind = "image" | "document";
export type MediaVisibility = "private" | "public";
export interface Media {
  _id: Types.ObjectId; ownerId: Types.ObjectId; kind: MediaKind; visibility: MediaVisibility;
  originalName?: string; sourceMime: string; sourceBytes: number; width?: number; height?: number;
  contentHash: Buffer; createdAt: Date;
}
export const MediaSchema = new Schema<Media>({
  ownerId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  kind: { type: String, enum: ["image", "document"], required: true },
  visibility: { type: String, enum: ["private", "public"], default: "private", required: true, index: true },
  originalName: { type: String, maxlength: 150 }, sourceMime: { type: String, required: true, maxlength: 100 },
  sourceBytes: { type: Number, required: true, min: 0 }, width: Number, height: Number,
  contentHash: { type: Buffer, required: true, select: false },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false, minimize: true });
MediaSchema.index({ ownerId: 1, createdAt: -1 });
MediaSchema.index({ ownerId: 1, contentHash: 1 });
MediaSchema.index({ visibility: 1, createdAt: -1 });
