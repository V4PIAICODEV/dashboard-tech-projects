import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExecutionAnalysis } from "@/lib/data/types";
import { PROJECT_IDS } from "@/lib/config";

interface DimensionRankingChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

interface RankingDataPoint {
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
  const firstWord = key.split(/\s+/)[0];
  return firstWord ?? key;
}

function getClientIdentifier(analysis: ExecutionAnalysis): string {
  const ids = analysis.execution.identifiers;
  return ids.tag || ids.email || "Desconhecido";
}

function getBarColor(value: number): string {
  if (value < 40) return "hsl(0 72% 50%)";
  if (value < 70) return "hsl(48 96% 50%)";
  return "hsl(142 71% 45%)";
}

/**
 * Compute average of each dimension across all clients' latest executions.
 * Returns data sorted by value ascending (weakest first).
 */
function computeRankingData(
  analyses: ExecutionAnalysis[]
): RankingDataPoint[] {
  // Get latest execution per client
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

  // Sum dimensions across all clients' latest executions
  const sums = new Map<string, { total: number; count: number }>();
  for (const analysis of latestByClient.values()) {
    for (const field of analysis.fields) {
      if (EXCLUDED_KEYS.has(field.key)) continue;
      const num = parseFloat(String(field.value));
      if (isNaN(num)) continue;
      const existing = sums.get(field.key) ?? { total: 0, count: 0 };
      existing.total += num;
      existing.count += 1;
      sums.set(field.key, existing);
    }
  }

  const points: RankingDataPoint[] = [];
  for (const [key, { total, count }] of sums) {
    points.push({
      dimension: getShortName(key),
      fullName: key,
      value: Math.round(total / count),
    });
  }

  // Sort ascending (weakest first)
  return points.sort((a, b) => a.value - b.value);
}

const CHART_CONFIG = {
  value: {
    label: "Score",
    color: "hsl(142 71% 45%)",
  },
} satisfies ChartConfig;

export function DimensionRankingChart({
  projectId,
  analyses,
}: DimensionRankingChartProps) {
  const data = useMemo(() => computeRankingData(analyses), [analyses]);

  // Only render for Account Coach AI
  if (projectId !== PROJECT_IDS.ACCOUNT_COACH) {
    return null;
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-xl font-semibold mb-4">
          Ranking de Dimensoes (media geral)
        </h2>
        <p className="text-sm text-muted-foreground">
          Nenhum dado de dimensao disponivel
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-xl font-semibold mb-4">
        Ranking de Dimensoes (media geral)
      </h2>
      <ChartContainer
        config={CHART_CONFIG}
        className="h-[240px] w-full"
        aria-label="Grafico de ranking das dimensoes"
      >
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            dataKey="dimension"
            type="category"
            width={120}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_label, payload) => {
                  const point = payload?.[0]?.payload as
                    | RankingDataPoint
                    | undefined;
                  return point?.fullName ?? "";
                }}
              />
            }
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
