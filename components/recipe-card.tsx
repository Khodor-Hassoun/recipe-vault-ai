"use client";

// TODO: Implement RecipeCard component
// Props:
// - recipe: Recipe
// - showActions?: boolean (show edit/delete buttons for owner)
// - onClick?: () => void
//
// Displays: cover image, title, description snippet, tags, status badge, created date
// Uses <StatusBadge> component
// Links to /recipes/[id]

import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onClick?: () => void;
}

export function RecipeCard({ recipe, showActions, onClick }: RecipeCardProps) {
  // TODO: implement component
  return null;
}
