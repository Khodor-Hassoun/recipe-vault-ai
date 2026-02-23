import { type NextRequest, NextResponse } from "next/server";
import { gemini } from "@/lib/ai";
import type { ApiResponse } from "@/lib/types";

type SuggestionItem = { title: string; description: string; cuisine_type: string };

const SYSTEM_PROMPT =
  'You are a professional chef. Given a list of available ingredients, suggest exactly 3 recipe ideas. Return ONLY valid JSON as an array: [{ "title": string, "description": string, "cuisine_type": string }, ...]. Each description should be 1-2 sentences. No markdown, no extra text.';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<SuggestionItem[]>>> {
  try {
    const body = (await request.json()) as { ingredients?: string[] };
    const ingredients = body.ingredients?.filter(Boolean);
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ data: null, error: "At least one ingredient is required" }, { status: 400 });
    }

    const result = await gemini.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Available ingredients: ${ingredients.join(", ")}` },
    ]);

    const raw = result.response.text().trim();
    const jsonText = raw.startsWith("```")
      ? raw
          .replace(/^```[^\n]*\n?/, "")
          .replace(/```$/, "")
          .trim()
      : raw;

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ data: null, error: "AI returned invalid JSON. Please try again." }, { status: 502 });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { data: null, error: "AI response was not the expected format. Please try again." },
        { status: 502 },
      );
    }

    const suggestions = (parsed as SuggestionItem[]).slice(0, 3).map((s) => ({
      title: String(s.title ?? ""),
      description: String(s.description ?? ""),
      cuisine_type: String(s.cuisine_type ?? ""),
    }));

    return NextResponse.json({ data: suggestions, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { data: null, error: "AI rate limit reached. Please wait a moment and try again." },
        { status: 429 },
      );
    }
    console.error("[POST /api/ai/suggest]", err);
    return NextResponse.json({ data: null, error: "Failed to get suggestions. Please try again." }, { status: 500 });
  }
}
