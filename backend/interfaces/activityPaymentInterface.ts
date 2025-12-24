import { Document, Types } from "mongoose";

export type ActivityPaymentStatus = "PENDING" | "SUCCESS" | "REFUNDED" | "FAILED";

export interface IActivityPayment extends Document {
  userId: Types.ObjectId;
  activityId: Types.ObjectId;

  amount: number;
  currency: string;

  status: ActivityPaymentStatus;

  provider: string;        // Razorpay / Stripe / Cashfree etc.
  providerRef?: string;    // payment/order id from gateway

  rawResponse?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}
