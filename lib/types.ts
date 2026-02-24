// ---------------------------------------------------------------------------
// Primitive / enum types
// ---------------------------------------------------------------------------

export type RecipeStatus = "favorite" | "to_try" | "made_before";

// ---------------------------------------------------------------------------
// Building-block types
// ---------------------------------------------------------------------------

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface InstructionStep {
  step: number;
  text: string;
}

// ---------------------------------------------------------------------------
// Database row types
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  cuisine_type: string | null;
  prep_time_mins: number | null;
  cook_time_mins: number | null;
  servings: number | null;
  image_url: string | null;
  status: RecipeStatus;
  is_public: boolean;
  ai_generated: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  /** Joined relation – present when queried with profiles table */
  profiles?: Profile;
}

// ---------------------------------------------------------------------------
// Input types (for create / update operations)
// ---------------------------------------------------------------------------

export type CreateRecipeInput = Omit<Recipe, "id" | "user_id" | "created_at" | "updated_at">;

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

// ---------------------------------------------------------------------------
// Generic API response wrapper
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
