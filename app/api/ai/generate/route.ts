import { type NextRequest, NextResponse } from "next/server";
import { gemini } from "@/lib/ai";
import { createRecipeSchema } from "@/lib/validations";
import type { ApiResponse, CreateRecipeInput } from "@/lib/types";

const SYSTEM_PROMPT =
  "You are a professional chef. Generate a recipe as valid JSON matching this schema: { title, description, ingredients: [{name, amount, unit}], instructions: [{step, text}], cuisine_type, prep_time_mins, cook_time_mins, servings, tags: string[] }. Return ONLY valid JSON, no markdown.";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<CreateRecipeInput>>> {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ data: null, error: "Prompt is required" }, { status: 400 });
    }

    const result = await gemini.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Generate a recipe for: ${prompt}` },
    ]);

    const raw = result.response.text().trim();

    // Strip any accidental markdown fences
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

    const validated = createRecipeSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("[POST /api/ai/generate] Zod issues:", JSON.stringify(validated.error.issues, null, 2));
      console.error("[POST /api/ai/generate] Raw AI output:", jsonText);
      return NextResponse.json(
        { data: null, error: "AI response did not match the expected recipe format. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ data: validated.data as unknown as CreateRecipeInput, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/ai/generate]", message);
    if (
      message.includes("429") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("resource_exhausted")
    ) {
      return NextResponse.json({ data: null, error: `Google AI error: ${message}` }, { status: 429 });
    }
    return NextResponse.json({ data: null, error: `AI error: ${message}` }, { status: 500 });
  }
}
