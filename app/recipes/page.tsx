"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Brain, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard } from "@/components/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { Pagination } from "@/components/ui/pagination";
import type { Recipe, RecipeStatus, ApiResponse } from "@/lib/types";

type SuggestionItem = { title: string; description: string; cuisine_type: string };

const PAGE_SIZE = 6;

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | "all">("all");
  const [page, setPage] = useState(1);

  // Suggest modal state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientChips, setIngredientChips] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const fetchRecipes = useCallback(
    async (q = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (q) params.set("q", q);
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const json = (await res.json()) as ApiResponse<Recipe[]>;
        setRecipes(json.data ?? []);
        setPage(1);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  const handleDelete = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
  const pagedRecipes = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Ingredient chips helpers
  const addChip = () => {
    const val = ingredientInput.trim();
    if (!val || ingredientChips.includes(val)) return;
    setIngredientChips((prev) => [...prev, val]);
    setIngredientInput("");
  };
  const removeChip = (chip: string) => setIngredientChips((prev) => prev.filter((c) => c !== chip));

  const handleSuggest = async () => {
    if (ingredientChips.length === 0) return;
    setSuggestLoading(true);
    setSuggestError(null);
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientChips }),
      });
      const json = (await res.json()) as ApiResponse<SuggestionItem[]>;
      if (!res.ok || json.error || !json.data) {
        setSuggestError(json.error ?? "Failed to get suggestions.");
        return;
      }
      setSuggestions(json.data);
    } catch {
      setSuggestError("An unexpected error occurred. Please try again.");
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleUsesuggestion = (title: string) => {
    setSuggestOpen(false);
    router.push(`/recipes/new?title=${encodeURIComponent(title)}`);
  };

  const resetSuggestModal = () => {
    setIngredientInput("");
    setIngredientChips([]);
    setSuggestError(null);
    setSuggestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Recipes</h1>
          <p className="text-sm text-muted-foreground">Your personal cookbook</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full sm:flex-none"
            onClick={() => {
              resetSuggestModal();
              setSuggestOpen(true);
            }}
          >
            <Brain className="mr-2 h-4 w-4 text-violet-500" />
            What can I make?
          </Button>
          <Button className="flex-1 rounded-full sm:flex-none" asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" /> Add Recipe
            </Link>
          </Button>
        </div>
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
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">🍳</div>
          <div>
            <p className="font-semibold">No recipes yet</p>
            <p className="text-sm text-muted-foreground">Start building your personal cookbook!</p>
          </div>
          <Button className="rounded-full" asChild>
            <Link href="/recipes/new">
              <Plus className="mr-2 h-4 w-4" /> Create your first recipe
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showActions onDelete={handleDelete} />
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

      {/* "What can I make?" Modal */}
      <Dialog
        open={suggestOpen}
        onOpenChange={(v) => {
          setSuggestOpen(v);
          if (!v) resetSuggestModal();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>🧠 What can I make?</DialogTitle>
            <DialogDescription>Add the ingredients you have and Gemini will suggest 3 recipe ideas.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Ingredient input */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g. chicken, garlic, lemon…"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addChip();
                  }
                }}
                disabled={suggestLoading}
              />
              <Button type="button" variant="outline" onClick={addChip} disabled={suggestLoading}>
                Add
              </Button>
            </div>

            {/* Chips */}
            {ingredientChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredientChips.map((chip) => (
                  <Badge key={chip} variant="secondary" className="gap-1 pr-1">
                    {chip}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:text-destructive"
                      onClick={() => removeChip(chip)}
                      aria-label={`Remove ${chip}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {suggestError && <p className="text-sm text-destructive">{suggestError}</p>}

            {/* Suggestion cards */}
            {suggestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Here are some ideas:</p>
                {suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg border bg-muted/40 p-4 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s.title}</p>
                        {s.cuisine_type && <p className="text-xs text-muted-foreground">{s.cuisine_type}</p>}
                        <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => handleUsesuggestion(s.title)}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuggestOpen(false)} disabled={suggestLoading}>
              Close
            </Button>
            <Button onClick={() => void handleSuggest()} disabled={suggestLoading || ingredientChips.length === 0}>
              {suggestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking…
                </>
              ) : (
                "Get Suggestions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
