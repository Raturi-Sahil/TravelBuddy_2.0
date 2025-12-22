import { Router } from "express";
import { generateDescription,generatePlan } from "../controller/aifeatureContoller";

const router = Router();

router.post("/generate-description", generateDescription);
router.post("/plan-trip",generatePlan);

export default router;
