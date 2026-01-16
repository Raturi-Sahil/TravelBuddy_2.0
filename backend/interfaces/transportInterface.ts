import { Document, Types } from "mongoose";

export type VehicleType = "taxi" | "auto" | "minivan" | "tempo" | "bus" | "bike";
export type PriceType = "per_trip" | "per_day" | "per_km" | "per_seat";
export type ListingStatus = "pending" | "approved" | "rejected" | "suspended";

export interface ITransport extends Document {
  owner: Types.ObjectId;

  // Vehicle Details
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleNumber?: string;
  seatingCapacity: number;
  vehicleImages: string[];

  // Route & Service
  route: string;
  serviceArea: string;
  serviceAreaCoordinates?: {
    type: string;
    coordinates: number[];
  };

  // Pricing
  minPrice: number;
  maxPrice?: number;
  priceType: PriceType;

  // Contact
  phone: string;
  whatsapp?: string;

  // Additional Info
  features: string[];
  languages: string[];
  description?: string;

  // Status
  isActive: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  listingStatus: ListingStatus;
  rejectionReason?: string;

  // Stats
  averageRating: number;
  totalReviews: number;
  totalContacts: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ITransportReview extends Document {
  transport: Types.ObjectId;
  reviewer: Types.ObjectId;

  rating: number; // 1-5
  comment: string;

  createdAt: Date;
}

export interface ITransportContact extends Document {
  transport: Types.ObjectId;
  user: Types.ObjectId;

  contactType: "call" | "whatsapp";

  createdAt: Date;
}
