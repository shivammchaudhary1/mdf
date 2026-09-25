import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import { sha256 } from "../../common/utils/crypto";
import type { Visitor } from "./visitor.model";

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel("Visitor") private readonly visitors: Model<Visitor>) {}

  async recordVisitor(token: string) {
    const now = new Date();

    await this.visitors.updateOne(
      { visitorHash: sha256(token) },
      {
        $set: { lastSeenAt: now },
        $setOnInsert: { firstSeenAt: now },
      },
      { upsert: true },
    );

    return { tracked: true };
  }

  totalVisitors() {
    return this.visitors.countDocuments();
  }
}
