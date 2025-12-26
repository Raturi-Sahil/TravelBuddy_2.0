import { NextFunction,Request, Response } from "express";
import OpenAI from "openai";

import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

export const generateDescription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   const { title, category, location, date, startTime, price, maxCapacity } = req.body;

   if(!title || !category){
    throw new ApiError(400,"Title and category are required");
   }

   console.log('Generating AI description for:', title, category);

   // Groq AI uses OpenAI-compatible API
   const client = new OpenAI({
     apiKey: process.env.GROQ_API_KEY,
     baseURL: "https://api.groq.com/openai/v1",
   });

   try {
     const prompt = `
  You are an expert activity planner.

  Generate a short and engaging activity description based on these details:
  Title: ${title}
  Category: ${category}
  ${location ? `Location: ${location}` : ''}
  ${date ? `Date: ${date}` : ''}
  ${startTime ? `Time: ${startTime}` : ''}
  ${price ? `Price: ₹${price}` : ''}
  ${maxCapacity ? `Max People: ${maxCapacity}` : ''}

  Requirements:
  - 5 to 6 sentences
  - Simple and clear English
  - No emojis
  - Friendly and inviting tone
  - Highlight the key features based on the provided details
  `;

     const completion = await client.chat.completions.create({
       model: "llama-3.1-8b-instant",
       messages: [{ role: "user", content: prompt }],
     });

     const description = completion.choices[0]?.message?.content;

     if (!description) {
       throw new Error("No description generated");
     }

     return res.status(200).json(new ApiResponse(200, description, "Description generated successfully"));

   } catch (error: any) {
     console.error("Groq AI Error:", error);

     if (error.status === 401) {
        throw new ApiError(401, "Invalid Groq API key.");
     }

     throw new ApiError(500, error.message || "Failed to generate description via AI");
   }
})

export const generatePlan = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   const { destination, startDate, endDate, budget, travelers, interests, travelStyle } = req.body;

   if(!destination || !startDate || !endDate){
    throw new ApiError(400,"Destination, start date, and end date are required");
   }

   console.log('Generating AI trip plan for:', destination);

   // Calculate number of days
   const start = new Date(startDate);
   const end = new Date(endDate);
   const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

   // Groq AI uses OpenAI-compatible API
   const client = new OpenAI({
     apiKey: process.env.GROQ_API_KEY,
     baseURL: "https://api.groq.com/openai/v1",
   });

   try {
     const prompt = `
  You are an expert trip planner. Generate a personalized itinerary in JSON format.

  Trip Details:
  - Destination: ${destination}
  - Start Date: ${startDate}
  - End Date: ${endDate}
  - Duration: ${daysDiff} days
  - Budget: ₹${budget} INR
  - Travelers: ${travelers} people
  - Interests: ${interests.join(", ")}
  - Travel Style: ${travelStyle}

  IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure:
  {
    "title": "Catchy trip title with destination name",
    "days": ${daysDiff},
    "itinerary": [
      {
        "day": 1,
        "title": "Day theme/focus",
        "activities": ["Activity 1", "Activity 2", "Activity 3"]
      }
    ]
  }

  Requirements:
  - Create ${daysDiff} days of itinerary
  - Each day should have 3-5 activities
  - Simple, clear English (no emojis)
  - Consider the budget (${travelStyle} style)
  - Focus on the interests: ${interests.join(", ")}
  - Activities should be realistic and location-specific
  `;

     const completion = await client.chat.completions.create({
       model: "llama-3.1-8b-instant",
       messages: [{ role: "user", content: prompt }],
       temperature: 0.7,
     });

     const rawResponse = completion.choices[0]?.message?.content;

     if (!rawResponse) {
       throw new Error("No itinerary generated");
     }

     // Clean and parse JSON response
     let itineraryData;
     try {
       // Remove markdown code blocks if present
       const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
       itineraryData = JSON.parse(cleanedResponse);
     } catch (parseError) {
       console.error("JSON Parse Error:", parseError);
       console.log("Raw AI Response:", rawResponse);
       throw new Error("Failed to parse AI response as JSON");
     }

     // Validate the structure
     if (!itineraryData.title || !itineraryData.days || !Array.isArray(itineraryData.itinerary)) {
       throw new Error("Invalid itinerary structure from AI");
     }

     return res.status(200).json(new ApiResponse(200, itineraryData, "Itinerary generated successfully"));

   } catch (error: any) {
     console.error("Groq AI Error:", error);

     if (error.status === 401) {
        throw new ApiError(401, "Invalid Groq API key.");
     }

     throw new ApiError(500, error.message || "Failed to generate itinerary via AI");
   }
})

