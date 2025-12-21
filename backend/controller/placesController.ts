import { NextFunction, Request, Response } from "express";

import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_API;
const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

interface PlaceResult {
    place_id: string;
    name: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    vicinity?: string;
    types?: string[];
    opening_hours?: {
        open_now?: boolean;
    };
    international_phone_number?: string;
    business_status?: string;
}

// Helper to get photo URL from photo reference
const getPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
    return `${PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

// Helper to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

// Helper to transform places response
const transformPlaceResult = (
    place: PlaceResult,
    userLat: number,
    userLng: number
) => {
    // Get the photo URL if available, otherwise empty string (frontend handles placeholder)
    const image = place.photos?.[0]
        ? getPhotoUrl(place.photos[0].photo_reference, 800)
        : "";

    return {
        _id: place.place_id,
        name: place.name,
        image,
        hasPhoto: !!place.photos?.[0],
        currentLocation: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        },
        distanceKm: calculateDistance(
            userLat,
            userLng,
            place.geometry.location.lat,
            place.geometry.location.lng
        ),
        rating: place.rating || 0,
        vicinity: place.vicinity || "",
        types: place.types || [],
        isOpen: place.opening_hours?.open_now,
        totalRatings: place.user_ratings_total || 0,
        phoneNumber: place.international_phone_number || "",
        businessStatus: place.business_status || "UNKNOWN",
    };
};

// Get Nearby Hotels
export const getNearbyHotels = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000", search, pageToken } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        let url: string;
        const searchQuery = (search as string)?.trim();
        const token = (pageToken as string)?.trim();
        const isSearchResult = !!searchQuery;
        
        if (token) {
            // Pagination - use next_page_token
            url = `${PLACES_BASE_URL}/${searchQuery ? 'textsearch' : 'nearbysearch'}/json?pagetoken=${token}&key=${GOOGLE_PLACES_API_KEY}`;
        } else if (searchQuery) {
            // Text Search API - search by name (no type restriction for better matching)
            const query = encodeURIComponent(searchQuery);
            url = `${PLACES_BASE_URL}/textsearch/json?query=${query}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
        } else {
            // Nearby Search API - radius-based browsing
            url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=lodging&key=${GOOGLE_PLACES_API_KEY}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            throw new ApiError(
                500,
                `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
            );
        }

        const hotels = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        // Add amenities from types
        const hotelsWithAmenities = hotels.map((hotel: ReturnType<typeof transformPlaceResult>) => ({
            ...hotel,
            amenities: hotel.types
                ?.filter((t: string) => !["lodging", "point_of_interest", "establishment"].includes(t))
                .slice(0, 3)
                .map((t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())) || [],
        }));
        
        return res
            .status(200)
            .json(new ApiResponse(200, {
                places: hotelsWithAmenities,
                nextPageToken: data.next_page_token || null,
                isSearchResult,
            }, "Hotels fetched successfully"));
    }
);

// Get Nearby Tourist Places
export const getNearbyTouristPlaces = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000", search, pageToken } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        let url: string;
        const searchQuery = (search as string)?.trim();
        const token = (pageToken as string)?.trim();
        const isSearchResult = !!searchQuery;
        
        if (token) {
            // Pagination
            url = `${PLACES_BASE_URL}/${searchQuery ? 'textsearch' : 'nearbysearch'}/json?pagetoken=${token}&key=${GOOGLE_PLACES_API_KEY}`;
        } else if (searchQuery) {
            // Text Search API - search by name
            const query = encodeURIComponent(searchQuery);
            url = `${PLACES_BASE_URL}/textsearch/json?query=${query}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
        } else {
            // Nearby Search API - radius-based browsing
            url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            throw new ApiError(
                500,
                `Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`
            );
        }

        const places = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        // Add category and entry fee estimation
        const placesWithDetails = places.map((place: ReturnType<typeof transformPlaceResult>) => {
            // Determine category from types
            let category = "Attraction";
            if (place.types?.some((t: string) => ["museum", "art_gallery"].includes(t))) {
                category = "Culture";
            } else if (place.types?.some((t: string) => ["park", "natural_feature"].includes(t))) {
                category = "Nature";
            } else if (place.types?.some((t: string) => ["church", "hindu_temple", "mosque", "synagogue", "place_of_worship"].includes(t))) {
                category = "Religious";
            } else if (place.types?.some((t: string) => ["point_of_interest", "establishment"].includes(t))) {
                category = "Historical";
            }

            return {
                ...place,
                category,
                openTime: place.isOpen !== undefined
                    ? (place.isOpen ? "Open Now" : "Currently Closed")
                    : "Hours Vary",
            };
        });

        return res
            .status(200)
            .json(new ApiResponse(200, {
                places: placesWithDetails,
                nextPageToken: data.next_page_token || null,
                isSearchResult,
            }, "Tourist places fetched successfully"));
    }
);

// Get Nearby Restaurants (Food & Nightlife)
export const getNearbyRestaurants = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000", search, pageToken } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        const searchQuery = (search as string)?.trim();
        const token = (pageToken as string)?.trim();
        const isSearchResult = !!searchQuery;
        let data: any = { results: [], next_page_token: null };

        if (token) {
            // Pagination
            const url = `${PLACES_BASE_URL}/${searchQuery ? 'textsearch' : 'nearbysearch'}/json?pagetoken=${token}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else if (searchQuery) {
            // Text Search API - search by name only (no suffix for exact matching)
            const query = encodeURIComponent(searchQuery);
            const url = `${PLACES_BASE_URL}/textsearch/json?query=${query}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else {
            // Nearby Search API - use single type for pagination support
            const url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        }

        const places = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        // Add category
        const placesWithCategory = places.map((place: ReturnType<typeof transformPlaceResult>) => {
            let category = "Restaurant";
            if (place.types?.some((t: string) => t === "cafe")) {
                category = "Cafe";
            } else if (place.types?.some((t: string) => t === "bar")) {
                category = "Bar";
            } else if (place.types?.some((t: string) => t === "night_club")) {
                category = "Nightclub";
            }

            return { ...place, category };
        });

        return res
            .status(200)
            .json(new ApiResponse(200, {
                places: placesWithCategory,
                nextPageToken: data.next_page_token || null,
                isSearchResult,
            }, "Restaurants fetched successfully"));
    }
);

