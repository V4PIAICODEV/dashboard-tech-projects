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

  // Execution status: show "Sucesso" or "Falha" with severity badge
  if (type === "execution-status") {
    const label = severity === "pass" ? "Sucesso" : "Falha";
    const colors =
      severity === "pass" ? HEALTH_COLORS.healthy : HEALTH_COLORS.critical;
    return (
      <Badge
        variant="outline"
        className="text-xs font-normal px-1.5 py-0"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.border,
        }}
      >
        {label}
      </Badge>
    );
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
    <span className="whitespace-pre-wrap text-right">
      {String(value)}
    </span>
  );
}

interface FieldRowProps {
  field: FieldResult;
}

const SEVERITY_BG: Record<string, string> = {
  error: "hsl(0 72% 15% / 0.3)",
  warning: "hsl(48 96% 15% / 0.2)",
  pass: "transparent",
};

export function FieldRow({ field }: FieldRowProps) {
  const config = SEVERITY_CONFIG[field.severity];
  const { Icon, color, ariaLabel } = config;
  const bgColor = SEVERITY_BG[field.severity] ?? "transparent";

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 px-2 rounded border-b last:border-b-0"
      style={{ backgroundColor: bgColor }}
    >
      {/* Icon */}
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color }}
        aria-label={ariaLabel}
      />
      {/* Label */}
      <span className="text-sm">{field.label}</span>
      {/* Value */}
      <div className="text-sm text-right">{formatFieldValue(field)}</div>
    </div>
  );
}
