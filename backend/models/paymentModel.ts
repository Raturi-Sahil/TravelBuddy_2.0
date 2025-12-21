import mongoose, {  Schema } from "mongoose";

import { SUBSCRIPTION_PLANS } from "../data/enums";
import { IPayment } from "../interfaces/paymentInterface";



const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    cfOrderId: { type: String },
    paymentSessionId: { type: String },
    planType: {
      type: String,
      enum: SUBSCRIPTION_PLANS,
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    orderStatus: { type: String, default: "ACTIVE" },
    paymentStatus: { type: String },
    paymentMethod: { type: String },
    paymentTime: { type: Date },
    cfPaymentId: { type: String },
    bankReference: { type: String },
    rawResponse: { type: Object },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
