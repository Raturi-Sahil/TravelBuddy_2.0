import { Document, Types } from "mongoose";

export type InviteStatus = "Pending" | "Accepted" | "Rejected";
export type ActivityGender = "Male" | "Female";

export interface IInvite {
  userId: string;
  status: InviteStatus;
}

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface IActivity extends Document {
  title: string;
  description?: string;
  category: string;

  createdBy: Types.ObjectId | string;


  date: Date;
  startTime?: Date;
  endTime?: Date;

  location?: IGeoPoint;

  photos?: string[];
  videos?: string[];

  gender?: ActivityGender;

  price?: number;
  foreignerPrice?: number;

  maxCapacity: number;

  participants?: string[];
  invitedUsers?: IInvite[];

  groupExists?: boolean;

  createdAt?: Date;
}
