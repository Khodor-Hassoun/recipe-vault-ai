# RecipeVault

> A full-stack personal recipe manager with AI-powered generation and ingredient-based suggestions.

**Live demo → [recipe-vault-ai-001.vercel.app](https://recipe-vault-ai-001.vercel.app)**

---


## Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <b>Landing Page</b><br/>
      <img src="https://github.com/user-attachments/assets/85f7a01b-c803-4bf8-bd47-25bc313c9495" alt="Landing page" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Sign In</b><br/>
      <img src="https://github.com/user-attachments/assets/f998364c-6dce-4fdd-8444-701292d5150e" alt="Sign in page" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>My Recipes</b><br/>
      <img src="https://github.com/user-attachments/assets/ad59217e-e8cf-4a8e-be1a-2dcf044fb5fa" alt="My recipes page" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>Discover</b><br/>
      <img src="https://github.com/user-attachments/assets/ed2354cb-0a63-42ee-a8f5-4dcc15acdf95" alt="Discover page" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>✨ Generate Recipe with AI</b><br/>
      <img src="https://github.com/user-attachments/assets/03ec9ba4-2c2e-4e23-b4be-751f6bc86cee" alt="Generate recipe with AI" width="100%"/>
    </td>
    <td align="center" width="50%">
      <b>New Recipe Form</b><br/>
      <img src="https://github.com/user-attachments/assets/51fbf347-b8a1-4545-bba7-16e01a6d7fc8" alt="New recipe form" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <b>Recipe Details</b><br/>
      <img src="https://github.com/user-attachments/assets/730c9117-42d0-43df-9673-69bdce03fc12" alt="Recipe details" width="50%"/>
    </td>
  </tr>
</table>

---

## Overview

RecipeVault is a personal recipe management app where you can save, organise, and discover recipes. It features AI-powered recipe generation and ingredient-based suggestions powered by Google Gemini 2.5 Flash — describe a dish in plain English and get a fully structured recipe in seconds, or tell it what's in your fridge and get three dinner ideas.

**Key features:**

- **Recipe library** — create, edit, delete, and filter your recipes by status (Favorite / To Try / Made Before), cuisine, or free-text search
- **Discover** — browse public recipes shared by the community
- **✨ Generate with AI** — describe a recipe in natural language and have Gemini produce a complete, form-ready recipe
- **🧠 What can I make?** — enter the ingredients you have on hand and receive three tailored recipe suggestions, then jump straight into the form with title and description pre-filled
- **Image upload** — attach a photo to any recipe with automatic client-side compression

---

## Tech Stack

| Layer           | Technology                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router)                                      |
| Language        | TypeScript (strict mode)                                                           |
| Styling         | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (New York)                    |
| Database & Auth | [Supabase](https://supabase.com) (Postgres + Row-Level Security + Google OAuth)    |
| AI              | [Google Gemini 1.5 Flash](https://aistudio.google.com) via `@google/generative-ai` |
| Forms           | react-hook-form + Zod                                                              |
| Deployment      | [Vercel](https://vercel.com)                                                       |

## Local Development

### Prerequisites

- **Node.js** 22+
- A **Supabase** project — free tier at [supabase.com](https://supabase.com)
- A **Google AI API key** — free at [aistudio.google.com](https://aistudio.google.com)

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Khodor-Hassoun/recipe-vault-ai.git
   cd recipe-vault-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create your environment file**

   ```bash
   cp .env.local.example .env.local
   ```

4. **Fill in `.env.local`**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   GOOGLE_GENERATIVE_AI_API_KEY=<your-gemini-api-key>
   ```

5. **Run the database migrations**

   Open the [Supabase SQL Editor](https://app.supabase.com) for your project and run each file **in order**:

   | File                          | Description                                                                                                              |
   | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
   | `001_initial_schema.sql`      | Creates `profiles`, `recipes`, and `shared_recipes` tables with RLS policies, indexes, and the `handle_new_user` trigger |
   | `002_recipes_profiles_fk.sql` | Re-points the `recipes.user_id` FK to `profiles` so PostgREST can resolve the embedded `profiles` relationship           |
   | `003_fix_rls_recursion.sql`   | Rewrites RLS policies to eliminate infinite recursion between `recipes` and `shared_recipes`                             |
   | `004_backfill_profiles.sql`   | Backfills a `profiles` row for any `auth.users` account created before the trigger existed                               |
   | `005_storage_bucket.sql`      | Creates the `recipe-images` public Storage bucket (512 KB limit, JPEG/PNG/WebP) with per-user folder RLS                 |

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the project.
3. Add the following **Environment Variables** in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
4. Click **Deploy**.

> **Supabase Auth redirect URI** — in your Supabase project under _Authentication → URL Configuration_, set the **Site URL** to your Vercel domain and add `https://<your-vercel-url>/auth/callback` to the allowed redirect URLs.

---

## AI Features

### ✨ Generate Recipe from Prompt

Located on the **New Recipe** page. Click **Generate with AI**, describe any recipe in plain English (e.g. _"a quick vegan pasta under 30 minutes"_), and Gemini returns a fully structured recipe that auto-fills the entire form — ingredients, instructions, cook times, tags, and more. The recipe is automatically marked as `ai_generated`.

**Route:** `POST /api/ai/generate` — body `{ prompt: string }`

### 🧠 What Can I Make?

Located on the **My Recipes** page. Add the ingredients you have on hand as chips, and Gemini suggests three recipe ideas with titles, descriptions, and cuisine types. Clicking **Create** on a suggestion navigates to the New Recipe form with the title and description pre-filled, and a tip banner prompts you to hit **Generate with AI** to fill in the rest automatically.

**Route:** `POST /api/ai/suggest` — body `{ ingredients: string[] }`

### Error Handling

Both AI endpoints gracefully handle:

- Empty / invalid input → `400`
- Gemini rate limits or quota errors → `429` with a friendly message
- Malformed AI responses → `502` with a retry prompt
- Unexpected errors → `500`

---

## Project Structure

```
app/
  api/
    ai/generate/        # POST – AI recipe generation
    ai/suggest/         # POST – ingredient-based suggestions
    recipes/            # GET + POST – recipe list
    recipes/[id]/       # GET + PATCH + DELETE – single recipe
    search/             # GET – cross-recipe search
  auth/
    callback/           # OAuth code exchange
    login/
    signup/
  discover/             # Public recipe feed
  recipes/              # My recipes list + AI suggest modal
  recipes/new/          # Create form + AI generate modal
  recipes/[id]/         # Recipe detail view
  recipes/[id]/edit/    # Edit form
components/
  navbar.tsx
  recipe-card.tsx
  recipe-form.tsx
  search-bar.tsx
  status-badge.tsx
  ui/pagination.tsx
hooks/
  use-auth.ts
lib/
  ai.ts                 # Gemini client (server-only)
  supabase/
    client.ts           # Browser Supabase client
    server.ts           # Server / RSC Supabase client
  types.ts
  utils/
    compress-image.ts   # Client-side Canvas image compression
  validations.ts        # Zod schemas
middleware.ts           # Session refresh + route protection
public/
  screenshots/          # README screenshots
supabase/migrations/
  001_initial_schema.sql        # Core tables, RLS, triggers
  002_recipes_profiles_fk.sql   # FK fix for PostgREST joins
  003_fix_rls_recursion.sql     # RLS infinite recursion fix
  004_backfill_profiles.sql     # Backfill missing profile rows
  005_storage_bucket.sql        # recipe-images storage bucket
```
