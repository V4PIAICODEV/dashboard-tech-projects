import { formatDistanceToNow, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/HealthBadge";
import { HEALTH_COLORS } from "@/lib/health";
import type { ExecutionAnalysis } from "@/lib/data/types";
import type { HealthStatus } from "@/lib/health";

// Map Severity -> HealthStatus for HealthBadge
const SEVERITY_TO_HEALTH: Record<string, HealthStatus> = {
  error: "critical",
  warning: "warning",
  pass: "healthy",
};

// Priority-ordered identifier display (per UI-SPEC Identifier Display table, D-01)
export function getExecutionIdentifier(
  identifiers: Record<string, string>,
  date: string
): string {
  if (identifiers.id_kommo) return `Kommo #${identifiers.id_kommo}`;
  if (identifiers.email) return identifiers.email;
  if (identifiers.client_name) return identifiers.client_name;
  return `Execucao ${date}`;
}

interface ExecutionRowProps {
  analysis: ExecutionAnalysis;
  onClick: () => void;
}

export function ExecutionRow({ analysis, onClick }: ExecutionRowProps) {
  const { execution, counts, overallStatus } = analysis;
  const healthStatus = SEVERITY_TO_HEALTH[overallStatus] ?? "healthy";
  const identifier = getExecutionIdentifier(
    execution.identifiers,
    execution.date
  );

  // Parse date — handle ISO string with or without time component
  let parsedDate: Date;
  try {
    // If date has no time component, append T00:00:00 to parse correctly
    parsedDate = execution.date.includes("T")
      ? parseISO(execution.date)
      : new Date(execution.date + "T00:00:00");
  } catch {
    parsedDate = new Date();
  }

  const relativeTime = formatDistanceToNow(parsedDate, {
    locale: ptBR,
    addSuffix: true,
  });
  const absoluteTime = format(parsedDate, "dd/MM/yyyy HH:mm");

  const errorCount = counts.error;
  const errorLabel = errorCount === 1 ? "1 erro" : `${errorCount} erros`;

  const errorColors =
    errorCount > 0 ? HEALTH_COLORS.critical : HEALTH_COLORS.healthy;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex items-center justify-between px-4 py-3 border-b cursor-pointer hover:bg-accent/50 transition-colors last:border-b-0"
      aria-label={`${identifier} - ${overallStatus}`}
    >
      {/* Left: identifier */}
      <span className="text-sm truncate" style={{ maxWidth: "200px" }}>
        {identifier}
      </span>

      {/* Center: error count badge */}
      <Badge
        variant="outline"
        className="mx-4 shrink-0 font-normal"
        style={{
          backgroundColor: errorColors.bg,
          color: errorColors.text,
          borderColor: errorColors.border,
        }}
      >
        {errorLabel}
      </Badge>

      {/* Right: relative timestamp + status badge */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground" title={absoluteTime}>
          {relativeTime}
        </span>
        <HealthBadge status={healthStatus} />
      </div>
    </div>
  );
}
