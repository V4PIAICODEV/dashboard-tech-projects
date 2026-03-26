import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExecutionAnalysis } from "@/lib/data/types";

import { PROJECT_IDS } from "@/lib/config";

// Only render for these two projects (per D-06)
const HEALTHSCORE_PROJECT_IDS: Set<string> = new Set([
  PROJECT_IDS.ACCOUNT_COACH,
  PROJECT_IDS.AUDITORIA,
]);

// Projects that support per-client filtering
const CLIENT_FILTER_PROJECT_IDS: Set<string> = new Set([
  PROJECT_IDS.ACCOUNT_COACH,
]);

interface HealthscoreChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  sortKey: string; // yyyy-MM-dd for sorting
  value: number;
  client?: string;
}

function getClientIdentifier(analysis: ExecutionAnalysis): string {
  const ids = analysis.execution.identifiers;
  return ids.tag || ids.email || ids.client_name || "Desconhecido";
}

function extractHealthscoreData(
  analyses: ExecutionAnalysis[],
  clientFilter: string | null
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];

  for (const analysis of analyses) {
    // Apply client filter if set
    if (clientFilter && getClientIdentifier(analysis) !== clientFilter) {
      continue;
    }

    const healthscoreField = analysis.fields.find((f) => f.key === "healthscore");
    if (!healthscoreField) continue;

    const raw = healthscoreField.value;
    const numeric = typeof raw === "number" ? raw : parseFloat(String(raw));
    if (isNaN(numeric)) continue;

    let parsedDate: Date;
    try {
      parsedDate = analysis.execution.date.includes("T")
        ? parseISO(analysis.execution.date)
        : new Date(analysis.execution.date + "T00:00:00");
    } catch {
      continue;
    }

    points.push({
      date: format(parsedDate, "dd/MM"),
      fullDate: format(parsedDate, "dd/MM/yyyy"),
      sortKey: format(parsedDate, "yyyy-MM-dd"),
      value: numeric,
      client: getClientIdentifier(analysis),
    });
  }

  return points.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function extractUniqueClients(analyses: ExecutionAnalysis[]): string[] {
  const clients = new Set<string>();
  for (const analysis of analyses) {
    const healthscoreField = analysis.fields.find((f) => f.key === "healthscore");
    if (!healthscoreField) continue;
    clients.add(getClientIdentifier(analysis));
  }
  return Array.from(clients).sort();
}

const CHART_CONFIG = {
  value: {
    label: "Healthscore",
    color: "hsl(142 71% 73%)",
  },
} satisfies ChartConfig;

export function HealthscoreChart({ projectId, analyses }: HealthscoreChartProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const supportsClientFilter = CLIENT_FILTER_PROJECT_IDS.has(projectId);
  const clients = useMemo(
    () => (supportsClientFilter ? extractUniqueClients(analyses) : []),
    [supportsClientFilter, analyses]
  );

  if (!HEALTHSCORE_PROJECT_IDS.has(projectId)) {
    return null;
  }

  const data = extractHealthscoreData(analyses, selectedClient);

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-xl font-semibold mb-4">Tendencia do Healthscore</h2>
        <p className="text-sm text-muted-foreground">
          Nenhum dado de healthscore disponivel
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Tendencia do Healthscore</h2>
        {supportsClientFilter && clients.length > 1 && (
          <select
            className="bg-background border rounded px-2 py-1 text-sm"
            value={selectedClient ?? ""}
            onChange={(e) =>
              setSelectedClient(e.target.value === "" ? null : e.target.value)
            }
          >
            <option value="">Todos os clientes (media)</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        )}
      </div>
      <ChartContainer
        config={CHART_CONFIG}
        className="h-[240px] w-full"
        aria-label="Grafico de tendencia do healthscore"
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_label, payload) => {
                  const point = payload?.[0]?.payload as ChartDataPoint | undefined;
                  const clientLabel = point?.client ? ` — ${point.client}` : "";
                  return `${point?.fullDate ?? ""}${clientLabel}`;
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(142 71% 73%)"
            strokeWidth={2}
            dot={data.length <= 20}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
