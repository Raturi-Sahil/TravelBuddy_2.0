import { Router } from "express";
import { registerUser, getProfile, updateProfile } from "../controller/userController";
import { verifyJWT } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// For form-data without files
router.post("/register", upload.none(), registerUser);


router.get("/profile", verifyJWT, getProfile);

router.patch("/update-profile", verifyJWT, upload.single("profilePicture"), updateProfile);


export default router;
