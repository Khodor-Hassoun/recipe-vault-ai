"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RecipeCard } from "@/components/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { Pagination } from "@/components/ui/pagination";
import type { Recipe, RecipeStatus, ApiResponse } from "@/lib/types";

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | "all">("all");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 3;

  const fetchRecipes = useCallback(
    async (q = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("is_public", "true");
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (cuisineFilter) params.set("cuisine", cuisineFilter);
        if (tagFilter) params.set("tags", tagFilter);
        if (q) params.set("q", q);
        const res = await fetch(`/api/search?${params.toString()}`);
        const json = (await res.json()) as ApiResponse<Recipe[]>;
        setRecipes(json.data ?? []);
        setPage(1);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, cuisineFilter, tagFilter],
  );

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const pagedRecipes = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discover Recipes</h1>
        <p className="text-sm text-muted-foreground">Browse public recipes shared by the community</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="flex-1 min-w-52">
          <SearchBar onSearch={(q) => void fetchRecipes(q)} placeholder="Search all recipes..." />
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
        <Input
          placeholder="Cuisine..."
          className="w-36"
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
        />
        <Input placeholder="Tag..." className="w-36" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">🥨</div>
          <div>
            <p className="font-semibold">No recipes found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="space-y-1 pt-2">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              <p className="text-center text-xs text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, recipes.length)} of {recipes.length} recipes
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
