// TODO: Implement /api/recipes/[id] route handlers
// GET    - Fetch a single recipe by id
// PUT    - Update a recipe (owner only)
// DELETE - Delete a recipe (owner only)

import { type NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  // TODO: implement GET /api/recipes/[id] using id
  void id;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  // TODO: implement PUT /api/recipes/[id]
  // Validate body with zod schema from lib/validations.ts
  void id;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  // TODO: implement DELETE /api/recipes/[id]
  void id;
}
