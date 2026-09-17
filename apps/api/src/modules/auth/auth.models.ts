import { Schema } from "mongoose";
export interface Account {
  _id: unknown;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: "USER" | "SUPER_ADMIN";
  verified: boolean;
  suspended: boolean;
}
export const AccountSchema = new Schema<Account>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["USER", "SUPER_ADMIN"], default: "USER" },
    verified: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export interface Session {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}
export const SessionSchema = new Schema<Session>({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export const ResetSchema = new Schema<Session>({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});
