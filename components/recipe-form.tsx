"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, GripVertical, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createRecipeSchema, type CreateRecipeFormValues } from "@/lib/validations";
import type { Recipe, ApiResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/compress-image";

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
  const [imageUploading, setImageUploading] = useState(false);

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
    mode: "onTouched",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setServerError(null);
    try {
      const compressed = await compressImage(file);
      const ext = compressed.type === "image/jpeg" ? "jpg" : "webp";
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("recipe-images")
        .upload(path, compressed, { contentType: compressed.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
      setValue("image_url", data.publicUrl);
    } catch {
      setServerError("Image upload failed — please try pasting a URL instead.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
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
          {aiLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4 text-violet-500" />
          )}
          Generate with AI
        </Button>
      </div>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Info</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            placeholder="e.g. Spaghetti Carbonara"
            className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            {...register("title")}
          />
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
          <Label>Image</Label>
          <div className="flex flex-col gap-2">
            {/* File upload */}
            <label
              htmlFor="image_file"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {imageUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload image (auto-compressed)
                </>
              )}
              <input
                id="image_file"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={imageUploading}
                onChange={handleImageUpload}
              />
            </label>
            {/* Preview */}
            {watch("image_url") && (
              <div className="relative w-full overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={watch("image_url") ?? ""} alt="Recipe preview" className="max-h-40 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-xs text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => setValue("image_url", null)}
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            )}
            {/* URL fallback */}
            <Input id="image_url" type="url" placeholder="or paste image URL…" {...register("image_url")} />
          </div>
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
          <h2 className="text-lg font-semibold">
            Ingredients <span className="text-destructive">*</span>
          </h2>
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
                <Input
                  placeholder="Ingredient *"
                  className={errors.ingredients?.[index]?.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  {...register(`ingredients.${index}.name`)}
                />
                <Input
                  placeholder="Amount *"
                  className={errors.ingredients?.[index]?.amount ? "border-destructive focus-visible:ring-destructive" : ""}
                  {...register(`ingredients.${index}.amount`)}
                />
                <Input
                  placeholder="Unit *"
                  className={errors.ingredients?.[index]?.unit ? "border-destructive focus-visible:ring-destructive" : ""}
                  {...register(`ingredients.${index}.unit`)}
                />
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
          <h2 className="text-lg font-semibold">
            Instructions <span className="text-destructive">*</span>
          </h2>
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
                className={`flex-1 resize-none${errors.instructions?.[index]?.text ? " border-destructive focus-visible:ring-destructive" : ""}`}
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
