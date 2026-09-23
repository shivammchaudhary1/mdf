import { Schema, Types } from "mongoose";

export interface ProfileView {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  visitorKey: string;
  dayKey: string;
  createdAt: Date;
}

export const ProfileViewSchema = new Schema<ProfileView>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    visitorKey: { type: String, required: true, maxlength: 100 },
    dayKey: { type: String, required: true, maxlength: 10 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

ProfileViewSchema.index({ memberId: 1, visitorKey: 1, dayKey: 1 }, { unique: true });
ProfileViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 35 });
