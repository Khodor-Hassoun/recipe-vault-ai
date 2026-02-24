"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ChefHat, Trash2, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function RecipeCard({ recipe, showActions, onDelete }: RecipeCardProps) {
  const router = useRouter();
  const totalTime = (recipe.prep_time_mins ?? 0) + (recipe.cook_time_mins ?? 0);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    onDelete?.(recipe.id);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Cover image */}
      <Link href={`/recipes/${recipe.id}`} className="relative block h-48 overflow-hidden bg-muted">
        {recipe.image_url ? (
          <>
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-orange-50 to-amber-50">
            <ChefHat className="h-14 w-14 text-orange-200" />
          </div>
        )}
        <div className="absolute left-2.5 top-2.5">
          <StatusBadge status={recipe.status} />
        </div>
        {(recipe.ai_generated || !recipe.is_public) && (
          <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1">
            {recipe.ai_generated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                ✨ AI
              </span>
            )}
            {!recipe.is_public && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                🔒 Private
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/recipes/${recipe.id}`} className="mb-0.5 block">
          <h3 className="line-clamp-2 font-semibold leading-snug transition-colors hover:text-primary">
            {recipe.title}
          </h3>
        </Link>

        {recipe.cuisine_type && (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {recipe.cuisine_type}
          </p>
        )}

        {recipe.description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{recipe.description}</p>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings} servings
            </span>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full px-2 py-0 text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {recipe.profiles?.username && (
          <p className="mb-2 text-xs text-muted-foreground">
            by <span className="font-medium text-foreground">{recipe.profiles.username}</span>
          </p>
        )}

        <div className="flex-1" />

        {showActions && (
          <div className="mt-3 flex gap-2 border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
            >
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
