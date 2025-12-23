
import { Router } from "express";

import {
    createActivity,
    deleteActivity,
    getActivities,
    getActivityById,
    getParticipants,
    inviteUsers,
    joinActivity,
    leaveActivity,
    respondToInvite,
    updateActivity,
} from "../controller/activityController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// Apply auth middleware to all routes
router.use(requireProfile);

// Core CRUD
router.post("/", upload.fields([{ name: "photos", maxCount: 5 }]), createActivity);
router.get("/", getActivities);
router.get("/:id", getActivityById);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

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

