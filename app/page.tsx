"use client";

import Link from "next/link";
import { ChefHat, Sparkles, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const FEATURES = [
  {
    icon: ChefHat,
    title: "Your Personal Cookbook",
    description: "Save and organise all your favourite recipes in one place, always accessible.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Describe a dish and let AI write the full recipe — ingredients, steps, and more.",
  },
  {
    icon: Globe,
    title: "Discover & Share",
    description: "Browse recipes from the community or share your own with the world.",
  },
  {
    icon: Lock,
    title: "Private by Default",
    description: "Your recipes are private until you choose to share them publicly or with specific friends.",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex w-full max-w-4xl flex-col items-center gap-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered recipe management
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Your recipes,{" "}
          <span className="bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            organised beautifully
          </span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          RecipeVault helps you save, organise, and discover recipes. Generate full recipes with AI, track your cooking
          status, and share your favourites with friends.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {loading ? null : user ? (
            <Button size="lg" asChild>
              <Link href="/recipes">Go to My Recipes</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </>
          )}
          <Button size="lg" variant="ghost" asChild>
            <Link href="/discover">Browse Recipes</Link>
          </Button>
        </div>
      </section>

      {/* Features grid */}
      <section className="grid w-full max-w-4xl grid-cols-1 gap-6 py-12 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-1 font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>

      {/* CTA banner */}
      {!loading && !user && (
        <section className="my-12 w-full max-w-2xl rounded-2xl bg-primary px-8 py-12 text-center text-primary-foreground">
          <h2 className="mb-2 text-2xl font-bold">Ready to start cooking?</h2>
          <p className="mb-6 opacity-90">Join RecipeVault today — it&apos;s free.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">Create your account</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
