import * as React from "react";
import { CircleCheck, AlertTriangle, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HEALTH_COLORS } from "@/lib/health";
import type { FieldResult } from "@/lib/data/types";

// Icon and color per field severity (per UI-SPEC Field Status Icons table)
const SEVERITY_CONFIG = {
  pass: {
    Icon: CircleCheck,
    color: "hsl(142 71% 73%)", // HEALTH_COLORS.healthy.text
    ariaLabel: "Passou",
  },
  warning: {
    Icon: AlertTriangle,
    color: "hsl(48 96% 73%)", // HEALTH_COLORS.warning.text
    ariaLabel: "Atencao",
  },
  error: {
    Icon: CircleX,
    color: "hsl(0 72% 73%)", // HEALTH_COLORS.critical.text
    ariaLabel: "Erro",
  },
} as const;

// Format field value for display (per UI-SPEC Copywriting Contract)
function formatFieldValue(field: FieldResult): React.ReactNode {
  const { value, type, severity } = field;

  // Null/empty check
  if (value === null || value === undefined || value === "") {
    return (
      <span className="text-muted-foreground italic">Nao preenchido</span>
    );
  }

  // Boolean: show "Sim" or "Nao"
  if (type === "boolean") {
    return value === true ? "Sim" : "Nao";
  }

  // Healthscore: numeric value + severity badge
  if (type === "healthscore") {
    const severityLabel =
      severity === "error"
        ? "Critico"
        : severity === "warning"
          ? "Atencao"
          : "Saudavel";
    const colors =
      severity === "error"
        ? HEALTH_COLORS.critical
        : severity === "warning"
          ? HEALTH_COLORS.warning
          : HEALTH_COLORS.healthy;
    return (
      <span className="flex items-center gap-2">
        {String(value)}
        <Badge
          variant="outline"
          className="text-xs font-normal px-1.5 py-0"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
          }}
        >
          {severityLabel}
        </Badge>
      </span>
    );
  }

  // Status-array, text, and enum: display as string preserving whitespace
  return (
    <span className="whitespace-pre-wrap text-right" style={{ maxWidth: "240px" }}>
      {String(value)}
    </span>
  );
}

interface FieldRowProps {
  field: FieldResult;
}

export function FieldRow({ field }: FieldRowProps) {
  const config = SEVERITY_CONFIG[field.severity];
  const { Icon, color, ariaLabel } = config;

  return (
    <div className="flex items-start justify-between py-2 border-b last:border-b-0">
      {/* Left: icon + label */}
      <div className="flex items-center gap-2 min-w-0">
        <Icon
          className="h-4 w-4 shrink-0"
          style={{ color }}
          aria-label={ariaLabel}
        />
        <span className="text-sm truncate">{field.label}</span>
      </div>

      {/* Right: value */}
      <div className="ml-4 text-sm text-right">{formatFieldValue(field)}</div>
    </div>
  );
}
