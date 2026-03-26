import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { ExecutionAnalysis } from "@/lib/data/types";
import { PROJECT_IDS } from "@/lib/config";

interface VendorRankingTableProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

interface VendorRow {
  vendorName: string;
  email: string;
  callCount: number;
  avgScore: number | null;
  indicationRate: number; // % of calls where pediu_indicacao = true
  lastExecutionDate: string;
}

function buildVendorRows(analyses: ExecutionAnalysis[]): VendorRow[] {
  const vendorMap = new Map<
    string,
    {
      email: string;
      scores: number[];
      indicationCount: number;
      totalCalls: number;
      dates: string[];
    }
  >();

  for (const analysis of analyses) {
    const ids = analysis.execution.identifiers;
    // tag is the vendor name for Sales Coach
    const vendorName = ids.tag || ids.email || "Desconhecido";
    const email = ids.email || "";

    const existing = vendorMap.get(vendorName) ?? {
      email,
      scores: [],
      indicationCount: 0,
      totalCalls: 0,
      dates: [],
    };

    existing.totalCalls++;
    existing.dates.push(analysis.execution.date);

    // Extract score from identifiers (stored as string)
    const scoreStr = ids.score;
    if (scoreStr) {
      const num = parseFloat(scoreStr);
      if (!isNaN(num)) existing.scores.push(num);
    }

    // Check pediu_indicacao field
    const indicacaoField = analysis.fields.find(
      (f) => f.key === "pediu_indicacao"
    );
    if (indicacaoField && indicacaoField.value === true) {
      existing.indicationCount++;
    }

    vendorMap.set(vendorName, existing);
  }

  const rows: VendorRow[] = [];
  for (const [vendorName, data] of vendorMap) {
    const avgScore =
      data.scores.length > 0
        ? Math.round(
            (data.scores.reduce((s, v) => s + v, 0) / data.scores.length) * 10
          ) / 10
        : null;

    const sortedDates = [...data.dates].sort((a, b) => b.localeCompare(a));

    rows.push({
      vendorName,
      email: data.email,
      callCount: data.totalCalls,
      avgScore,
      indicationRate:
        data.totalCalls > 0
          ? Math.round((data.indicationCount / data.totalCalls) * 100)
          : 0,
      lastExecutionDate: sortedDates[0] ?? "",
    });
  }

  // Sort by avgScore descending (best first)
  return rows.sort((a, b) => {
    if (a.avgScore === null && b.avgScore === null) return 0;
    if (a.avgScore === null) return 1;
    if (b.avgScore === null) return -1;
    return b.avgScore - a.avgScore;
  });
}

type SortKey = "vendorName" | "callCount" | "avgScore" | "indicationRate";

export function VendorRankingTable({
  projectId,
  analyses,
}: VendorRankingTableProps) {
  const [showTable, setShowTable] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("avgScore");
  const [sortAsc, setSortAsc] = useState(false); // descending by default for score

  if (projectId !== PROJECT_IDS.SALES_COACH) {
    return null;
  }

  const rows = useMemo(() => buildVendorRows(analyses), [analyses]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "vendorName":
          cmp = a.vendorName.localeCompare(b.vendorName);
          break;
        case "callCount":
          cmp = a.callCount - b.callCount;
          break;
        case "avgScore":
          cmp = (a.avgScore ?? -1) - (b.avgScore ?? -1);
          break;
        case "indicationRate":
          cmp = a.indicationRate - b.indicationRate;
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
      setSortAsc(false);
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Performance de Vendedores</h2>
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
                <th className="py-2 px-2 text-muted-foreground font-medium w-8">
                  #
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("vendorName")}
                >
                  Vendedor{sortIndicator("vendorName")}
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("callCount")}
                >
                  Calls{sortIndicator("callCount")}
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("avgScore")}
                >
                  Score medio{sortIndicator("avgScore")}
                </th>
                <th
                  className="py-2 px-2 cursor-pointer hover:text-foreground text-muted-foreground font-medium"
                  onClick={() => handleSort("indicationRate")}
                >
                  Pediu indicacao{sortIndicator("indicationRate")}
                </th>
                <th className="py-2 px-2 text-muted-foreground font-medium">
                  Ultima call
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, index) => (
                <tr
                  key={row.vendorName}
                  className="border-b last:border-b-0"
                >
                  <td className="py-2 px-2 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-medium">{row.vendorName}</div>
                    {row.email && (
                      <div className="text-xs text-muted-foreground">
                        {row.email}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2">{row.callCount}</td>
                  <td className="py-2 px-2">
                    {row.avgScore !== null ? (
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            row.avgScore >= 7
                              ? "hsl(142 71% 73%)"
                              : row.avgScore >= 4
                                ? "hsl(48 96% 73%)"
                                : "hsl(0 72% 73%)",
                        }}
                      >
                        {row.avgScore}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-2">{row.indicationRate}%</td>
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
