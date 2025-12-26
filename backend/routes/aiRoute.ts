import { Router } from "express";
import { generateDescription, generatePackingList, generatePlan, generatePostCaption } from "../controller/aifeatureContoller";

const router = Router();

router.post("/generate-description", generateDescription);
router.post("/plan-trip", generatePlan);
router.post("/generate-post-caption", generatePostCaption);
router.post("/generate-packing-list", generatePackingList);

export default router;
