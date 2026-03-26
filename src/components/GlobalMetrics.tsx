import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  Moon,
  Zap,
} from "lucide-react";
import type { ProjectHealth } from "@/lib/health";

interface GlobalMetricsProps {
  healthList: ProjectHealth[];
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

function MetricCard({ icon, label, value, subtext, color }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 bg-card rounded-lg border p-4 min-w-0">
      <div
        className="shrink-0 rounded-md p-2"
        style={{ backgroundColor: color ?? "hsl(var(--muted))" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground truncate">{subtext}</p>
        )}
      </div>
    </div>
  );
}

export function GlobalMetrics({ healthList }: GlobalMetricsProps) {
  const metrics = useMemo(() => {
    const totalProjects = healthList.length;
    const activeProjects = healthList.filter((h) => h.status !== "inactive").length;
    const inactiveProjects = healthList.filter((h) => h.status === "inactive").length;

    // Total executions and errors across all projects (from full data, not time-filtered)
    const totalExecutions = healthList.reduce((sum, h) => sum + h.totalExecutions, 0);
    const totalErrors = healthList.reduce((sum, h) => sum + h.errorCount, 0);

    // Average health score: % of non-error executions among active projects
    const activeWithExecutions = healthList.filter(
      (h) => h.status !== "inactive" && h.totalExecutions > 0
    );
    const avgHealthScore =
      activeWithExecutions.length > 0
        ? Math.round(
            activeWithExecutions.reduce((sum, h) => sum + (100 - h.errorRate), 0) /
              activeWithExecutions.length
          )
        : 0;

    return {
      totalProjects,
      activeProjects,
      inactiveProjects,
      totalExecutions,
      totalErrors,
      avgHealthScore,
    };
  }, [healthList]);

  const healthColor =
    metrics.avgHealthScore >= 80
      ? "hsl(142 71% 15%)"
      : metrics.avgHealthScore >= 50
        ? "hsl(48 96% 15%)"
        : "hsl(0 72% 15%)";

  const healthTextColor =
    metrics.avgHealthScore >= 80
      ? "hsl(142 71% 73%)"
      : metrics.avgHealthScore >= 50
        ? "hsl(48 96% 73%)"
        : "hsl(0 72% 73%)";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <MetricCard
        icon={<Zap className="h-5 w-5 text-blue-400" />}
        label="Automacoes ativas"
        value={metrics.activeProjects}
        subtext={`de ${metrics.totalProjects} total`}
        color="hsl(215 70% 15%)"
      />
      <MetricCard
        icon={<Activity className="h-5 w-5 text-emerald-400" />}
        label="Total de execucoes"
        value={metrics.totalExecutions}
        color="hsl(142 71% 15%)"
      />
      <MetricCard
        icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
        label="Total de erros"
        value={metrics.totalErrors}
        color="hsl(0 72% 15%)"
      />
      <MetricCard
        icon={
          <HeartPulse className="h-5 w-5" style={{ color: healthTextColor }} />
        }
        label="Saude geral"
        value={`${metrics.avgHealthScore}%`}
        color={healthColor}
      />
      <MetricCard
        icon={<Moon className="h-5 w-5 text-slate-400" />}
        label="Sem execucao recente"
        value={metrics.inactiveProjects}
        color="hsl(215 20% 16%)"
      />
    </div>
  );
}
