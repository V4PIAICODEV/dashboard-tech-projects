import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
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

interface ClientRow {
  clientName: string;
  account: string;
  latestHealthscore: number | null;
  healthStatus: HealthStatus;
  monetizationOpportunity: string | null;
  lastExecutionDate: string;
  executionCount: number;
}

// Healthscore numeric ranges to status
function healthscoreToStatus(value: number): HealthStatus {
  if (value >= 70) return "healthy";
  if (value >= 40) return "warning";
  return "critical";
}

function buildClientRows(analyses: ExecutionAnalysis[]): ClientRow[] {
  const clientMap = new Map<
    string,
    {
      account: string;
      healthscores: { value: number; date: string }[];
      monetization: string | null;
      dates: string[];
    }
  >();

  for (const analysis of analyses) {
    const ids = analysis.execution.identifiers;
    const clientName = ids.tag || ids.email || "Desconhecido";
    const account = ids.email || ids.tag || "";

    const existing = clientMap.get(clientName) ?? {
      account,
      healthscores: [],
      monetization: null,
      dates: [],
    };

    existing.dates.push(analysis.execution.date);

    // Extract healthscore
    const hsField = analysis.fields.find((f) => f.key === "healthscore");
    if (hsField) {
      const num =
        typeof hsField.value === "number"
          ? hsField.value
          : parseFloat(String(hsField.value));
      if (!isNaN(num)) {
        existing.healthscores.push({
          value: num,
          date: analysis.execution.date,
        });
      }
    }

    // Extract monetization opportunity
    const monField = analysis.fields.find(
      (f) => f.key === "oportunidade_monetizacao"
    );
    if (monField && monField.value && String(monField.value).trim()) {
      existing.monetization = String(monField.value);
    }

    clientMap.set(clientName, existing);
  }

  const rows: ClientRow[] = [];
  for (const [clientName, data] of clientMap) {
    // Sort healthscores by date, take most recent
    const sortedHs = [...data.healthscores].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    const latestHs = sortedHs[0]?.value ?? null;

    // Sort dates, take most recent
    const sortedDates = [...data.dates].sort((a, b) => b.localeCompare(a));
    const lastDate = sortedDates[0] ?? "";

    rows.push({
      clientName,
      account: data.account,
      latestHealthscore: latestHs,
      healthStatus:
        latestHs !== null ? healthscoreToStatus(latestHs) : "inactive",
      monetizationOpportunity: data.monetization,
      lastExecutionDate: lastDate,
      executionCount: data.dates.length,
    });
  }

  // Sort by healthscore ascending (worst first)
  return rows.sort((a, b) => {
    if (a.latestHealthscore === null && b.latestHealthscore === null) return 0;
    if (a.latestHealthscore === null) return 1;
    if (b.latestHealthscore === null) return -1;
    return a.latestHealthscore - b.latestHealthscore;
  });
}

type SortKey = "clientName" | "latestHealthscore" | "lastExecutionDate" | "executionCount";

export function ClientOverviewTable({
  projectId,
  analyses,
}: ClientOverviewTableProps) {
  const [showTable, setShowTable] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("latestHealthscore");
  const [sortAsc, setSortAsc] = useState(true);

  // Only render for Account Coach AI
  if (projectId !== PROJECT_IDS.ACCOUNT_COACH) {
    return null;
  }

  const rows = useMemo(() => buildClientRows(analyses), [analyses]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "clientName":
          cmp = a.clientName.localeCompare(b.clientName);
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
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("latestHealthscore")}
                >
                  Healthscore{sortIndicator("latestHealthscore")}
                </th>
                <th className="py-2 px-2 text-muted-foreground font-medium">
                  Status
                </th>
                <th className="py-2 px-2 text-muted-foreground font-medium">
                  Oportunidade
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("executionCount")}
                >
                  Execucoes{sortIndicator("executionCount")}
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("lastExecutionDate")}
                >
                  Ultima execucao{sortIndicator("lastExecutionDate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.clientName} className="border-b last:border-b-0">
                  <td className="py-2 px-2 font-medium">{row.clientName}</td>
                  <td className="py-2 px-2">
                    {row.latestHealthscore !== null
                      ? row.latestHealthscore
                      : "—"}
                  </td>
                  <td className="py-2 px-2">
                    <HealthBadge status={row.healthStatus} />
                  </td>
                  <td className="py-2 px-2 max-w-[200px] truncate">
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
