import { useMemo } from "react";
import { format, parseISO } from "date-fns";
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
import type { ExecutionAnalysis } from "@/lib/data/types";

interface ExecutionVolumeChartProps {
  analyses: ExecutionAnalysis[];
}

interface VolumeDataPoint {
  date: string; // "dd/MM" for display
  fullDate: string; // "yyyy-MM-dd" for sorting
  sucessos: number;
  erros: number;
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

function groupByDay(analyses: ExecutionAnalysis[]): VolumeDataPoint[] {
  const groups = new Map<string, { sucessos: number; erros: number }>();

  for (const analysis of analyses) {
    let parsedDate: Date;
    try {
      parsedDate = analysis.execution.date.includes("T")
        ? parseISO(analysis.execution.date)
        : new Date(analysis.execution.date + "T00:00:00");
    } catch {
      continue;
    }

    const dayKey = format(parsedDate, "yyyy-MM-dd");
    const existing = groups.get(dayKey) ?? { sucessos: 0, erros: 0 };

    if (analysis.overallStatus === "error") {
      existing.erros++;
    } else {
      existing.sucessos++;
    }

    groups.set(dayKey, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, counts]) => ({
      date: format(new Date(dayKey + "T00:00:00"), "dd/MM"),
      fullDate: dayKey,
      ...counts,
    }));
}

export function ExecutionVolumeChart({ analyses }: ExecutionVolumeChartProps) {
  const data = useMemo(() => groupByDay(analyses), [analyses]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-xl font-semibold mb-4">Volume de Execucoes por Dia</h2>
      <ChartContainer
        config={CHART_CONFIG}
        className="h-[200px] w-full"
        aria-label="Grafico de volume de execucoes por dia"
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            allowDecimals={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_label, payload) => {
                  const point = payload?.[0]?.payload as VolumeDataPoint | undefined;
                  return point?.fullDate ?? "";
                }}
              />
            }
          />
          <Bar
            dataKey="sucessos"
            stackId="volume"
            fill="hsl(142 71% 45%)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="erros"
            stackId="volume"
            fill="hsl(0 72% 50%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
