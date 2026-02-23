"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Users, Pencil, Trash2, Share2, ChefHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { ShareDialog } from "@/components/share-dialog";
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
  const [shareOpen, setShareOpen] = useState(false);

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
            <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
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
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
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
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {recipe.cuisine_type && (
            <span className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              {recipe.cuisine_type}
            </span>
          )}
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalTime} min
              {recipe.prep_time_mins && recipe.cook_time_mins && (
                <span className="text-xs">
                  ({recipe.prep_time_mins} prep + {recipe.cook_time_mins} cook)
                </span>
              )}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} servings
            </span>
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
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="font-medium">
                  {ing.amount} {ing.unit}
                </span>
                <span>{ing.name}</span>
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
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
                <p className="pt-0.5 text-sm leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <ShareDialog recipeId={id} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
