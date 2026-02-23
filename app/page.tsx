"use client";

import Link from "next/link";
import { ChefHat, Sparkles, Globe, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const FEATURES = [
  {
    icon: ChefHat,
    emoji: "📖",
    title: "Your Personal Cookbook",
    description: "Save and organise all your favourite recipes in one place, always accessible.",
    color: "bg-orange-50 text-orange-500",
  },
  {
    icon: Sparkles,
    emoji: "✨",
    title: "AI-Powered Generation",
    description: "Describe a dish and let AI write the full recipe — ingredients, steps, and more.",
    color: "bg-violet-50 text-violet-500",
  },
  {
    icon: Globe,
    emoji: "🌍",
    title: "Discover & Share",
    description: "Browse recipes from the community or share your own with the world.",
    color: "bg-sky-50 text-sky-500",
  },
  {
    icon: Lock,
    emoji: "🔒",
    title: "Private by Default",
    description: "Your recipes are private until you choose to share them publicly or with friends.",
    color: "bg-green-50 text-green-500",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="relative flex w-full flex-col items-center gap-7 overflow-hidden py-24 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-125 w-175 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered recipe management
        </div>

        <h1 className="relative max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Your recipes,{" "}
          <span className="bg-linear-to-r from-primary via-orange-400 to-amber-400 bg-clip-text text-transparent">
            organised beautifully
          </span>
        </h1>

        <p className="relative max-w-xl text-lg text-muted-foreground">
          RecipeVault helps you save, organise, and discover recipes. Generate full recipes with AI, track your cooking
          status, and share your favourites with friends.
        </p>

        <div className="relative flex flex-wrap justify-center gap-3">
          {loading ? null : user ? (
            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25" asChild>
              <Link href="/recipes">
                Go to My Recipes <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25" asChild>
                <Link href="/auth/signup">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </>
          )}
          <Button size="lg" variant="ghost" className="rounded-full px-8" asChild>
            <Link href="/discover">Browse Recipes</Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="relative flex flex-wrap justify-center gap-8 pt-4 text-center">
          {[
            { value: "AI", label: "Recipe generation" },
            { value: "100%", label: "Free to use" },
            { value: "∞", label: "Recipes to save" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-primary">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="w-full max-w-4xl py-8">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Everything you need
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FEATURES.map(({ emoji, title, description, color }) => (
            <div
              key={title}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${color}`}>
                {emoji}
              </div>
              <h3 className="mb-1.5 font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      {!loading && !user && (
        <section className="my-16 w-full max-w-2xl overflow-hidden rounded-3xl bg-linear-to-br from-primary via-orange-500 to-amber-400 px-8 py-14 text-center text-white shadow-xl shadow-primary/20">
          <div className="mb-2 text-4xl">🍽️</div>
          <h2 className="mb-2 text-2xl font-bold">Ready to start cooking?</h2>
          <p className="mb-7 opacity-85">Join RecipeVault today — it&apos;s completely free.</p>
          <Button size="lg" className="rounded-full bg-white px-8 text-primary shadow-md hover:bg-white/90" asChild>
            <Link href="/auth/signup">Create your free account</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
