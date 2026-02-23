"use client";

// TODO: Implement SearchBar component
// Props:
// - onSearch: (query: string) => void
// - placeholder?: string
// - defaultValue?: string
// - isLoading?: boolean
//
// - Debounced input that calls onSearch after the user stops typing
// - Can be used on the /discover page

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, placeholder, defaultValue, isLoading }: SearchBarProps) {
  // TODO: implement component
  return null;
}
