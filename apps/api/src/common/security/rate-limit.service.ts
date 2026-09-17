import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { sha256Hex } from "../utils/crypto";
import type { RateLimitBucket } from "./rate-limit.model";

export type RateLimitResult = {
  limit: number;
  remaining: number;
  resetAt: Date;
};

@Injectable()
export class RateLimitService {
  constructor(
    @InjectModel("RateLimitBucket") private readonly buckets: Model<RateLimitBucket>,
  ) {}

  async consume(scope: string, key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = new Date();
    const keyHash = sha256Hex(`${scope}:${key}`);
    const resetAt = new Date(Date.now() + windowMs);

    let bucket = await this.buckets.findOneAndUpdate(
      { scope, keyHash, resetAt: { $gt: now } },
      { $inc: { count: 1 } },
      { new: true },
    ).lean();

    if (!bucket) {
      try {
        bucket = await this.buckets.findOneAndUpdate(
          { scope, keyHash },
          { $set: { count: 1, resetAt } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        ).lean();
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
          return this.consume(scope, key, limit, windowMs);
        }
        throw error;
      }
    }

    const count = Number(bucket?.count ?? 1);
    const effectiveReset = bucket?.resetAt ?? resetAt;
    if (count > limit) {
      const seconds = Math.max(1, Math.ceil((effectiveReset.getTime() - Date.now()) / 1000));
      const exception = new HttpException("Too many requests. Please try again later.", 429);
      (exception as HttpException & { retryAfter?: number }).retryAfter = seconds;
      throw exception;
    }

    return { limit, remaining: Math.max(0, limit - count), resetAt: effectiveReset };
  }
}
