import { Router } from "express";

import {
  createActivityPayment,
  verifyActivityPayment,
} from "../controller/activityPaymentController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = Router();

// All payment routes require auth
router.use(requireProfile);

// Create payment intent for an activity
router.post("/:activityId/pay", createActivityPayment);

// Verify payment (called after gateway success)
router.post("/:activityId/pay/verify", verifyActivityPayment);

export default router;
