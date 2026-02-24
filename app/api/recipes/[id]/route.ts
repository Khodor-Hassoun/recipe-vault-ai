import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateRecipeSchema } from "@/lib/validations";
import type { ApiResponse, Recipe } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/recipes/[id]
// Accessible if: owner or public recipe.
// ---------------------------------------------------------------------------
export async function GET(_request: NextRequest, { params }: RouteContext): Promise<NextResponse<ApiResponse<Recipe>>> {
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
    const { data, error } = await supabase
      .from("recipes")
      .select("*, profiles(id, username, avatar_url, created_at)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ data: data as Recipe, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/recipes/[id]
// Owner only.
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<Recipe>>> {
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
    // Resolve permission: owner?
    const { data: existing } = await supabase.from("recipes").select("id, user_id").eq("id", id).single();

    if (!existing) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }

    const isOwner = existing.user_id === user.id;
    if (!isOwner) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const body: unknown = await request.json();
    const parsed = updateRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("recipes")
      .update(parsed.data)
      .eq("id", id)
      .select("*, profiles(id, username, avatar_url, created_at)")
      .single();

    if (error) throw error;

    return NextResponse.json({ data: data as Recipe, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/recipes/[id]
// Owner only.
// ---------------------------------------------------------------------------
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<null>>> {
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
    const { data: existing } = await supabase.from("recipes").select("id, user_id").eq("id", id).single();

    if (!existing) {
      return NextResponse.json({ data: null, error: "Recipe not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ data: null, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
