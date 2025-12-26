import { Router } from "express";
import { generateDescription, generateLocalGuide, generatePackingList, generatePlan, generatePostCaption, generateWeatherForecast } from "../controller/aifeatureContoller";

const router = Router();

router.post("/generate-description", generateDescription);
router.post("/plan-trip", generatePlan);
router.post("/generate-post-caption", generatePostCaption);
router.post("/generate-packing-list", generatePackingList);
router.post("/generate-weather", generateWeatherForecast);
router.post("/generate-local-guide", generateLocalGuide);

export default router;
