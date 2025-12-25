import { Document, Types } from "mongoose";

export type ActivityPaymentStatus = "PENDING" | "SUCCESS" | "REFUNDED" | "FAILED";

export interface IActivityPayment extends Document {
  userId: Types.ObjectId;
  activityId: Types.ObjectId;

  amount: number;
  currency: string;

  status: ActivityPaymentStatus;

  // Cashfree-specific fields
  orderId?: string;           // Custom order ID
  cfOrderId?: string;         // Cashfree order ID
  paymentSessionId?: string;  // Session ID for payment
  orderStatus?: string;       // Order status from Cashfree
  paymentStatus?: string;     // Payment status from gateway
  paymentMethod?: string;     // card/upi/netbanking etc.
  paymentTime?: Date;         // When payment was completed
  cfPaymentId?: string;       // Cashfree payment reference ID
  bankReference?: string;     // Bank reference number

  provider: string;        // Razorpay / Stripe / Cashfree etc.
  providerRef?: string;    // payment/order id from gateway

  rawResponse?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}
