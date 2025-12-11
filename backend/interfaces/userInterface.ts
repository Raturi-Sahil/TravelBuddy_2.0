// src/interfaces/user.interface.ts
import { Document } from "mongoose";

export interface ILanguage {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
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
  fullName: string;
  email: string;
  mobile: string;
  profilePicture?: string;
  dob: Date;
  gender: "Male" | "Female" | "Other";

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

  profileCompleted?: boolean;

  createdAt?: Date;

  generateJwtToken(): string; // JWT still supported
}
