import type { RecipeStatus } from "@/lib/types";

const STATUS_CONFIG: Record<RecipeStatus, { label: string; emoji: string; className: string }> = {
  favorite: {
    label: "Favorite",
    emoji: "⭐",
    className: "bg-amber-100/90 text-amber-800 backdrop-blur-sm border border-amber-200/60 hover:bg-amber-100",
  },
  to_try: {
    label: "To Try",
    emoji: "🔖",
    className: "bg-sky-100/90 text-sky-800 backdrop-blur-sm border border-sky-200/60 hover:bg-sky-100",
  },
  made_before: {
    label: "Made Before",
    emoji: "✅",
    className: "bg-emerald-100/90 text-emerald-800 backdrop-blur-sm border border-emerald-200/60 hover:bg-emerald-100",
  },
};

interface StatusBadgeProps {
  status: RecipeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, emoji, className } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {emoji} {label}
    </span>
  );
}
