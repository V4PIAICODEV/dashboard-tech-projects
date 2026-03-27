import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale/pt-BR";
import { formatDistanceToNow } from "date-fns";
import { HealthBadge } from "@/components/HealthBadge";
import type { ExecutionAnalysis } from "@/lib/data/types";
import type { HealthStatus } from "@/lib/health";
import { PROJECT_IDS } from "@/lib/config";

interface ClientOverviewTableProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

/** Known dimension keys from Account Coach AI metadado */
const DIMENSION_KEYS = [
  "Engajamento & Satisfação",
  "Expectativas x Entregas",
  "Resultados e Performance",
  "Relacionamento e Comunicação",
  "Consciência da Jornada V4",
] as const;

const DIMENSION_SHORT: Record<string, string> = {
  "Engajamento & Satisfação": "Engaj.",
  "Expectativas x Entregas": "Expect.",
  "Resultados e Performance": "Result.",
  "Relacionamento e Comunicação": "Comun.",
  "Consciência da Jornada V4": "Jornada",
};

const FLAG_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: "hsl(142 71% 25%)", text: "hsl(142 71% 73%)" },
  yellow: { bg: "hsl(48 96% 25%)", text: "hsl(48 96% 73%)" },
  red: { bg: "hsl(0 72% 25%)", text: "hsl(0 72% 73%)" },
};

interface ClientRow {
  clientName: string;
  account: string;
  latestHealthscore: number | null;
  healthStatus: HealthStatus;
  healthscoreCategory: string | null;
  saudeFlag: string | null;
  mediaGeral: number | null;
  dimensions: Record<string, number | null>;
  monetizationOpportunity: string | null;
  lastExecutionDate: string;
  executionCount: number;
}

function healthscoreToStatus(value: number): HealthStatus {
  if (value >= 70) return "healthy";
  if (value >= 40) return "warning";
  return "critical";
}

function scoreColor(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value >= 70) return "text-green-400";
  if (value >= 40) return "text-yellow-400";
  return "text-red-400";
}

function buildClientRows(analyses: ExecutionAnalysis[]): ClientRow[] {
  const clientMap = new Map<
    string,
    {
      account: string;
      executions: { date: string; fields: ExecutionAnalysis["fields"] }[];
    }
  >();

  for (const analysis of analyses) {
    const ids = analysis.execution.identifiers;
    const clientName = ids.tag || ids.email || "Desconhecido";
    const account = ids.email || ids.tag || "";

    const existing = clientMap.get(clientName) ?? {
      account,
      executions: [],
    };

    existing.executions.push({
      date: analysis.execution.date,
      fields: analysis.fields,
    });

    clientMap.set(clientName, existing);
  }

  const rows: ClientRow[] = [];
  for (const [clientName, data] of clientMap) {
    // Sort executions by date descending, take latest
    const sorted = [...data.executions].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    const latest = sorted[0];
    if (!latest) continue;

    // Extract healthscore (categorical: safe/care/danger/critical)
    const hsField = latest.fields.find((f) => f.key === "healthscore");
    const hsCategory =
      hsField && typeof hsField.value === "string" ? hsField.value : null;

    // Extract numeric healthscore for status
    const hsNum =
      hsField && hsField.value !== null
        ? typeof hsField.value === "number"
          ? hsField.value
          : parseFloat(String(hsField.value))
        : NaN;
    const latestHealthscore = isNaN(hsNum) ? null : hsNum;

    // Extract Status_saude_flag
    const flagField = latest.fields.find(
      (f) => f.key === "Status_saude_flag" || f.key === "status_saude_flag"
    );
    const saudeFlag =
      flagField && typeof flagField.value === "string"
        ? flagField.value
        : null;

    // Extract Média geral
    const mediaField = latest.fields.find((f) =>
      f.key.toLowerCase().includes("média geral") ||
      f.key.toLowerCase().includes("media geral")
    );
    const mediaRaw = mediaField?.value;
    const mediaNum =
      mediaRaw !== null && mediaRaw !== undefined
        ? typeof mediaRaw === "number"
          ? mediaRaw
          : parseFloat(String(mediaRaw))
        : NaN;
    const mediaGeral = isNaN(mediaNum) ? null : mediaNum;

    // Extract dimension scores
    const dimensions: Record<string, number | null> = {};
    for (const dimKey of DIMENSION_KEYS) {
      const field = latest.fields.find((f) => f.key === dimKey);
      if (field && field.value !== null && field.value !== undefined) {
        const num =
          typeof field.value === "number"
            ? field.value
            : parseFloat(String(field.value));
        dimensions[dimKey] = isNaN(num) ? null : num;
      } else {
        dimensions[dimKey] = null;
      }
    }

    // Extract monetization opportunity
    const monField = latest.fields.find(
      (f) => f.key === "oportunidade_monetizacao"
    );
    const monetizationOpportunity =
      monField && monField.value && String(monField.value).trim()
        ? String(monField.value)
        : null;

    rows.push({
      clientName,
      account: data.account,
      latestHealthscore,
      healthStatus:
        latestHealthscore !== null
          ? healthscoreToStatus(latestHealthscore)
          : mediaGeral !== null
            ? healthscoreToStatus(mediaGeral)
            : "inactive",
      healthscoreCategory: hsCategory,
      saudeFlag,
      mediaGeral,
      dimensions,
      monetizationOpportunity,
      lastExecutionDate: sorted[0]?.date ?? "",
      executionCount: data.executions.length,
    });
  }

  return rows.sort((a, b) => {
    const aVal = a.mediaGeral ?? a.latestHealthscore ?? 999;
    const bVal = b.mediaGeral ?? b.latestHealthscore ?? 999;
    return aVal - bVal; // Worst first
  });
}

