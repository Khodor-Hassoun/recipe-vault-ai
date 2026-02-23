import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, SharedRecipe } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const shareBodySchema = z.object({
  username: z.string().min(1, "username is required"),
  permission: z.enum(["view", "edit"]).default("view"),
});

const revokeBodySchema = z.object({
  shared_with: z.string().min(1, "shared_with is required"),
});

// ---------------------------------------------------------------------------
// POST /api/recipes/[id]/share
// Share recipe with another user. Body: { username, permission }
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<SharedRecipe>>> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify caller owns the recipe
    const { data: recipe } = await supabase.from("recipes").select("id, user_id").eq("id", id).single();

    if (!recipe) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }
    if (recipe.user_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    // Validate body
    const body: unknown = await request.json();
    const parsed = shareBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }
    const { username, permission } = parsed.data;

    // Look up recipient by username in profiles
    const { data: profile } = await supabase.from("profiles").select("id").eq("username", username).single();

    if (!profile) {
      return NextResponse.json({ data: null, error: `No user found with username "${username}"` }, { status: 404 });
    }
    if (profile.id === user.id) {
      return NextResponse.json({ data: null, error: "You cannot share a recipe with yourself" }, { status: 400 });
    }

    // Upsert – if already shared, update permission
    const { data: share, error: shareError } = await supabase
      .from("shared_recipes")
      .upsert({ recipe_id: id, shared_with: profile.id, permission }, { onConflict: "recipe_id,shared_with" })
      .select()
      .single();

    if (shareError) throw shareError;

    return NextResponse.json({ data: share as SharedRecipe, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/recipes/[id]/share
// Revoke sharing for a specific user. Body: { shared_with: string }
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<null>>> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify caller owns the recipe
    const { data: recipe } = await supabase.from("recipes").select("id, user_id").eq("id", id).single();

    if (!recipe) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }
    if (recipe.user_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    // Validate body
    const body: unknown = await request.json();
    const parsed = revokeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("shared_recipes")
      .delete()
      .eq("recipe_id", id)
      .eq("shared_with", parsed.data.shared_with);

    if (error) throw error;

    return NextResponse.json({ data: null, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
