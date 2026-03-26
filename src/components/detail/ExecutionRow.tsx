import { formatDistanceToNow, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HealthBadge } from "@/components/HealthBadge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { FieldRow } from "@/components/detail/FieldRow";
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
  if (identifiers.client_name) {
    const suffix = identifiers.type ? ` — ${identifiers.type}` : "";
    return `${identifiers.client_name}${suffix}`;
  }
  return `Execucao ${date}`;
}

interface ExecutionRowProps {
  analysis: ExecutionAnalysis;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ExecutionRow({
  analysis,
  isExpanded,
  onToggle,
}: ExecutionRowProps) {
  const { execution, counts, overallStatus } = analysis;
  const healthStatus = SEVERITY_TO_HEALTH[overallStatus] ?? "healthy";
  const identifier = getExecutionIdentifier(
    execution.identifiers,
    execution.date
  );

  // Parse date — handle ISO string with or without time component
  let parsedDate: Date;
  try {
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
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      {/* Row header (trigger) */}
      <CollapsibleTrigger
        className="flex w-full items-center justify-between px-4 py-3 border-b cursor-pointer hover:bg-accent/50 transition-colors"
        aria-label={`${identifier} - ${overallStatus}`}
      >
        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />

        {/* Identifier */}
        <span
          className="text-sm truncate ml-2 text-left"
          style={{ maxWidth: "200px", flex: "1 1 0%" }}
        >
          {identifier}
        </span>

        {/* Error count badge */}
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

        {/* Relative timestamp + status badge */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground" title={absoluteTime}>
            {relativeTime}
          </span>
          <HealthBadge status={healthStatus} />
        </div>
      </CollapsibleTrigger>

      {/* Expanded content */}
      <CollapsibleContent>
        <div className="bg-muted/30 border-b px-6 py-4">
          {analysis.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Falhas: {analysis.counts.error}
            </p>
          ) : (
            <div className="space-y-0">
              {analysis.fields.map((field) => (
                <FieldRow key={field.key} field={field} />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
