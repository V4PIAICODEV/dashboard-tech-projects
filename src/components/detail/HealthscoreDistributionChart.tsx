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
import { PROJECT_IDS } from "@/lib/config";
import type { ExecutionAnalysis } from "@/lib/data/types";

// Only render for these two projects
const ALLOWED_PROJECT_IDS: Set<string> = new Set([
  PROJECT_IDS.ACCOUNT_COACH,
  PROJECT_IDS.AUDITORIA,
]);

interface HealthscoreDistributionChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

type HealthscoreCategory = "safe" | "care" | "danger" | "critical";

interface DistributionDataPoint {
  category: string;
  key: HealthscoreCategory;
  count: number;
}

const CATEGORY_COLORS: Record<HealthscoreCategory, string> = {
  safe: "hsl(142 71% 45%)",
  care: "hsl(48 96% 50%)",
  danger: "hsl(0 72% 50%)",
  critical: "hsl(0 72% 30%)",
};

const CHART_CONFIG = {
  count: {
    label: "Clientes",
    color: "hsl(142 71% 45%)",
  },
} satisfies ChartConfig;

function getClientKey(analysis: ExecutionAnalysis): string {
  const ids = analysis.execution.identifiers;
  return ids.tag || ids.email || ids.id_kommo || "unknown";
}

function computeDistribution(analyses: ExecutionAnalysis[]): DistributionDataPoint[] {
  // Get the latest execution per client
  const latestByClient = new Map<string, ExecutionAnalysis>();

  for (const analysis of analyses) {
    const clientKey = getClientKey(analysis);
    const existing = latestByClient.get(clientKey);

    if (!existing || analysis.execution.date > existing.execution.date) {
      latestByClient.set(clientKey, analysis);
    }
  }

  // Count distribution of healthscore categories
  const counts: Record<HealthscoreCategory, number> = {
    safe: 0,
    care: 0,
    danger: 0,
    critical: 0,
  };

  for (const analysis of latestByClient.values()) {
    const healthscoreField = analysis.fields.find((f) => f.key === "healthscore");
    if (!healthscoreField) continue;

    const raw = String(healthscoreField.value).toLowerCase().trim();

    if (raw === "safe") {
      counts.safe++;
    } else if (raw === "care") {
      counts.care++;
    } else if (raw === "danger") {
      counts.danger++;
    } else if (raw === "critical") {
      counts.critical++;
    }
  }

  return [
    { category: "Safe", key: "safe", count: counts.safe },
    { category: "Care", key: "care", count: counts.care },
    { category: "Danger", key: "danger", count: counts.danger },
    { category: "Critical", key: "critical", count: counts.critical },
  ];
}

export function HealthscoreDistributionChart({
  projectId,
  analyses,
}: HealthscoreDistributionChartProps) {
  const data = useMemo(() => computeDistribution(analyses), [analyses]);

  if (!ALLOWED_PROJECT_IDS.has(projectId)) {
    return null;
  }

  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-xl font-semibold mb-4">Distribuicao de Healthscore</h2>
      <ChartContainer
        config={CHART_CONFIG}
        className="h-[200px] w-full"
        aria-label="Grafico de distribuicao de healthscore"
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
