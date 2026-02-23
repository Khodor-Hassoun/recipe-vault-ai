"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard } from "@/components/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { ShareDialog } from "@/components/share-dialog";
import type { Recipe, RecipeStatus, ApiResponse } from "@/lib/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | "all">("all");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [shareTarget, setShareTarget] = useState<Recipe | null>(null);

  const fetchRecipes = useCallback(
    async (q = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (cuisineFilter) params.set("cuisine", cuisineFilter);
        if (q) params.set("q", q);
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const json = (await res.json()) as ApiResponse<Recipe[]>;
        setRecipes(json.data ?? []);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, cuisineFilter],
  );

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  const handleDelete = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Button asChild>
          <Link href="/recipes/new">
            <Plus className="mr-2 h-4 w-4" /> Add Recipe
          </Link>
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar onSearch={(q) => void fetchRecipes(q)} placeholder="Search your recipes..." />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RecipeStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="favorite">Favorite</SelectItem>
            <SelectItem value="to_try">To Try</SelectItem>
            <SelectItem value="made_before">Made Before</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-20 text-center">
          <ChefHat className="h-12 w-12 text-slate-300" />
          <div>
            <p className="font-semibold text-slate-600">No recipes yet</p>
            <p className="text-sm text-muted-foreground">Start building your personal cookbook!</p>
          </div>
          <Button asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" /> Create your first recipe
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} showActions onDelete={handleDelete} onShare={setShareTarget} />
          ))}
        </div>
      )}

      {shareTarget && (
        <ShareDialog
          recipeId={shareTarget.id}
          open={!!shareTarget}
          onOpenChange={(open) => {
            if (!open) setShareTarget(null);
          }}
        />
      )}
    </div>
  );
}
