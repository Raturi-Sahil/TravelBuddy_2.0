
import { Router } from "express";

import {
    createActivity,
    createActivityPaymentOrder,
    deleteActivity,
    getActivities,
    getActivityById,
    getJoinedActivities,
    getMyCreatedActivities,
    getNearbyActivities,
    getParticipants,
    inviteUsers,
    joinActivity,
    leaveActivity,
    respondToInvite,
    updateActivity,
    verifyActivityPayment,
} from "../controller/activityController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// Apply auth middleware to all routes
router.use(requireProfile);

// Core CRUD
router.post("/", upload.fields([{ name: "photos", maxCount: 5 }]), createActivity);
router.get("/", getActivities);
router.get("/joined", getJoinedActivities);
router.get("/my-created", getMyCreatedActivities);
router.get("/nearby", getNearbyActivities);
router.get("/:id", getActivityById);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

// Payment routes (must come before :id/join to avoid conflict)
router.post("/:id/payment", createActivityPaymentOrder);
router.post("/payment/verify", verifyActivityPayment);

// // Social Actions
router.post("/:id/join", joinActivity);
router.post("/:id/leave", leaveActivity);
router.get("/:id/participants", getParticipants);

// Invitations
router.post("/:id/invite", inviteUsers);

// Respond to invite (Accept/Reject)
router.post(
    "/:id/invite/accept",
    (req, res, next) => {
        req.body.status = "Accepted";
        next();
    },
    respondToInvite
);

router.post(
    "/:id/invite/reject",
    (req, res, next) => {
        req.body.status = "Rejected";
        next();
    },
    respondToInvite
);

export default router;


