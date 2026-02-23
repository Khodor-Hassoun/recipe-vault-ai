"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ChefHat, Trash2, Pencil, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onShare?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, showActions, onDelete, onShare }: RecipeCardProps) {
  const router = useRouter();
  const totalTime = (recipe.prep_time_mins ?? 0) + (recipe.cook_time_mins ?? 0);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    onDelete?.(recipe.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    onShare?.(recipe);
  };

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Cover image */}
      <Link href={`/recipes/${recipe.id}`} className="relative block h-44 bg-slate-100">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-300">
            <ChefHat className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={recipe.status} />
        </div>
        {recipe.ai_generated && (
          <div className="absolute right-2 top-2">
            <Badge variant="secondary" className="text-xs">
              AI
            </Badge>
          </div>
        )}
      </Link>

      {/* Body */}
      <CardHeader className="pb-2 pt-3">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="line-clamp-2 font-semibold leading-snug hover:underline">{recipe.title}</h3>
        </Link>
        {recipe.cuisine_type && <p className="text-xs text-muted-foreground">{recipe.cuisine_type}</p>}
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {recipe.description && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>}

        {/* Time */}
        {totalTime > 0 && (
          <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{totalTime} min</span>
            {recipe.prep_time_mins && recipe.cook_time_mins && (
              <span className="text-slate-400">
                ({recipe.prep_time_mins} prep + {recipe.cook_time_mins} cook)
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 4 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                +{recipe.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Author (shown on discover page) */}
        {recipe.profiles?.username && (
          <p className="mt-2 text-xs text-muted-foreground">
            by <span className="font-medium">{recipe.profiles.username}</span>
          </p>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
          >
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
            <Share2 className="mr-1 h-3 w-3" /> Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:border-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
