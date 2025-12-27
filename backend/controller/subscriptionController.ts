import axios from "axios";
import { Request, Response } from "express";

import { Payment } from "../models/paymentModel";
import { User } from "../models/userModel";

const getCashfreeConfig = () => {
    const CF_APP_ID = process.env.CASHFREE_APP_ID;
    const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const CF_ENV = process.env.CASHFREE_ENV || "TEST"; // TEST or PROD
    const BASE_URL = CF_ENV === "PROD"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";
    return { CF_APP_ID, CF_SECRET_KEY, BASE_URL };
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();
    const { amount, planType } = req.body;
    const userId = req.user?._id;

    console.log("Create Order Request:", { amount, planType, userId });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!CF_APP_ID || !CF_SECRET_KEY) {
        console.error("Cashfree Creds missing");
        return res.status(500).json({ message: "Payment configuration missing" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderId = `ORDER_${Date.now()}_${userId.toString().slice(-4)}`;

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_email: "user@example.com", // You might want to store email in User model too
        customer_phone: user.mobile,
        customer_name: "TravelBuddy User"
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}payment-status?order_id=${orderId}`
      },
      order_tags: {
        planType: planType
      }
    };

    const response = await axios.post(`${BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      }
    });

    // Save initial payment record
    await Payment.create({
      userId: userId,
      orderId: orderId,
      cfOrderId: response.data.cf_order_id,
      paymentSessionId: response.data.payment_session_id,
      planType: planType,
      amount: amount,
      currency: "INR",
      orderStatus: response.data.order_status || "ACTIVE",
      rawResponse: response.data,
    });

    res.status(200).json(response.data);

  } catch (error: any) {
    console.error("Create Order Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create order", error: error.response?.data || error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();
    const { orderId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    });

    const orderData = response.data;
    const orderStatus = orderData.order_status;

    // Update payment record
    const paymentRecord = await Payment.findOne({ orderId: orderId });
    if (paymentRecord) {
      paymentRecord.orderStatus = orderStatus;
      paymentRecord.rawResponse = orderData;

      // If there are payment details in the response
      if (orderData.payments && orderData.payments.length > 0) {
        const paymentDetails = orderData.payments[0];
        paymentRecord.paymentStatus = paymentDetails.payment_status;
        paymentRecord.paymentMethod = paymentDetails.payment_method?.card?.channel ||
                                       paymentDetails.payment_method?.upi?.channel ||
                                       paymentDetails.payment_method?.netbanking?.channel ||
                                       "Unknown";
        paymentRecord.paymentTime = paymentDetails.payment_time ? new Date(paymentDetails.payment_time) : undefined;
        paymentRecord.cfPaymentId = paymentDetails.cf_payment_id;
        paymentRecord.bankReference = paymentDetails.bank_reference;
      }

      await paymentRecord.save();
    }

    if (orderStatus === "PAID") {
      const planType = orderData.order_tags?.planType;

      const user = await User.findById(userId);
      if (user) {
        const now = new Date();

        if (planType === "Single") {
            user.remainingActivityCount = (user.remainingActivityCount || 0) + 1;
             if (user.planType === "None") {
                 user.planType = "Single";
             }
        } else if (planType === "Monthly") {
            user.planType = "Monthly";
            user.planStartDate = now;
            user.planEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            user.hasUsedFreeTrial = true;
        } else if (planType === "Yearly") {
            user.planType = "Yearly";
            user.planStartDate = now;
            user.planEndDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            user.hasUsedFreeTrial = true;
        }

        await user.save();
        res.status(200).json({ status: "PAID", message: "Subscription updated successfully", user, payment: paymentRecord });
      } else {
        res.status(404).json({ message: "User not found to update subscription" });
      }
    } else {
      res.status(400).json({ status: orderStatus, message: "Payment not completed", payment: paymentRecord });
    }

  } catch (error: any) {
    console.error("Verify Payment Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to verify payment", error: error.response?.data || error.message });
  }
};

// Get user's payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ payments });

  } catch (error: any) {
    console.error("Get Payment History Error:", error.message);
    res.status(500).json({ message: "Failed to fetch payment history", error: error.message });
  }
};
