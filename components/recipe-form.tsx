"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, GripVertical, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createRecipeSchema, type CreateRecipeFormValues } from "@/lib/validations";
import type { Recipe, ApiResponse } from "@/lib/types";

interface RecipeFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateRecipeFormValues>;
  recipeId?: string;
  onSuccess?: (recipe: Recipe) => void;
}

export function RecipeForm({ mode, defaultValues, recipeId, onSuccess }: RecipeFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateRecipeFormValues>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      title: "",
      description: null,
      ingredients: [{ name: "", amount: "", unit: "" }],
      instructions: [{ step: 1, text: "" }],
      cuisine_type: null,
      prep_time_mins: null,
      cook_time_mins: null,
      servings: null,
      image_url: null,
      status: "to_try",
      is_public: false,
      ai_generated: false,
      tags: [],
      ...defaultValues,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: "instructions" });

  const tags = watch("tags") ?? [];
  const isPublic = watch("is_public");
  const status = watch("status");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const current = getValues("tags") ?? [];
    if (!current.includes(t)) setValue("tags", [...current, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      (getValues("tags") ?? []).filter((t) => t !== tag),
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleGenerateWithAI = async () => {
    const title = getValues("title");
    const description = getValues("description");
    const prompt = [title, description].filter(Boolean).join(" — ");
    if (!prompt.trim()) {
      setServerError("Please enter a title or description before generating with AI.");
      return;
    }
    setAiLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = (await res.json()) as ApiResponse<Partial<CreateRecipeFormValues>>;
      if (!res.ok || json.error) {
        setServerError(json.error ?? "AI generation failed");
        return;
      }
      if (json.data) {
        const d = json.data;
        if (d.ingredients?.length) setValue("ingredients", d.ingredients);
        if (d.instructions?.length) setValue("instructions", d.instructions);
        if (d.tags?.length) setValue("tags", d.tags);
        if (d.cuisine_type) setValue("cuisine_type", d.cuisine_type);
        if (d.prep_time_mins) setValue("prep_time_mins", d.prep_time_mins);
        if (d.cook_time_mins) setValue("cook_time_mins", d.cook_time_mins);
        if (d.servings) setValue("servings", d.servings);
        if (d.description) setValue("description", d.description);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data: CreateRecipeFormValues) => {
    setServerError(null);
    try {
      const url = mode === "create" ? "/api/recipes" : `/api/recipes/${recipeId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as ApiResponse<Recipe>;
      if (!res.ok || json.error) {
        setServerError(json.error ?? "Failed to save recipe");
        return;
      }
      onSuccess?.(json.data!);
    } catch {
      setServerError("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* AI Generate */}
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleGenerateWithAI} disabled={aiLoading}>
          {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate with AI
        </Button>
      </div>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Info</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="e.g. Spaghetti Carbonara" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="A brief description of the recipe..."
            rows={3}
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="cuisine_type">Cuisine</Label>
            <Input id="cuisine_type" placeholder="Italian" {...register("cuisine_type")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prep_time_mins">Prep (min)</Label>
            <Input
              id="prep_time_mins"
              type="number"
              min={0}
              placeholder="15"
              {...register("prep_time_mins", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cook_time_mins">Cook (min)</Label>
            <Input
              id="cook_time_mins"
              type="number"
              min={0}
              placeholder="30"
              {...register("cook_time_mins", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min={1}
              placeholder="4"
              {...register("servings", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" type="url" placeholder="https://..." {...register("image_url")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v as CreateRecipeFormValues["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to_try">To Try</SelectItem>
                <SelectItem value="made_before">Made Before</SelectItem>
                <SelectItem value="favorite">Favorite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <Label htmlFor="is_public">Public recipe</Label>
            <div className="flex items-center gap-2">
              <Switch id="is_public" checked={isPublic} onCheckedChange={(v) => setValue("is_public", v)} />
              <span className="text-sm text-muted-foreground">{isPublic ? "Visible to everyone" : "Private"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendIngredient({ name: "", amount: "", unit: "" })}
          >
            <Plus className="mr-1 h-3 w-3" /> Add
          </Button>
        </div>

        {errors.ingredients?.root && <p className="text-xs text-destructive">{errors.ingredients.root.message}</p>}

        <div className="space-y-2">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <Input placeholder="Ingredient" {...register(`ingredients.${index}.name`)} />
                <Input placeholder="Amount" {...register(`ingredients.${index}.amount`)} />
                <Input placeholder="Unit" {...register(`ingredients.${index}.unit`)} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 h-9 w-9 text-destructive"
                onClick={() => removeIngredient(index)}
                disabled={ingredientFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Instructions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => appendInstruction({ step: instructionFields.length + 1, text: "" })}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Step
          </Button>
        </div>

        {errors.instructions?.root && <p className="text-xs text-destructive">{errors.instructions.root.message}</p>}

        <div className="space-y-3">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="mt-2 w-6 shrink-0 text-sm font-medium text-muted-foreground">{index + 1}.</span>
              <Textarea
                placeholder={`Step ${index + 1} instructions...`}
                rows={2}
                className="flex-1 resize-none"
                {...register(`instructions.${index}.text`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 h-9 w-9 text-destructive"
                onClick={() => removeInstruction(index)}
                disabled={instructionFields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tags</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:text-destructive"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      {serverError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : mode === "create" ? (
          "Create Recipe"
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
