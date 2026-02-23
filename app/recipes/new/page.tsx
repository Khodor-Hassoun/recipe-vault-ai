"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecipeForm } from "@/components/recipe-form";
import type { Recipe, ApiResponse, CreateRecipeInput } from "@/lib/types";
import type { CreateRecipeFormValues } from "@/lib/validations";

export default function NewRecipePage() {
  return (
    <Suspense>
      <NewRecipeContent />
    </Suspense>
  );
}

function NewRecipeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<Partial<CreateRecipeFormValues> | null>(() => {
    const title = searchParams.get("title");
    return title ? { title } : null;
  });

  // Update prefill if query param changes (e.g. navigation)
  useEffect(() => {
    const title = searchParams.get("title");
    if (title && !prefill) setPrefill({ title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuccess = (recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`);
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const json = (await res.json()) as ApiResponse<CreateRecipeInput>;
      if (!res.ok || json.error || !json.data) {
        setAiError(json.error ?? "Failed to generate recipe.");
        return;
      }
      // Map API output → form default values
      const data = json.data;
      setPrefill({
        title: data.title ?? "",
        description: data.description ?? null,
        ingredients:
          Array.isArray(data.ingredients) && data.ingredients.length > 0
            ? data.ingredients
            : [{ name: "", amount: "", unit: "" }],
        instructions:
          Array.isArray(data.instructions) && data.instructions.length > 0
            ? data.instructions
            : [{ step: 1, text: "" }],
        cuisine_type: data.cuisine_type ?? null,
        prep_time_mins: data.prep_time_mins ?? null,
        cook_time_mins: data.cook_time_mins ?? null,
        servings: data.servings ?? null,
        image_url: data.image_url ?? null,
        status: data.status ?? "to_try",
        is_public: data.is_public ?? false,
        ai_generated: true,
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
      setAiOpen(false);
      setAiPrompt("");
    } catch {
      setAiError("An unexpected error occurred. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recipes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">New Recipe</h1>
        </div>
      </div>

      <RecipeForm mode="create" defaultValues={prefill ?? undefined} onSuccess={handleSuccess} />

      {/* AI Generate Modal */}
      <Dialog
        open={aiOpen}
        onOpenChange={(v) => {
          setAiOpen(v);
          if (!v) setAiError(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✨ Generate Recipe with AI</DialogTitle>
            <DialogDescription>Describe the recipe you want and Gemini will generate it for you.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="ai-prompt">What kind of recipe?</Label>
            <Input
              id="ai-prompt"
              placeholder="e.g. a quick vegan pasta under 30 minutes"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !aiLoading) void handleGenerate();
              }}
              disabled={aiLoading}
            />
            {aiError && <p className="text-sm text-destructive">{aiError}</p>}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiOpen(false)} disabled={aiLoading}>
              Cancel
            </Button>
            <Button onClick={() => void handleGenerate()} disabled={aiLoading || !aiPrompt.trim()}>
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
