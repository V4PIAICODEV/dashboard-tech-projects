import { Badge } from "@/components/ui/badge";
import {
  HEALTH_COLORS,
  HEALTH_LABELS,
  type HealthStatus,
} from "@/lib/health";

interface HealthBadgeProps {
  status: HealthStatus;
}

/**
 * Pill-shaped badge displaying health status with semantic color.
 * Text from HEALTH_LABELS, colors from HEALTH_COLORS.
 */
export function HealthBadge({ status }: HealthBadgeProps) {
  const colors = HEALTH_COLORS[status];
  const label = HEALTH_LABELS[status];

  return (
    <Badge
      variant="outline"
      className="text-sm font-normal px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      aria-label={`Status: ${label}`}
    >
      {label}
    </Badge>
  );
}
