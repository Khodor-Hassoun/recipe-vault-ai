// TODO: Define Zod validation schemas for forms and API route bodies

import { z } from "zod";

// TODO: Ingredient schema
export const ingredientSchema = z.object({
  // TODO: name, quantity, unit
});

// TODO: Step schema
export const stepSchema = z.object({
  // TODO: order, instruction, duration_minutes (optional)
});

// TODO: Create/update recipe schema
export const recipeSchema = z.object({
  // TODO: title, description, ingredients, steps, tags, status, is_public, cover_image_url
});

// TODO: Login schema
export const loginSchema = z.object({
  // TODO: email, password
});

// TODO: Signup schema
export const signupSchema = z.object({
  // TODO: email, password, confirmPassword
});

// TODO: AI generate prompt schema
export const aiGenerateSchema = z.object({
  // TODO: prompt (string describing the desired recipe)
});

// TODO: AI suggest schema
export const aiSuggestSchema = z.object({
  // TODO: partial recipe fields to base suggestions on
});

// Inferred types
export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
