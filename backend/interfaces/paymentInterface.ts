import mongoose, { Document, Schema } from "mongoose";

import { SUBSCRIPTION_PLANS } from "../data/enums";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  cfOrderId: string; // Cashfree order ID
  paymentSessionId?: string;
  planType: (typeof SUBSCRIPTION_PLANS)[number];
  amount: number;
  currency: string;
  orderStatus: string; // ACTIVE, PAID, EXPIRED, etc.
  paymentStatus?: string; // SUCCESS, FAILED, PENDING
  paymentMethod?: string;
  paymentTime?: Date;
  cfPaymentId?: string; // Cashfree payment ID
  bankReference?: string;
  rawResponse?: object; // Store full Cashfree response for debugging
  createdAt: Date;
  updatedAt: Date;
}