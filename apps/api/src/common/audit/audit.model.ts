import { Schema, Types } from "mongoose";

export interface AuditLog {
  actorId?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  summary?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: Date;
  expiresAt: Date;
}

export const AuditLogSchema = new Schema<AuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Account", index: true },
    action: { type: String, required: true, maxlength: 120, index: true },
    entityType: { type: String, required: true, maxlength: 80, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    summary: { type: String, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
