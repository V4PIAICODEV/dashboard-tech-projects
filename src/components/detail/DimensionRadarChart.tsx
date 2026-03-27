import { useState, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExecutionAnalysis } from "@/lib/data/types";
import { PROJECT_IDS } from "@/lib/config";

interface DimensionRadarChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

interface RadarDataPoint {
  dimension: string;
  fullName: string;
  value: number;
}

/** Keys to exclude from dimension extraction (not numeric dimension scores) */
const EXCLUDED_KEYS = new Set([
  "healthscore",
  "status",
  "status_execucao",
  "Status_saude_flag",
  "score",
]);

/** Map of known Portuguese dimension names to short display names */
const DIMENSION_SHORT_NAMES = new Map<string, string>([
  ["Engajamento & Satisfação", "Engajamento"],
  ["Engajamento & Satisfacao", "Engajamento"],
  ["Expectativas x Entregas", "Expectativas"],
  ["Resultados e Performance", "Resultados"],
  ["Relacionamento e Comunicação", "Comunicação"],
  ["Relacionamento e Comunicacao", "Comunicacao"],
  ["Consciência da Jornada V4", "Jornada V4"],
  ["Consciencia da Jornada V4", "Jornada V4"],
  ["Média geral da saúde do cliente", "Média Geral"],
  ["Media geral da saude do cliente", "Media Geral"],
]);

function getShortName(key: string): string {
  const mapped = DIMENSION_SHORT_NAMES.get(key);
  if (mapped) return mapped;
  // Fallback: take the first word
  const firstWord = key.split(/\s+/)[0];
  return firstWord ?? key;
}

function getClientIdentifier(analysis: ExecutionAnalysis): string {
  const ids = analysis.execution.identifiers;
  return ids.tag || ids.email || "Desconhecido";
}

/**
 * Extract numeric dimension fields from an analysis.
 * Returns a Map of key -> numeric value, excluding non-dimension keys.
 */
function extractDimensions(
  analysis: ExecutionAnalysis
): Map<string, number> {
  const dims = new Map<string, number>();
  for (const field of analysis.fields) {
    if (EXCLUDED_KEYS.has(field.key)) continue;
    const num = parseFloat(String(field.value));
    if (!isNaN(num)) {
      dims.set(field.key, num);
    }
  }
  return dims;
}

/**
 * Get the latest execution for each client, then compute dimensions.
 * Returns a Map of clientName -> Map<dimensionKey, value>.
 */
function getLatestDimensionsByClient(
  analyses: ExecutionAnalysis[]
): Map<string, Map<string, number>> {
  // Group by client, find the latest execution for each
  const latestByClient = new Map<string, ExecutionAnalysis>();

  for (const analysis of analyses) {
    const client = getClientIdentifier(analysis);
    const existing = latestByClient.get(client);
    if (
      !existing ||
      analysis.execution.date.localeCompare(existing.execution.date) > 0
    ) {
      latestByClient.set(client, analysis);
    }
  }

  const result = new Map<string, Map<string, number>>();
  for (const [client, analysis] of latestByClient) {
    const dims = extractDimensions(analysis);
    if (dims.size > 0) {
      result.set(client, dims);
    }
  }
  return result;
}

/**
 * Compute average of each dimension across all clients' latest executions.
 */
function computeAverageDimensions(
  clientDims: Map<string, Map<string, number>>
): RadarDataPoint[] {
  const sums = new Map<string, { total: number; count: number }>();

  for (const dims of clientDims.values()) {
    for (const [key, value] of dims) {
      const existing = sums.get(key) ?? { total: 0, count: 0 };
      existing.total += value;
      existing.count += 1;
      sums.set(key, existing);
    }
  }

  const points: RadarDataPoint[] = [];
  for (const [key, { total, count }] of sums) {
    points.push({
      dimension: getShortName(key),
      fullName: key,
      value: Math.round(total / count),
    });
  }

  return points;
}

const CHART_CONFIG = {
  value: {
    label: "Score",
    color: "rgb(34,197,94)",
  },
} satisfies ChartConfig;

export function DimensionRadarChart({
  projectId,
  analyses,
}: DimensionRadarChartProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const clientDimensions = useMemo(
    () => getLatestDimensionsByClient(analyses),
    [analyses]
  );

  const clients = useMemo(
    () => Array.from(clientDimensions.keys()).sort(),
    [clientDimensions]
  );

  const data = useMemo(() => {
    if (selectedClient) {
      const dims = clientDimensions.get(selectedClient);
      if (!dims) return [];
      const points: RadarDataPoint[] = [];
      for (const [key, value] of dims) {
        points.push({
          dimension: getShortName(key),
          fullName: key,
          value: Math.round(value),
        });
      }
      return points;
    }
    // "Todos" — average across all clients
    return computeAverageDimensions(clientDimensions);
  }, [selectedClient, clientDimensions]);

  // Only render for Account Coach AI
  if (projectId !== PROJECT_IDS.ACCOUNT_COACH) {
    return null;
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-xl font-semibold mb-4">Dimensoes do Cliente</h2>
        <p className="text-sm text-muted-foreground">
          Nenhum dado de dimensao disponivel
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Dimensoes do Cliente</h2>
        {clients.length > 1 && (
          <select
            className="bg-background border rounded px-2 py-1 text-sm"
            value={selectedClient ?? ""}
            onChange={(e) =>
              setSelectedClient(e.target.value === "" ? null : e.target.value)
            }
          >
            <option value="">Todos (media)</option>
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
        aria-label="Grafico radar das dimensoes do cliente"
      >
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_label, payload) => {
                  const point = payload?.[0]?.payload as
                    | RadarDataPoint
                    | undefined;
                  return point?.fullName ?? "";
                }}
              />
            }
          />
          <Radar
            dataKey="value"
            fill="rgba(34,197,94,0.2)"
            stroke="rgb(34,197,94)"
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
