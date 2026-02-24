import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Recipe } from "@/lib/types";

// ---------------------------------------------------------------------------
// GET /api/search
// Searches recipes the current user can access (own + public).
// Query params:
//   ?q=       Full-text search on title, description, cuisine_type, tags
//   ?status=  Filter by recipe status
//   ?cuisine= Filter by cuisine_type (partial match)
//   ?tags=    Comma-separated tag filter (overlap)
//   ?page=    1-based page number (default: 1)
//   ?limit=   Results per page (default: 20, max: 100)
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
    const q = searchParams.get("q")?.trim() ?? "";
    const isPublicOnly = searchParams.get("is_public") === "true";
    const status = searchParams.get("status") ?? undefined;
    const cuisine = searchParams.get("cuisine") ?? undefined;
    const tagsParam = searchParams.get("tags");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    // Base query: RLS enforces access (own OR public row exists)
    let query = supabase
      .from("recipes")
      .select("*, profiles(id, username, avatar_url, created_at)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // When the discover page requests public-only, enforce it regardless of ownership
    if (isPublicOnly) query = query.eq("is_public", true);

    // Full-text / partial search across multiple fields
    if (q) {
      query = query.or(
        [
          `title.ilike.%${q}%`,
          `description.ilike.%${q}%`,
          `cuisine_type.ilike.%${q}%`,
          // Search inside JSONB ingredients array (cast to text for ilike)
          `ingredients.cs.${JSON.stringify([{ name: q }])}`,
        ].join(","),
      );
    }

    if (status) query = query.eq("status", status);
    if (cuisine) query = query.ilike("cuisine_type", `%${cuisine}%`);
    if (tagsParam) {
      const tags = tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length) query = query.overlaps("tags", tags);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: (data ?? []) as Recipe[], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
