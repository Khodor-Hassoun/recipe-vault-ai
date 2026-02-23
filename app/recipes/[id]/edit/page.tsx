// TODO: Implement recipe edit page
// - Fetch existing recipe by id from Supabase
// - Render <RecipeForm> pre-populated with existing data in "edit" mode
// - On submit, PUT to /api/recipes/[id]
// - Redirect to /recipes/[id] on success
// - Protected route: only the recipe owner can access

interface EditRecipePageProps {
  params: { id: string };
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  return null;
}
