# RecipeVault

## Overview

RecipeVault is a personal recipe management app where you can save, organise, and share your favourite recipes. It features AI-powered recipe generation and ingredient-based suggestions powered by Google Gemini 1.5 Flash — describe a dish in plain English and get a fully structured recipe in seconds, or tell it what's in your fridge and get three dinner ideas.

Key features:

- **Recipe library** — create, edit, delete, and filter your recipes by status (Favorite / To Try / Made Before), cuisine, or free-text search
- **Sharing** — share individual recipes with other users at view or edit permission level
- **Discover** — browse public recipes from the community
- **✨ Generate with AI** — describe a recipe in natural language and have Gemini produce a complete, form-ready recipe
- **🧠 What can I make?** — enter the ingredients you have on hand and receive three tailored recipe suggestions

## Tech Stack

| Layer           | Technology                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| Framework       | [Next.js 15](https://nextjs.org) (App Router)                                      |
| Language        | TypeScript (strict mode)                                                           |
| Styling         | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (New York / Slate)               |
| Database & Auth | [Supabase](https://supabase.com) (Postgres + Row-Level Security + OAuth)           |
| AI              | [Google Gemini 1.5 Flash](https://aistudio.google.com) via `@google/generative-ai` |
| Forms           | react-hook-form + Zod                                                              |
| Deployment      | [Vercel](https://vercel.com)                                                       |

## Local Development

### Prerequisites

- **Node.js** 18+
- A **Supabase** project — free tier at [supabase.com](https://supabase.com)
- A **Google AI API key** — free at [aistudio.google.com](https://aistudio.google.com)

### Setup

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd recipe-app
   ```

2. **Create your environment file**

   ```bash
   cp .env.local.example .env.local
   ```

3. **Fill in `.env.local`**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-api-key>
   ```

4. **Run the database migration**

   Open the [Supabase SQL Editor](https://app.supabase.com) for your project and run the contents of:

   ```
   supabase/migrations/001_initial_schema.sql
   ```

   This creates the `profiles`, `recipes`, and `shared_recipes` tables along with RLS policies and triggers.

5. **Install dependencies**

   ```bash
   npm install
   ```

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the project.
3. Add the following **Environment Variables** in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
4. Click **Deploy**.

> **Supabase Auth redirect URI** — add `https://<your-vercel-url>/auth/callback` to the allowed redirect URLs in your Supabase project under _Authentication → URL Configuration_.

## AI Features

### ✨ Generate Recipe from Prompt

Located on the **New Recipe** page. Click "✨ Generate with AI", describe any recipe in plain English (e.g. _"a quick vegan pasta under 30 minutes"_), and Gemini will return a fully structured recipe that pre-fills the creation form. The recipe is automatically marked as `ai_generated`.

**Route:** `POST /api/ai/generate` — body `{ prompt: string }`

### 🧠 Ingredient-Based Suggestions

Located on the **My Recipes** page. Click "🧠 What can I make?", add the ingredients you have as chips, and Gemini suggests three recipe ideas with titles, descriptions, and cuisine types. Each suggestion has a **Create** button that navigates to the New Recipe form with the title pre-filled.

**Route:** `POST /api/ai/suggest` — body `{ ingredients: string[] }`

### Error Handling

Both AI endpoints gracefully handle:

- Empty / invalid input → `400`
- Gemini rate limits or quota errors → `429` with a friendly message
- Malformed AI responses → `502` with a retry prompt
- Unexpected errors → `500`

## Project Structure

```
app/
  api/
    ai/generate/      # POST – AI recipe generation
    ai/suggest/       # POST – ingredient-based suggestions
    recipes/          # GET + POST – recipe list
    recipes/[id]/     # GET + PATCH + DELETE – single recipe
    recipes/[id]/share/ # POST + DELETE – sharing
    search/           # GET – cross-recipe search
  auth/
    callback/         # OAuth code exchange
    login/
    signup/
  discover/           # Public recipe feed
  recipes/            # My recipes list + AI suggest modal
  recipes/new/        # Create form + AI generate modal
  recipes/[id]/       # Recipe detail view
  recipes/[id]/edit/  # Edit form
components/
  navbar.tsx
  recipe-card.tsx
  recipe-form.tsx
  search-bar.tsx
  share-dialog.tsx
  status-badge.tsx
hooks/
  use-auth.ts
lib/
  ai.ts              # Gemini client (server-only)
  supabase/
    client.ts        # Browser client
    server.ts        # Server / RSC client
  types.ts
  validations.ts     # Zod schemas
middleware.ts        # Session refresh + route protection
supabase/migrations/
  001_initial_schema.sql
```

## Live URL

[Add after deployment]
