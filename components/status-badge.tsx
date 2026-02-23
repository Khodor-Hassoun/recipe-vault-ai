import { Badge } from "@/components/ui/badge";
import type { RecipeStatus } from "@/lib/types";

const STATUS_CONFIG: Record<RecipeStatus, { label: string; className: string }> = {
  favorite: { label: "Favorite", className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100" },
  to_try: { label: "To Try", className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100" },
  made_before: { label: "Made Before", className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" },
};

interface StatusBadgeProps {
  status: RecipeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
