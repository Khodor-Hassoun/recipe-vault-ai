"use client";

// TODO: Implement useAuth hook
// - Provides the current user session and auth helpers
// - Returns: { user, session, isLoading, signIn, signUp, signOut }
// - Uses Supabase browser client from lib/supabase/client.ts
// - Listens to onAuthStateChange for real-time session updates

export function useAuth() {
  // TODO: implement hook
  return {
    user: null,
    session: null,
    isLoading: true,
    signIn: async (_email: string, _password: string) => {},
    signUp: async (_email: string, _password: string) => {},
    signOut: async () => {},
  };
}
