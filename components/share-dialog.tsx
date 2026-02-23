"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ApiResponse, SharedRecipe } from "@/lib/types";

const shareSchema = z.object({
  username: z.string().min(1, "Username is required"),
  permission: z.enum(["view", "edit"]),
});

type ShareFormValues = z.infer<typeof shareSchema>;

interface ShareDialogProps {
  recipeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ recipeId, open, onOpenChange }: ShareDialogProps) {
  const [shares, setShares] = useState<SharedRecipe[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShareFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: { username: "", permission: "view" },
  });

  const permission = watch("permission");

  // Load existing shares when the dialog opens
  useEffect(() => {
    if (!open) return;
    setLoadingShares(true);
    fetch(`/api/recipes/${recipeId}/share`)
      .then((r) => r.json())
      .then((json: ApiResponse<SharedRecipe[]>) => setShares(json.data ?? []))
      .catch(() => setShares([]))
      .finally(() => setLoadingShares(false));
  }, [open, recipeId]);

  const onSubmit = async (data: ShareFormValues) => {
    setServerError(null);
    const res = await fetch(`/api/recipes/${recipeId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as ApiResponse<SharedRecipe>;
    if (!res.ok || json.error) {
      setServerError(json.error ?? "Failed to share recipe");
      return;
    }
    // Refresh list
    setShares((prev) => {
      const without = prev.filter((s) => s.shared_with !== json.data!.shared_with);
      return [...without, json.data!];
    });
    reset();
  };

  const handleRevoke = async (sharedWith: string) => {
    await fetch(`/api/recipes/${recipeId}/share`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared_with: sharedWith }),
    });
    setShares((prev) => prev.filter((s) => s.shared_with !== sharedWith));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Recipe</DialogTitle>
          <DialogDescription>Invite others to view or edit this recipe by username.</DialogDescription>
        </DialogHeader>

        {/* Add new share form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="share-username">Username</Label>
              <Input id="share-username" placeholder="their_username" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="w-28 space-y-1">
              <Label>Permission</Label>
              <Select value={permission} onValueChange={(v) => setValue("permission", v as "view" | "edit")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {serverError && <p className="text-xs text-destructive">{serverError}</p>}

          <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UserPlus className="mr-2 h-3 w-3" />}
            Share
          </Button>
        </form>

        {/* Current shares list */}
        <div className="mt-2">
          <p className="mb-2 text-sm font-medium">Shared with</p>
          {loadingShares ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not shared with anyone yet.</p>
          ) : (
            <ul className="space-y-2">
              {shares.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{s.shared_with}</span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-muted-foreground">{s.permission}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleRevoke(s.shared_with)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
