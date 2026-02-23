"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccessMessage("Check your inbox — we sent you a confirmation link to activate your account.");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-orange-50/60 to-background px-4">
      {/* Brand mark */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl shadow-lg shadow-primary/20">
          🍴
        </span>
        <span className="text-xl font-bold tracking-tight">RecipeVault</span>
      </div>

      <Card className="w-full max-w-md shadow-xl shadow-black/5">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Start saving your recipes today</CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              {successMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              {serverError && (
                <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{serverError}</p>
              )}

              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
