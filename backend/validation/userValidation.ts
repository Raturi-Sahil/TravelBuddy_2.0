import { z } from "zod";

import {
  COUNTRIES,
  GENDERS,
  INTERESTS,
  LANGUAGE_LEVELS,
  LANGUAGES,
  TRAVEL_STYLES,
} from "../data/enums";

// Reusable sub-schemas
export const languageSchema = z.object({
  name: z.enum(LANGUAGES as [string, ...string[]]),
  level: z.enum(LANGUAGE_LEVELS as [string, ...string[]]),
});

export const futureDestinationSchema = z.object({
  name: z.string(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export const socialLinksSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

// Schema for user registration - required fields for initial signup
export const registerUserSchema = z.object({
  clerk_id: z.string().min(1, "Clerk ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  profileImageUrl: z.string().url().optional().or(z.literal("")), // Clerk's image URL

  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),

  countryCode: z.string().min(1, "Country code is required"),

  dob: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d <= new Date();
  }, "Invalid or future DOB"),

  gender: z.enum(GENDERS as [string, ...string[]]),

  nationality: z.enum(COUNTRIES as [string, ...string[]]),

  languages: z
    .array(languageSchema)
    .min(1, "At least one language is required"),

  interests: z
    .array(z.enum(INTERESTS as [string, ...string[]]))
    .optional(),

  socialLinks: socialLinksSchema.optional(),

  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

// Schema for updating profile - all fields optional
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),

  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .optional(),

  countryCode: z.string().min(1, "Country code is required").optional(),

  dob: z
    .string()
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d <= new Date();
    }, "Invalid or future DOB")
    .optional(),

  gender: z.enum(GENDERS as [string, ...string[]]).optional(),

  nationality: z.enum(COUNTRIES as [string, ...string[]]).optional(),

  travelStyle: z.enum(TRAVEL_STYLES as [string, ...string[]]).optional(),

  profileVisibility: z.enum(["Public", "Private"] as [string, ...string[]]).optional(),

  languages: z.array(languageSchema).optional(),

  interests: z
    .array(z.enum(INTERESTS as [string, ...string[]]))
    .optional(),

  futureDestinations: z.array(futureDestinationSchema).optional(),

  socialLinks: socialLinksSchema.optional(),

  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

