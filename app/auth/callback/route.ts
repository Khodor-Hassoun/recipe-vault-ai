import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Handles the Supabase OAuth / magic-link callback.
 * Exchanges the one-time `code` for a session, then redirects the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Optional: send users back to where they came from.
  const next = searchParams.get("next") ?? "/recipes";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Allow only relative redirects to prevent open-redirect attacks.
      const redirectTo = next.startsWith("/") ? `${origin}${next}` : `${origin}/recipes`;
      return NextResponse.redirect(redirectTo);
    }
  }

  // Something went wrong — send the user back to login with an error hint.
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
