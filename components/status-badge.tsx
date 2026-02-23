"use client";

// TODO: Implement StatusBadge component
// Props:
// - status: RecipeStatus
//
// Renders a colored badge reflecting the recipe status:
// - "draft"       → gray
// - "in-progress" → yellow/amber
// - "completed"   → green
// - "archived"    → red/muted
//
// Uses shadcn/ui Badge component

import type { RecipeStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: RecipeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // TODO: implement component
  return null;
}
