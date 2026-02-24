"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Users, Pencil, Trash2, ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/hooks/use-auth";
import type { Recipe, ApiResponse } from "@/lib/types";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default function RecipePage({ params }: RecipePageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((r) => r.json())
      .then((json: ApiResponse<Recipe>) => setRecipe(json.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete "${recipe?.title}"?`)) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    router.push("/recipes");
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <ChefHat className="h-12 w-12 text-slate-300" />
        <p className="font-semibold">Recipe not found.</p>
        <Button asChild variant="outline">
          <Link href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === recipe.user_id;
  const totalTime = (recipe.prep_time_mins ?? 0) + (recipe.cook_time_mins ?? 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/recipes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recipes/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:border-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Cover image */}
      {recipe.image_url && (
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-muted sm:h-80">
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={recipe.status} />
          {recipe.ai_generated && <Badge variant="secondary">AI Generated</Badge>}
          {recipe.is_public && <Badge variant="outline">Public</Badge>}
        </div>
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}

        {/* Meta row */}
        <div className="flex flex-wrap gap-3">
          {recipe.cuisine_type && (
            <div className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm">
              <ChefHat className="h-4 w-4 text-primary" />
              {recipe.cuisine_type}
            </div>
          )}
          {totalTime > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              {totalTime} min
              {recipe.prep_time_mins && recipe.cook_time_mins && (
                <span className="text-xs text-muted-foreground">
                  ({recipe.prep_time_mins} prep + {recipe.cook_time_mins} cook)
                </span>
              )}
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm">
              <Users className="h-4 w-4 text-primary" />
              {recipe.servings} servings
            </div>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Ingredients */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        {recipe.ingredients.length === 0 ? (
          <p className="text-muted-foreground">No ingredients listed.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="font-medium text-primary">
                  {ing.amount} {ing.unit}
                </span>
                <span className="text-foreground">{ing.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Instructions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Instructions</h2>
        {recipe.instructions.length === 0 ? (
          <p className="text-muted-foreground">No instructions listed.</p>
        ) : (
          <ol className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border bg-card p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/30">
                  {step.step}
                </span>
                <p className="pt-1 text-sm leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
