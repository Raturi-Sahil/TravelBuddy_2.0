import axios from "axios";
import { Request, Response } from "express";
import mongoose from "mongoose";

import { Activity } from "../models/activityModel";
import { ActivityPayment } from "../models/activityPaymentModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { getCashfreeConfig } from "../utils/cashfree";

export const createActivityPayment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {

    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const userId = req.user._id;
    const { activityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new ApiError(400, "Invalid activity id");
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new ApiError(404, "Activity not found");
    }

    if (!activity.price || activity.price <= 0) {
      throw new ApiError(400, "This activity does not require payment");
    }

    if (activity.participants.length >= activity.maxCapacity) {
      throw new ApiError(409, "Activity is already full");
    }

    let payment = await ActivityPayment.findOne({ userId, activityId });

    if (payment?.status === "SUCCESS") {
      throw new ApiError(409, "Payment already completed");
    }

    if (!payment) {
      payment = await ActivityPayment.create({
        userId,
        activityId,
        amount: activity.price,
        currency: "INR",
        provider: "CASHFREE",
        status: "PENDING",
      });
    }

    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();

    const response = await axios.post(
      `${BASE_URL}/orders`,
      {
        order_id: payment._id.toString(),
        order_amount: activity.price,
        order_currency: "INR",
        customer_details: {
          customer_id: userId.toString(),
        },
      },
      {
        headers: {
          "x-client-id": CF_APP_ID,
          "x-client-secret": CF_SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    const cfData = response.data;

    await ActivityPayment.findByIdAndUpdate(payment._id, {
      providerRef: cfData.cf_order_id,
      rawResponse: cfData,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentId: payment._id,
          cfOrderId: cfData.cf_order_id,
          paymentSessionId: cfData.payment_session_id,
          amount: activity.price,
          currency: "INR",
        },
        "Payment initiated successfully"
      )
    );
  }
);

export const verifyActivityPayment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {

    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const userId = req.user._id;
    const { activityId } = req.params;
    const { cfOrderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new ApiError(400, "Invalid activity id");
    }

    if (!cfOrderId) {
      throw new ApiError(400, "cfOrderId is required");
    }

    // Find payment
    const payment = await ActivityPayment.findOne({
      userId,
      activityId,
    });

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    if (payment.status === "SUCCESS") {
      return res.status(200).json(
        new ApiResponse(200, payment.status, "Payment already verified")
      );
    }

    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();

    // Verify with Cashfree
    const response = await axios.get(
      `${BASE_URL}/orders/${cfOrderId}`,
      {
        headers: {
          "x-client-id": CF_APP_ID,
          "x-client-secret": CF_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      }
    );

    const cfData = response.data;

    // Update payment based on gateway status
    if (cfData.order_status === "PAID") {
      await ActivityPayment.findByIdAndUpdate(payment._id, {
        status: "SUCCESS",
        rawResponse: cfData,
      });

      return res.status(200).json(
        new ApiResponse(200, "SUCCESS", "Payment verified successfully")
      );
    }

    // Payment failed / not completed
    await ActivityPayment.findByIdAndUpdate(payment._id, {
      status: "FAILED",
      rawResponse: cfData,
    });

    throw new ApiError(402, "Payment not successful");
  }
);