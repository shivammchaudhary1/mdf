import { Schema } from "mongoose";

export interface RateLimitBucket {
  scope: string;
  keyHash: string;
  count: number;
  resetAt: Date;
}

export const RateLimitBucketSchema = new Schema<RateLimitBucket>(
  {
    scope: { type: String, required: true, maxlength: 80 },
    keyHash: { type: String, required: true, maxlength: 64 },
    count: { type: Number, required: true, min: 0 },
    resetAt: { type: Date, required: true },
  },
  { versionKey: false },
);

RateLimitBucketSchema.index({ scope: 1, keyHash: 1 }, { unique: true });
RateLimitBucketSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });
