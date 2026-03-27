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
  PROJECT_IDS.HANDOVER_AQUISICAO,
  PROJECT_IDS.HANDOVER_MONETIZACAO,
]);

interface ChecklistComplianceChartProps {
  projectId: string;
  analyses: ExecutionAnalysis[];
}

interface ComplianceDataPoint {
  label: string;
  rate: number;
}

const CHART_CONFIG = {
  rate: {
    label: "% Compliance",
    color: "hsl(142 71% 45%)",
  },
} satisfies ChartConfig;

function getBarColor(rate: number): string {
  if (rate > 80) return "hsl(142 71% 45%)";
  if (rate >= 50) return "hsl(48 96% 50%)";
  return "hsl(0 72% 50%)";
}

function computeCompliance(analyses: ExecutionAnalysis[]): ComplianceDataPoint[] {
  // Collect stats per boolean field key
  const fieldStats = new Map<string, { label: string; total: number; trueCount: number }>();

  for (const analysis of analyses) {
    for (const field of analysis.fields) {
      if (field.type !== "boolean") continue;

      const existing = fieldStats.get(field.key) ?? {
        label: field.label,
        total: 0,
        trueCount: 0,
      };

      existing.total++;
      if (field.value === true) {
        existing.trueCount++;
      }

      fieldStats.set(field.key, existing);
    }
  }

  // Compute compliance rates and sort ascending (worst first)
  const points: ComplianceDataPoint[] = [];

  for (const stats of fieldStats.values()) {
    if (stats.total === 0) continue;
    points.push({
      label: stats.label,
      rate: Math.round((stats.trueCount / stats.total) * 100),
    });
  }

  return points.sort((a, b) => a.rate - b.rate);
}

export function ChecklistComplianceChart({
  projectId,
  analyses,
}: ChecklistComplianceChartProps) {
  const data = useMemo(() => computeCompliance(analyses), [analyses]);

  if (!ALLOWED_PROJECT_IDS.has(projectId)) {
    return null;
  }

  if (data.length === 0) {
    return null;
  }

  const chartHeight = Math.max(200, data.length * 36);

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-xl font-semibold mb-4">Compliance do Checklist</h2>
      <ChartContainer
        config={CHART_CONFIG}
        style={{ height: chartHeight }}
        className="w-full"
        aria-label="Grafico de compliance do checklist"
      >
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            label={{
              value: "% Compliance",
              position: "insideBottom",
              offset: -5,
              style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={180}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
