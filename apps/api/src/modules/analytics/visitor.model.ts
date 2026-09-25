import { Schema, Types } from "mongoose";

export interface Visitor {
  _id: Types.ObjectId;
  visitorHash: Buffer;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

export const VisitorSchema = new Schema<Visitor>(
  {
    visitorHash: { type: Buffer, required: true, select: false },
    firstSeenAt: { type: Date, required: true, default: Date.now },
    lastSeenAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

VisitorSchema.index({ visitorHash: 1 }, { unique: true });
VisitorSchema.index({ lastSeenAt: -1 });