export const generatePostCaption = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   const { title, category, location, tags, currentCaption } = req.body;

   console.log('Generating AI post caption:', { title, location, tags });

   // Groq AI uses OpenAI-compatible API
   const client = new OpenAI({
     apiKey: process.env.GROQ_API_KEY,
     baseURL: "https://api.groq.com/openai/v1",
   });

   try {
     const prompt = `
  You are a creative travel content writer who helps travelers share their experiences on social media.

  Transform the user's brief travel experience into an engaging, authentic post caption.

  User's Experience:
  ${currentCaption ? `Brief notes: "${currentCaption}"` : ''}
  ${location ? `Location: ${location}` : ''}
  ${tags ? `Tags/Themes: ${tags}` : ''}
  ${title ? `Context: ${title}` : ''}

  Requirements:
  - Write a personal, engaging caption (2-4 sentences for short notes, 4-6 for longer experiences)
  - Use a conversational, authentic tone (first-person perspective)
  - Include 1-3 relevant emojis naturally within the text (not at the end)
  - Capture the emotion and atmosphere of the experience
  - End with 3-5 relevant hashtags
  - Make it feel genuine, not overly promotional
  - If user mentioned specific details, keep them but enhance the storytelling
  - Don't use marketing language or phrases like "Join us" or "Come experience"
  - Write as if the user is sharing their personal travel story with friends

  Example style:
  "Caught the most incredible sunset 🌅 at Bali's hidden beach yesterday. The way the golden light danced on the waves was absolutely mesmerizing. Sometimes the best moments are the unplanned ones ✨ #bali #sunset #travelmoments #beachlife #wanderlust"

  Now write the caption based on the user's experience:
  `;

     const completion = await client.chat.completions.create({
       model: "llama-3.1-8b-instant",
       messages: [{ role: "user", content: prompt }],
       temperature: 0.8, // Higher temperature for more creative, varied outputs
     });

     const caption = completion.choices[0]?.message?.content;

     if (!caption) {
       throw new Error("No caption generated");
     }

     // Clean up the caption (remove quotes if AI added them)
     const cleanedCaption = caption.replace(/^["']|["']$/g, '').trim();

     return res.status(200).json(new ApiResponse(200, cleanedCaption, "Caption generated successfully"));

   } catch (error: any) {
     console.error("Groq AI Error:", error);

     if (error.status === 401) {
        throw new ApiError(401, "Invalid Groq API key.");
     }

     throw new ApiError(500, error.message || "Failed to generate caption via AI");
   }
})

export const generatePackingList = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   const { destination, travelDate, tripDuration, tripType, gender, activities } = req.body;

   if (!destination || !travelDate || !tripDuration) {
      throw new ApiError(400, "Destination, travel date, and duration are required");
   }

   console.log('Generating AI packing list for:', destination);

   // Groq AI uses OpenAI-compatible API
   const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
   });

   try {
      const prompt = `
     You are an expert travel assistant. Generate a personalized packing list in JSON format.

     Trip Details:
     - Destination: ${destination}
     - Date: ${travelDate}
     - Duration: ${tripDuration} days
     - Type: ${tripType}
     - Traveler: ${gender}
     - Activities: ${activities ? activities.join(", ") : "General sightseeing"}

     IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
     {
       "title": "Packing List for [Destination]",
       "weather": {
         "condition": "Expected weather condition (e.g., Sunny/Rainy)",
         "temp": "Average temperature range",
         "advice": "Brief weather-related advice"
       },
       "categories": [
         {
           "name": "Category Name (e.g., Clothing, Hygiene)",
           "items": ["Item 1", "Item 2", "Item 3"]
         }
       ]
     }

     Requirements:
     - Categories should cover: Clothing, Toiletries, Electronics, Documents, Medicine, Miscellaneous
     - Customize items based on gender (${gender}), trip type (${tripType}), and activities
     - Include specific items for the destination's likely weather in [Month of Travel Date]
     - Simple, clear English
     `;

      const completion = await client.chat.completions.create({
         model: "llama-3.1-8b-instant",
         messages: [{ role: "user", content: prompt }],
         temperature: 0.7,
      });

      const rawResponse = completion.choices[0]?.message?.content;

      if (!rawResponse) {
         throw new Error("No packing list generated");
      }

      // Clean and parse JSON response
      let packingData;
      try {
         // Remove markdown code blocks if present
         const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
         packingData = JSON.parse(cleanedResponse);
      } catch (parseError) {
         console.error("JSON Parse Error:", parseError);
         console.log("Raw AI Response:", rawResponse);
         throw new Error("Failed to parse AI response as JSON");
      }

      // Validate the structure
      if (!packingData.categories || !Array.isArray(packingData.categories)) {
         throw new Error("Invalid packing list structure from AI");
      }

      return res.status(200).json(new ApiResponse(200, packingData, "Packing list generated successfully"));

   } catch (error: any) {
      console.error("Groq AI Error:", error);

      if (error.status === 401) {
         throw new ApiError(401, "Invalid Groq API key.");
      }

      throw new ApiError(500, error.message || "Failed to generate packing list via AI");
   }
})
