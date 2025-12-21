import { Document } from "mongoose";

import {
  COUNTRIES,
  GENDERS,
  INTERESTS,
  LANGUAGE_LEVELS,
  SUBSCRIPTION_PLANS,
  TRAVEL_STYLES,
} from "../data/enums";

export interface ILanguage {
  name: string;
  level: (typeof LANGUAGE_LEVELS)[number];
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
  name: string;
  email: string;
  profileImage?: string;
  mobile: string;
  dob: Date;
  gender: (typeof GENDERS)[number];
  profileVisibility?: "Public" | "Private";

  travelStyle: (typeof TRAVEL_STYLES)[number];

  languages?: ILanguage[];

  bio?: string;
  coverImage?: string;
  currentLocation?: IGeoPoint;
  nationality: (typeof COUNTRIES)[number];

  futureDestinations?: IFutureDestination[];

  interests?: (typeof INTERESTS)[number][];

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
  hasUsedFreeTrial: boolean;
  planStartDate: Date | null;
  planEndDate: Date | null;
  planType: (typeof SUBSCRIPTION_PLANS)[number];
  remainingActivityCount: number;
}
