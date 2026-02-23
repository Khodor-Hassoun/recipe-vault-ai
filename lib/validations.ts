import { z } from "zod";

// ---------------------------------------------------------------------------
// Building-block schemas
// ---------------------------------------------------------------------------

export const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  amount: z.string().min(1, "Amount is required"),
  unit: z.string().min(1, "Unit is required"),
});

export const instructionStepSchema = z.object({
  step: z.number().int().positive(),
  text: z.string().min(1, "Instruction text is required"),
});

// ---------------------------------------------------------------------------
// Recipe schemas
// ---------------------------------------------------------------------------

const recipeStatusSchema = z.enum(["favorite", "to_try", "made_before"]);

/** Full shape used when creating a recipe */
export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().default(null),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
  instructions: z.array(instructionStepSchema).min(1, "At least one instruction step is required"),
  cuisine_type: z.string().max(100).nullable().default(null),
  prep_time_mins: z.number().int().nonnegative().nullable().default(null),
  cook_time_mins: z.number().int().nonnegative().nullable().default(null),
  servings: z.number().int().positive().nullable().default(null),
  image_url: z.string().url("Must be a valid URL").nullable().default(null),
  status: recipeStatusSchema.default("to_try"),
  is_public: z.boolean().default(false),
  ai_generated: z.boolean().default(false),
  tags: z.array(z.string().min(1)).default([]),
});

/** Partial shape used when updating a recipe */
export const updateRecipeSchema = createRecipeSchema.partial();

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Share schema
// ---------------------------------------------------------------------------

export const shareRecipeSchema = z.object({
  shared_with: z.string().email("Must be a valid email"),
  permission: z.enum(["view", "edit"]).default("view"),
});

// ---------------------------------------------------------------------------
// AI schemas
// ---------------------------------------------------------------------------

export const aiGenerateSchema = z.object({
  prompt: z.string().min(10, "Please describe the recipe in at least 10 characters").max(1000),
});

export const aiSuggestSchema = createRecipeSchema.partial();

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type CreateRecipeFormValues = z.input<typeof createRecipeSchema>;
export type UpdateRecipeFormValues = z.input<typeof updateRecipeSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ShareRecipeFormValues = z.infer<typeof shareRecipeSchema>;
export type AiGenerateFormValues = z.infer<typeof aiGenerateSchema>;
