// TODO: Implement /api/recipes/[id] route handlers
// GET    - Fetch a single recipe by id
// PUT    - Update a recipe (owner only)
// DELETE - Delete a recipe (owner only)

import { type NextRequest } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  // TODO: implement GET /api/recipes/[id]
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  // TODO: implement PUT /api/recipes/[id]
  // Validate body with zod schema from lib/validations.ts
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  // TODO: implement DELETE /api/recipes/[id]
}
