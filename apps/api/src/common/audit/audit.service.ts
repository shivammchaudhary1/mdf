import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import type { AuditLog } from "./audit.model";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(
    @InjectModel("AuditLog") private readonly logs: Model<AuditLog>,
    private readonly config: ConfigService,
  ) {}

  async record(input: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    summary?: string;
    metadata?: Record<string, string | number | boolean | null>;
  }) {
    try {
      const retentionDays = Math.max(30, Number(this.config.get("AUDIT_RETENTION_DAYS") ?? 180));
      await this.logs.create({
        actorId: input.actorId && Types.ObjectId.isValid(input.actorId) ? new Types.ObjectId(input.actorId) : undefined,
        action: input.action.slice(0, 120),
        entityType: input.entityType.slice(0, 80),
        entityId: input.entityId && Types.ObjectId.isValid(input.entityId) ? new Types.ObjectId(input.entityId) : undefined,
        summary: input.summary?.slice(0, 500),
        metadata: input.metadata,
        expiresAt: new Date(Date.now() + retentionDays * 86_400_000),
      });
    } catch {
      this.logger.warn("Audit record could not be persisted.");
    }
  }

  async recent(limit = 50) {
    return this.logs
      .find()
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 100))
      .lean();
  }
}
