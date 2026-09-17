import { Schema, Types } from "mongoose";
export type UserRole = "USER" | "SUPER_ADMIN";
export type AuthProvider = "local" | "google" | "both";
export interface Account {
  _id: Types.ObjectId; name: string; email: string; mobile: string; passwordHash?: string;
  role: UserRole; authProvider: AuthProvider; googleSub?: string; verified: boolean; suspended: boolean;
  lastLoginAt?: Date; loginCount: number; createdAt: Date; updatedAt: Date;
}
export const AccountSchema = new Schema<Account>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  mobile: { type: String, required: true, trim: true, maxlength: 24 },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ["USER", "SUPER_ADMIN"], default: "USER", required: true },
  authProvider: { type: String, enum: ["local", "google", "both"], default: "local", required: true },
  googleSub: { type: String, select: false },
  verified: { type: Boolean, default: false, required: true },
  suspended: { type: Boolean, default: false, required: true },
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true, versionKey: false, minimize: true });
AccountSchema.index({ email: 1 }, { unique: true });
AccountSchema.index({ googleSub: 1 }, { unique: true, partialFilterExpression: { googleSub: { $type: "string" } } });
AccountSchema.index({ role: 1, verified: 1, suspended: 1, createdAt: -1 });

export interface Session { _id: Types.ObjectId; userId: Types.ObjectId; tokenHash: Buffer; remember: boolean; ipHash?: Buffer; userAgentHash?: Buffer; createdAt: Date; lastSeenAt: Date; expiresAt: Date; }
export const SessionSchema = new Schema<Session>({
  userId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  tokenHash: { type: Buffer, required: true, select: false },
  remember: { type: Boolean, default: false },
  ipHash: { type: Buffer, select: false },
  userAgentHash: { type: Buffer, select: false },
  lastSeenAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
SessionSchema.index({ tokenHash: 1 }, { unique: true });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1, createdAt: -1 });

export interface PasswordReset { _id: Types.ObjectId; userId: Types.ObjectId; tokenHash: Buffer; expiresAt: Date; createdAt: Date; }
export const ResetSchema = new Schema<PasswordReset>({
  userId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  tokenHash: { type: Buffer, required: true, select: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
ResetSchema.index({ tokenHash: 1 }, { unique: true });
ResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
