import { Schema, Types } from "mongoose";
export interface SavedTalentList {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  purpose?: string;
  memberIds?: Types.ObjectId[];
  projectId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export const SavedTalentListSchema = new Schema<SavedTalentList>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    purpose: { type: String, maxlength: 200 },
    memberIds: {
      type: [Schema.Types.ObjectId],
      ref: "Account",
      default: undefined,
      validate: {
        validator: (value?: Types.ObjectId[]) => !value || value.length <= 500,
        message: "A talent list can contain up to 500 members.",
      },
    },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
  },
  { timestamps: true, versionKey: false, minimize: true },
);
SavedTalentListSchema.index({ ownerId: 1, updatedAt: -1 });
SavedTalentListSchema.index({ ownerId: 1, projectId: 1, updatedAt: -1 });
SavedTalentListSchema.index({ ownerId: 1, name: 1 });
