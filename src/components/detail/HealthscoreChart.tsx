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

// Only render for these two projects (per D-06)
const HEALTHSCORE_PROJECT_IDS = new Set(["81034bbc", "ddf44dbe"]);

interface HealthscoreChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[]; // already filtered by date (parent applies date filter first)
}

interface ChartDataPoint {
  date: string; // "dd/MM" for X axis label
  fullDate: string; // "dd/MM/yyyy" for tooltip
  value: number; // numeric healthscore
}

function extractHealthscoreData(analyses: ExecutionAnalysis[]): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];

  for (const analysis of analyses) {
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
      value: numeric,
    });
  }

  // Sort chronologically for chart rendering (oldest to newest)
  return points.sort((a, b) => a.fullDate.localeCompare(b.fullDate));
}

const CHART_CONFIG = {
  value: {
    label: "Healthscore",
    color: "hsl(142 71% 73%)",
  },
} satisfies ChartConfig;

export function HealthscoreChart({ projectId, analyses }: HealthscoreChartProps) {
  // Only render for healthscore projects
  if (!HEALTHSCORE_PROJECT_IDS.has(projectId)) {
    return null;
  }

  const data = extractHealthscoreData(analyses);

  if (data.length < 2) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-xl font-semibold mb-4">Tendencia do Healthscore</h2>
        <p className="text-sm text-muted-foreground">
          Dados insuficientes para tendencia
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-xl font-semibold mb-4">Tendencia do Healthscore</h2>
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
                  return point?.fullDate ?? "";
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(142 71% 73%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
