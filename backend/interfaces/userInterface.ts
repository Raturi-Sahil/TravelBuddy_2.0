// src/interfaces/user.interface.ts
import { Document } from "mongoose";

export interface ILanguage {
  name: string;
  level: "Native" | "Beginner" | "Intermediate" | "Advanced";
}

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface IFutureDestination {
  name: string;
  coordinates: number[];
}

export interface IUser extends Document {
  clerk_id: string;
  mobile: string;
  dob: Date;
  gender: "Male" | "Female" | "Other";
  profileVisibility? : "Public" | "Private";

  travelStyle:
    | "Solo"
    | "Group"
    | "Adventure"
    | "Luxury"
    | "Backpacking"
    | "Business"
    | "Family";

  languages?: ILanguage[];

  bio?: string;
  currentLocation?: IGeoPoint;
  nationality: string;

  futureDestinations?: IFutureDestination[];

  interests?: string[];

  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };

  isOnline: boolean;
  lastSeen?: Date;
  socketId?: string | null;

  JoinActivity?: string[];

  createdAt?: Date;
  friends?: string[];
  friendRequests?: string[];
  sentFriendRequests?: string[];
}

