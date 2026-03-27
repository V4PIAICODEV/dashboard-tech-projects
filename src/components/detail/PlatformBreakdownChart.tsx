import { useMemo } from "react";
import {
  BarChart,
  Bar,
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
import { PROJECT_IDS } from "@/lib/config";
import type { ExecutionAnalysis } from "@/lib/data/types";

interface PlatformBreakdownChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

interface PlatformDataPoint {
  plataforma: string;
  sucessos: number;
  erros: number;
  total: number;
  taxaSucesso: number; // success rate %
}

const CHART_CONFIG = {
  sucessos: {
    label: "Sucessos",
    color: "hsl(142 71% 45%)",
  },
  erros: {
    label: "Erros",
    color: "hsl(0 72% 50%)",
  },
} satisfies ChartConfig;

function aggregateByPlatform(analyses: ExecutionAnalysis[]): PlatformDataPoint[] {
  const groups = new Map<string, { sucessos: number; erros: number }>();

  for (const analysis of analyses) {
    const plataforma = analysis.execution.identifiers.plataforma;
    if (!plataforma) continue;

    const existing = groups.get(plataforma) ?? { sucessos: 0, erros: 0 };

    if (analysis.overallStatus === "error") {
      existing.erros++;
    } else {
      existing.sucessos++;
    }

    groups.set(plataforma, existing);
  }

  return Array.from(groups.entries())
    .map(([plataforma, counts]) => {
      const total = counts.sucessos + counts.erros;
      return {
        plataforma,
        sucessos: counts.sucessos,
        erros: counts.erros,
        total,
        taxaSucesso: total > 0 ? Math.round((counts.sucessos / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function PlatformBreakdownChart({
  projectId,
  analyses,
}: PlatformBreakdownChartProps) {
  const data = useMemo(() => aggregateByPlatform(analyses), [analyses]);

  if (projectId !== PROJECT_IDS.BANCO_MIDIA) {
    return null;
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-xl font-semibold mb-4">Execucoes por Plataforma</h2>
      <ChartContainer
        config={CHART_CONFIG}
        className="w-full"
        style={{ height: Math.max(200, data.length * 40) }}
        aria-label="Grafico de execucoes por plataforma"
      >
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="plataforma"
            width={100}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_label, payload) => {
                  const point = payload?.[0]?.payload as
                    | PlatformDataPoint
                    | undefined;
                  if (!point) return "";
                  return `${point.plataforma} (${point.taxaSucesso}% sucesso)`;
                }}
              />
            }
          />
          <Bar
            dataKey="sucessos"
            stackId="a"
            fill="hsl(142 71% 45%)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="erros"
            stackId="a"
            fill="hsl(0 72% 50%)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
