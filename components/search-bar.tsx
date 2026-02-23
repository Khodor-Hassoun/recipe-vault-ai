"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Recipe, ApiResponse } from "@/lib/types";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  /** When true, render an inline dropdown of results */
  showDropdown?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = "Search recipes...",
  defaultValue = "",
  showDropdown = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const id = setTimeout(async () => {
      const trimmed = query.trim();
      onSearch?.(trimmed);

      if (!showDropdown || !trimmed) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const json = (await res.json()) as ApiResponse<Recipe[]>;
        setResults(json.data ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showDropdown]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (recipe: Recipe) => {
      setOpen(false);
      router.push(`/recipes/${recipe.id}`);
    },
    [router],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="pl-9" />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ul className="max-h-60 overflow-auto py-1">
            {results.map((recipe) => (
              <li key={recipe.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => handleSelect(recipe)}
                >
                  <span className="font-medium">{recipe.title}</span>
                  {recipe.cuisine_type && (
                    <span className="ml-auto text-xs text-muted-foreground">{recipe.cuisine_type}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && query.trim() && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-md">
          No recipes found
        </div>
      )}
    </div>
  );
}
