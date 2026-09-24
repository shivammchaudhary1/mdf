import { Schema } from "mongoose";

export interface MemberSequence {
  _id: string;
  seq: number;
}

export const MemberSequenceSchema = new Schema<MemberSequence>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0, min: 0 },
  },
  { versionKey: false, timestamps: false },
);
