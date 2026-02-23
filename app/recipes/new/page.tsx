"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeForm } from "@/components/recipe-form";
import type { Recipe } from "@/lib/types";

export default function NewRecipePage() {
  const router = useRouter();

  const handleSuccess = (recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/recipes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Recipe</h1>
      </div>

      <RecipeForm mode="create" onSuccess={handleSuccess} />
    </div>
  );
}