// Get Nearby Shopping
export const getNearbyShopping = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000", search, pageToken } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        const searchQuery = (search as string)?.trim();
        const token = (pageToken as string)?.trim();
        const isSearchResult = !!searchQuery;
        let data: any = { results: [], next_page_token: null };

        if (token) {
            // Pagination
            const url = `${PLACES_BASE_URL}/${searchQuery ? 'textsearch' : 'nearbysearch'}/json?pagetoken=${token}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else if (searchQuery) {
            // Text Search API - search by name only
            const query = encodeURIComponent(searchQuery);
            const url = `${PLACES_BASE_URL}/textsearch/json?query=${query}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else {
            // Nearby Search API - use single type for pagination support
            const url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=shopping_mall&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        }

        const places = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        const placesWithCategory = places.map((place: ReturnType<typeof transformPlaceResult>) => {
            let category = "Store";
            if (place.types?.some((t: string) => t === "shopping_mall")) {
                category = "Mall";
            } else if (place.types?.some((t: string) => t === "supermarket")) {
                category = "Supermarket";
            } else if (place.types?.some((t: string) => t === "clothing_store")) {
                category = "Clothing";
            }

            return { ...place, category };
        });

        return res
            .status(200)
            .json(new ApiResponse(200, {
                places: placesWithCategory,
                nextPageToken: data.next_page_token || null,
                isSearchResult,
            }, "Shopping fetched successfully"));
    }
);

// Get Nearby Emergency Services
export const getNearbyEmergency = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000", search, pageToken } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        const searchQuery = (search as string)?.trim();
        const token = (pageToken as string)?.trim();
        const isSearchResult = !!searchQuery;
        let data: any = { results: [], next_page_token: null };

        if (token) {
            // Pagination
            const url = `${PLACES_BASE_URL}/${searchQuery ? 'textsearch' : 'nearbysearch'}/json?pagetoken=${token}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else if (searchQuery) {
            // Text Search API - search by name only
            const query = encodeURIComponent(searchQuery);
            const url = `${PLACES_BASE_URL}/textsearch/json?query=${query}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else {
            // Nearby Search API - use single type for pagination support
            const url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        }

        const places = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        const placesWithCategory = places.map((place: ReturnType<typeof transformPlaceResult>) => {
            let category = "Emergency";
            if (place.types?.some((t: string) => t === "hospital")) {
                category = "Hospital";
            } else if (place.types?.some((t: string) => t === "pharmacy")) {
                category = "Pharmacy";
            } else if (place.types?.some((t: string) => t === "police")) {
                category = "Police";
            } else if (place.types?.some((t: string) => t === "fire_station")) {
                category = "Fire Station";
            } else if (place.types?.some((t: string) => t === "atm")) {
                category = "ATM";
            } else if (place.types?.some((t: string) => t === "bank")) {
                category = "Bank";
            }

            return { ...place, category };
        });

        return res
            .status(200)
            .json(new ApiResponse(200, {
                places: placesWithCategory,
                nextPageToken: data.next_page_token || null,
                isSearchResult,
            }, "Emergency services fetched successfully"));
    }
);

// Get Nearby Transport
export const getNearbyTransport = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { lat, lng, radius = "20000", search, pageToken } = req.query;

        if (!lat || !lng) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        if (!GOOGLE_PLACES_API_KEY) {
            throw new ApiError(500, "Google Places API key not configured");
        }

        const searchQuery = (search as string)?.trim();
        const token = (pageToken as string)?.trim();
        const isSearchResult = !!searchQuery;
        let data: any = { results: [], next_page_token: null };

        if (token) {
            // Pagination
            const url = `${PLACES_BASE_URL}/${searchQuery ? 'textsearch' : 'nearbysearch'}/json?pagetoken=${token}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else if (searchQuery) {
            // Text Search API - search by name only
            const query = encodeURIComponent(searchQuery);
            const url = `${PLACES_BASE_URL}/textsearch/json?query=${query}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        } else {
            // Nearby Search API - use single type for pagination support
            const url = `${PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=transit_station&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(url);
            data = await response.json();
        }

        const places = (data.results || []).map((place: PlaceResult) =>
            transformPlaceResult(place, parseFloat(lat as string), parseFloat(lng as string))
        );

        const placesWithCategory = places.map((place: ReturnType<typeof transformPlaceResult>) => {
            let category = "Transport";
            if (place.types?.some((t: string) => t === "airport")) {
                category = "Airport";
            } else if (place.types?.some((t: string) => t === "bus_station")) {
                category = "Bus Station";
            } else if (place.types?.some((t: string) => t === "train_station")) {
                category = "Train Station";
            } else if (place.types?.some((t: string) => t === "subway_station")) {
                category = "Metro";
            } else if (place.types?.some((t: string) => t === "car_rental")) {
                category = "Car Rental";
            } else if (place.types?.some((t: string) => t === "gas_station")) {
                category = "Gas Station";
            }

            return { ...place, category };
        });

        return res
            .status(200)
            .json(new ApiResponse(200, {
                places: placesWithCategory,
                nextPageToken: data.next_page_token || null,
                isSearchResult,
            }, "Transport fetched successfully"));
    }
);
