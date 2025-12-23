import mongoose, { Schema } from "mongoose";

export interface IActivityPayment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  activityId: mongoose.Types.ObjectId;
  orderId: string;
  cfOrderId?: string;
  paymentSessionId?: string;
  amount: number;
  currency: string;
  orderStatus: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentTime?: Date;
  cfPaymentId?: string;
  bankReference?: string;
  rawResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const activityPaymentSchema = new Schema<IActivityPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    cfOrderId: { type: String },
    paymentSessionId: { type: String },
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

export const ActivityPayment = mongoose.model<IActivityPayment>(
  "ActivityPayment",
  activityPaymentSchema
);
