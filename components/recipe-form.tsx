"use client";

// TODO: Implement RecipeForm component
// Props:
// - mode: "create" | "edit"
// - defaultValues?: Partial<RecipeFormValues>
// - onSubmit: (data: RecipeFormValues) => Promise<void>
// - isLoading?: boolean
//
// Fields: title, description, ingredients (dynamic list), steps (dynamic list),
//         tags, status (select), is_public (toggle), cover_image_url
// Uses react-hook-form + zod (recipeSchema from lib/validations.ts)
// Includes AI suggestion/generation button (calls /api/ai/suggest or /api/ai/generate)

import type { RecipeFormValues } from "@/lib/validations";

interface RecipeFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<RecipeFormValues>;
  onSubmit: (data: RecipeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ mode, defaultValues, onSubmit, isLoading }: RecipeFormProps) {
  // TODO: implement component
  return null;
}
