// TODO: Define shared TypeScript types for the application

// TODO: Recipe status enum
export type RecipeStatus = "draft" | "in-progress" | "completed" | "archived";

// TODO: Recipe model matching the Supabase recipes table
export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  status: RecipeStatus;
  is_public: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// TODO: Ingredient model
export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

// TODO: Step model
export interface Step {
  order: number;
  instruction: string;
  duration_minutes?: number;
}

// TODO: User profile model matching the Supabase profiles table
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

// TODO: AI suggestion response type
export interface AISuggestion {
  suggestions: string[];
}

// TODO: AI generated recipe type
export interface AIGeneratedRecipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
}
