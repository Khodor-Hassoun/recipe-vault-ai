// TODO: Implement Next.js middleware for Supabase auth session refresh
// - Refresh the Supabase session on every request using @supabase/ssr
// - Protect routes under /recipes and /api/* (redirect to /auth/login if unauthenticated)
// - Allow public access to /auth/* and /discover

import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // TODO: create Supabase server client
  // TODO: refresh session (getUser)
  // TODO: redirect unauthenticated users away from protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // TODO: add route patterns to protect
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
