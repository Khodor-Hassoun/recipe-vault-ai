// TODO: Implement Supabase server client
// - Create and export a Supabase client for use in Server Components, Route Handlers, and Middleware
// - Uses @supabase/ssr createServerClient with cookies() from next/headers
// - Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env

import { createServerClient } from "@supabase/ssr";

// TODO: export createClient function that reads/writes cookies
export async function createClient() {
  // TODO: return createServerClient(url, anonKey, { cookies: { ... } })
}
