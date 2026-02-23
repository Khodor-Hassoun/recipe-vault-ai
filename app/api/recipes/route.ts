import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRecipeSchema } from "@/lib/validations";
import type { ApiResponse, Recipe } from "@/lib/types";

// ---------------------------------------------------------------------------
// GET /api/recipes
// Returns the authenticated user's recipes.
// Query params: ?status=, ?cuisine=, ?tags= (comma-separated), ?q= (title/desc search)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Recipe[]>>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") ?? undefined;
    const cuisine = searchParams.get("cuisine") ?? undefined;
    const tagsParam = searchParams.get("tags");
    const q = searchParams.get("q") ?? undefined;

    let query = supabase
      .from("recipes")
      .select("*, profiles(id, username, avatar_url, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (cuisine) query = query.ilike("cuisine_type", `%${cuisine}%`);
    if (tagsParam) {
      const tags = tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length) query = query.overlaps("tags", tags);
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data as Recipe[], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/recipes
// Creates a new recipe owned by the authenticated user.
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Recipe>>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = createRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("recipes")
      .insert({ ...parsed.data, user_id: user.id })
      .select("*, profiles(id, username, avatar_url, created_at)")
      .single();

    if (error) throw error;

    return NextResponse.json({ data: data as Recipe, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
