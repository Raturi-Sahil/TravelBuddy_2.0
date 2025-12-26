import { Types } from "mongoose";

export interface IChatGroup {
  activityId: Types.ObjectId;
  name: string;                 // activity name
  image?: string;               // optional group image
  createdBy: Types.ObjectId;    // activity admin
  participants: Types.ObjectId[];
  lastMessage?: string;         // optional (for later use)
  createdAt?: Date;
  updatedAt?: Date;
}
