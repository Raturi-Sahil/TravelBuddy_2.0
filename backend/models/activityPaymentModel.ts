import mongoose, { Schema } from "mongoose";

import { IActivityPayment } from "../interfaces/activityPaymentInterface";

export const activityPaymentSchema = new Schema<IActivityPayment>(
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

        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "REFUNDED", "FAILED"],
            default: "PENDING"
        },

        // Cashfree-specific fields
        orderId: {
            type: String
        },
        cfOrderId: {
            type: String
        },
        paymentSessionId: {
            type: String
        },
        orderStatus: {
            type: String
        },
        paymentStatus: {
            type: String
        },
        paymentMethod: {
            type: String
        },
        paymentTime: {
            type: Date
        },
        cfPaymentId: {
            type: String
        },
        bankReference: {
            type: String
        },

        provider: {
            type: String,
            default: "Cashfree"
        }, // Razorpay / Stripe / Cashfree etc.

        providerRef: {
            type: String
        },// payment/order id from gateway

        rawResponse: {
            type: Object
        }
    }, {timestamps: true}
);

// One payment per user per activity (important)
activityPaymentSchema.index(
    {userId: 1, activityId: 1},
    {unique: true}
);

export const ActivityPayment = mongoose.model<IActivityPayment>(
    "ActivityPayment",
    activityPaymentSchema
);
