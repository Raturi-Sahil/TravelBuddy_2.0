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
  ${price ? `Price: ${price}` : ''}
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
