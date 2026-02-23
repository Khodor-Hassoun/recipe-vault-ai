"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeForm } from "@/components/recipe-form";
import type { Recipe, ApiResponse } from "@/lib/types";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((r) => r.json())
      .then((json: ApiResponse<Recipe>) => setRecipe(json.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSuccess = (updated: Recipe) => {
    router.push(`/recipes/${updated.id}`);
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/recipes/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
      </div>

      <RecipeForm
        mode="edit"
        recipeId={id}
        defaultValues={{
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          cuisine_type: recipe.cuisine_type,
          prep_time_mins: recipe.prep_time_mins,
          cook_time_mins: recipe.cook_time_mins,
          servings: recipe.servings,
          image_url: recipe.image_url,
          status: recipe.status,
          is_public: recipe.is_public,
          ai_generated: recipe.ai_generated,
          tags: recipe.tags,
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
