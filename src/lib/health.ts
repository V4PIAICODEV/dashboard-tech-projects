import type { ExecutionAnalysis } from "@/lib/data/types";

export type HealthStatus = "healthy" | "warning" | "critical";

export interface ProjectHealth {
  projectId: string;
  projectName: string;
  status: HealthStatus;
  errorCount: number;
  warningCount: number;
  totalExecutions: number;
  errorRate: number; // 0-100 percentage
  lastExecutionDate: string | null; // ISO date string from most recent execution
}

/**
 * Compute health summary for a single project from its execution analyses.
 * Filters analyses to only those matching the given projectId.
 */
export function computeProjectHealth(
  projectId: string,
  projectName: string,
  analyses: ExecutionAnalysis[]
): ProjectHealth {
  const filtered = analyses.filter(
    (a) => a.execution.projectId === projectId
  );

  const totalExecutions = filtered.length;
  const errorCount = filtered.filter(
    (a) => a.overallStatus === "error"
  ).length;
  const warningCount = filtered.filter(
    (a) => a.overallStatus === "warning"
  ).length;
  const errorRate =
    totalExecutions > 0 ? Math.round((errorCount / totalExecutions) * 100) : 0;

  // Determine health status from error rate thresholds (per UI-SPEC)
  let status: HealthStatus;
  if (errorRate === 0) {
    status = "healthy";
  } else if (errorRate <= 30) {
    status = "warning";
  } else {
    status = "critical";
  }

  // Find most recent execution date
  let lastExecutionDate: string | null = null;
  if (filtered.length > 0) {
    const sorted = [...filtered].sort((a, b) =>
      b.execution.date.localeCompare(a.execution.date)
    );
    lastExecutionDate = sorted[0].execution.date;
  }

  return {
    projectId,
    projectName,
    status,
    errorCount,
    warningCount,
    totalExecutions,
    errorRate,
    lastExecutionDate,
  };
}

/** Priority map for sorting: lower = worse = shown first */
const STATUS_PRIORITY: Record<HealthStatus, number> = {
  critical: 0,
  warning: 1,
  healthy: 2,
};

/**
 * Sort projects worst-first per D-02:
 * critical > warning > healthy, then alphabetical within same tier.
 */
export function sortByHealth(projects: ProjectHealth[]): ProjectHealth[] {
  return [...projects].sort((a, b) => {
    const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return a.projectName.localeCompare(b.projectName);
  });
}

/** Semantic colors per health status (from UI-SPEC) */
export const HEALTH_COLORS = {
  healthy: {
    bg: "hsl(142 71% 15%)",
    text: "hsl(142 71% 73%)",
    border: "hsl(142 71% 29%)",
  },
  warning: {
    bg: "hsl(48 96% 15%)",
    text: "hsl(48 96% 73%)",
    border: "hsl(48 96% 29%)",
  },
  critical: {
    bg: "hsl(0 72% 15%)",
    text: "hsl(0 72% 73%)",
    border: "hsl(0 72% 29%)",
  },
} as const;

/** Portuguese labels per health status (from UI-SPEC copywriting contract) */
export const HEALTH_LABELS: Record<HealthStatus, string> = {
  healthy: "Saudavel",
  warning: "Atencao",
  critical: "Critico",
};
