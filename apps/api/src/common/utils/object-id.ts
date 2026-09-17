import { NotFoundException } from "@nestjs/common";
import { isValidObjectId, Types } from "mongoose";

export function objectId(value: string, message = "Record not found.") {
  if (!isValidObjectId(value)) throw new NotFoundException(message);
  return new Types.ObjectId(value);
}
