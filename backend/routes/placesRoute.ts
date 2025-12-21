import { Router } from "express";

import {
    getNearbyEmergency,
    getNearbyHotels,
    getNearbyRestaurants,
    getNearbyShopping,
    getNearbyTouristPlaces,
    getNearbyTransport,
} from "../controller/placesController";

const router = Router();

// GET /places/hotels?lat=XX&lng=YY&radius=ZZ
router.get("/hotels", getNearbyHotels);

// GET /places/tourist?lat=XX&lng=YY&radius=ZZ
router.get("/tourist", getNearbyTouristPlaces);

// GET /places/restaurants?lat=XX&lng=YY&radius=ZZ
router.get("/restaurants", getNearbyRestaurants);

// GET /places/shopping?lat=XX&lng=YY&radius=ZZ
router.get("/shopping", getNearbyShopping);

// GET /places/emergency?lat=XX&lng=YY&radius=ZZ
router.get("/emergency", getNearbyEmergency);

// GET /places/transport?lat=XX&lng=YY&radius=ZZ
router.get("/transport", getNearbyTransport);

export default router;
