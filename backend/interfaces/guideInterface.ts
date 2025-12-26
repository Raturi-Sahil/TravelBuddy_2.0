import { Document, Types } from "mongoose";

import { IGeoPoint,ILanguage } from "./userInterface";

export interface IAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
}

export interface IGuide extends Document {
  user: Types.ObjectId;
  isActive: boolean;
  isVerified: boolean;
  
  city: string;
  cityCoordinates: IGeoPoint;
  
  specialties: string[];
  languages: ILanguage[];
  
  pricePerHour: number;
  experience: number; // years
  
  bio: string;
  coverImages: string[];
  
  availability: IAvailability[];
  
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuideBooking extends Document {
  guide: Types.ObjectId;
  traveler: Types.ObjectId;
  
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // hours
  
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "refunded";
  
  status: "pending" | "accepted" | "confirmed" | "completed" | "cancelled";
  cancellationReason?: string;
  cancelledBy?: Types.ObjectId;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuideReview extends Document {
  guide: Types.ObjectId;
  booking: Types.ObjectId;
  reviewer: Types.ObjectId;
  
  rating: number; // 1-5
  comment: string;
  
  createdAt: Date;
}