type SortKey =
  | "clientName"
  | "mediaGeral"
  | "latestHealthscore"
  | "lastExecutionDate"
  | "executionCount";

export function ClientOverviewTable({
  projectId,
  analyses,
}: ClientOverviewTableProps) {
  const [showTable, setShowTable] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("mediaGeral");
  const [sortAsc, setSortAsc] = useState(true);

  if (projectId !== PROJECT_IDS.ACCOUNT_COACH) {
    return null;
  }

  const rows = useMemo(() => buildClientRows(analyses), [analyses]);

  // Detect if dimension data is available
  const hasDimensions = rows.some((r) =>
    DIMENSION_KEYS.some((k) => r.dimensions[k] !== null)
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "clientName":
          cmp = a.clientName.localeCompare(b.clientName);
          break;
        case "mediaGeral":
          cmp = (a.mediaGeral ?? -1) - (b.mediaGeral ?? -1);
          break;
        case "latestHealthscore":
          cmp = (a.latestHealthscore ?? -1) - (b.latestHealthscore ?? -1);
          break;
        case "lastExecutionDate":
          cmp = a.lastExecutionDate.localeCompare(b.lastExecutionDate);
          break;
        case "executionCount":
          cmp = a.executionCount - b.executionCount;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  if (rows.length === 0) return null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Visao por Cliente</h2>
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors border rounded px-3 py-1"
        >
          {showTable ? "Ocultar tabela" : "Mostrar tabela"}
        </button>
      </div>

      {showTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("clientName")}
                >
                  Cliente{sortIndicator("clientName")}
                </th>
                {rows.some((r) => r.saudeFlag) && (
                  <th className="py-2 px-2 text-muted-foreground font-medium">
                    Flag
                  </th>
                )}
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("mediaGeral")}
                >
                  Média{sortIndicator("mediaGeral")}
                </th>
                {hasDimensions &&
                  DIMENSION_KEYS.map((key) => (
                    <th
                      key={key}
                      className="py-2 px-2 text-muted-foreground font-medium text-center"
                      title={key}
                    >
                      {DIMENSION_SHORT[key] ?? key}
                    </th>
                  ))}
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("latestHealthscore")}
                >
                  Healthscore{sortIndicator("latestHealthscore")}
                </th>
                <th className="py-2 px-2 text-muted-foreground font-medium">
                  Oportunidade
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("executionCount")}
                >
                  Exec.{sortIndicator("executionCount")}
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("lastExecutionDate")}
                >
                  Última exec.{sortIndicator("lastExecutionDate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.clientName}
                  className="border-b last:border-b-0"
                >
                  <td className="py-2 px-2 font-medium">{row.clientName}</td>
                  {rows.some((r) => r.saudeFlag) && (
                    <td className="py-2 px-2 text-center">
                      {row.saudeFlag ? (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={
                            FLAG_COLORS[row.saudeFlag.toLowerCase()] ?? {
                              bg: "transparent",
                              text: "inherit",
                            }
                          }
                        >
                          {row.saudeFlag}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  <td
                    className={`py-2 px-2 font-semibold ${scoreColor(row.mediaGeral)}`}
                  >
                    {row.mediaGeral !== null
                      ? Math.round(row.mediaGeral)
                      : "—"}
                  </td>
                  {hasDimensions &&
                    DIMENSION_KEYS.map((key) => {
                      const val = row.dimensions[key];
                      return (
                        <td
                          key={key}
                          className={`py-2 px-2 text-center ${scoreColor(val)}`}
                        >
                          {val !== null ? Math.round(val) : "—"}
                        </td>
                      );
                    })}
                  <td className="py-2 px-2">
                    {row.healthscoreCategory ? (
                      <HealthBadge
                        status={
                          row.healthscoreCategory === "safe"
                            ? "healthy"
                            : row.healthscoreCategory === "care"
                              ? "warning"
                              : "critical"
                        }
                      />
                    ) : row.latestHealthscore !== null ? (
                      <HealthBadge status={row.healthStatus} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2 max-w-[200px] truncate text-muted-foreground">
                    {row.monetizationOpportunity ?? "—"}
                  </td>
                  <td className="py-2 px-2">{row.executionCount}</td>
                  <td className="py-2 px-2 text-muted-foreground">
                    {row.lastExecutionDate
                      ? formatDistanceToNow(
                          new Date(
                            row.lastExecutionDate.includes("T")
                              ? row.lastExecutionDate
                              : row.lastExecutionDate + "T00:00:00"
                          ),
                          { locale: ptBR, addSuffix: true }
                        )
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
