import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { isWithinInterval, startOfDay, endOfDay, subDays, parseISO } from "date-fns";
import { useAllProjects } from "@/hooks/useAllProjects";
import { analyzeAllExecutions } from "@/lib/data/errors";
import { PROJECT_NAMES, PROJECT_GROUPS, PROJECT_IDS } from "@/lib/config";
import { queryClient } from "@/App";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DateFilter, type FilterState } from "@/components/detail/DateFilter";
import { StatusFilter, type StatusFilterValue } from "@/components/detail/StatusFilter";
import { ExecutionList } from "@/components/detail/ExecutionList";
import { HealthscoreChart } from "@/components/detail/HealthscoreChart";
import { ExecutionVolumeChart } from "@/components/detail/ExecutionVolumeChart";
import { ClientOverviewTable } from "@/components/detail/ClientOverviewTable";
import { VendorRankingTable } from "@/components/detail/VendorRankingTable";
import { ErrorState } from "@/components/ErrorState";
import type { ExecutionAnalysis } from "@/lib/data/types";

/**
 * Pure date filter function. Exported for unit testing.
 */
export function applyDateFilter(
  analyses: ExecutionAnalysis[],
  filter: FilterState
): ExecutionAnalysis[] {
  if (filter.preset === "tudo") return analyses;

  const now = new Date();

  return analyses.filter((analysis) => {
    let parsedDate: Date;
    try {
      parsedDate = analysis.execution.date.includes("T")
        ? parseISO(analysis.execution.date)
        : new Date(analysis.execution.date + "T00:00:00");
    } catch {
      return false;
    }

    if (filter.preset === "hoje") {
      return isWithinInterval(parsedDate, {
        start: startOfDay(now),
        end: endOfDay(now),
      });
    }
    if (filter.preset === "7dias") {
      return isWithinInterval(parsedDate, {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
      });
    }
    if (filter.preset === "30dias") {
      return isWithinInterval(parsedDate, {
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      });
    }

    return true;
  });
}

/** Filter analyses by overall status */
export function applyStatusFilter(
  analyses: ExecutionAnalysis[],
  filter: StatusFilterValue
): ExecutionAnalysis[] {
  if (filter === "todos") return analyses;
  if (filter === "falhas") return analyses.filter((a) => a.overallStatus === "error");
  return analyses.filter((a) => a.overallStatus === "pass");
}

/** Group analyses by their plataforma identifier (Banco de Dados de Midia only) */
function groupByPlatform(
  analyses: ExecutionAnalysis[]
): Map<string, ExecutionAnalysis[]> {
  const groups = new Map<string, ExecutionAnalysis[]>();
  for (const a of analyses) {
    const plat = a.execution.identifiers.plataforma ?? "Outros";
    const list = groups.get(plat);
    if (list) {
      list.push(a);
    } else {
      groups.set(plat, [a]);
    }
  }
  return groups;
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { allExecutions, isLoading, groups } = useAllProjects();
  const isRefetching = useIsFetching() > 0;

  const [dateFilter, setDateFilter] = useState<FilterState>({ mode: "quick", preset: "tudo" });
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("todos");

  // Invalid project id — redirect to overview
  if (!id || !PROJECT_NAMES[id]) {
    return <Navigate to="/" replace />;
  }

  const projectName = PROJECT_NAMES[id];
  const projectGroup = PROJECT_GROUPS[id]; // 1 | 2 | 3 | 4
  const groupResult = groups[projectGroup - 1]; // groups is 0-indexed

  // Check if this project's webhook group has an error
  const groupFailed = groupResult?.error !== null && groupResult?.error !== undefined;

  // Filter executions: project → analyze → date filter → status filter
  const projectExecutions = allExecutions.filter((e) => e.projectId === id);
  const allAnalyses = analyzeAllExecutions(projectExecutions);
  const dateFiltered = applyDateFilter(allAnalyses, dateFilter);
  const filteredAnalyses = applyStatusFilter(dateFiltered, statusFilter);

  const isBancoMidia = id === PROJECT_IDS.BANCO_MIDIA;
  const platformGroups = useMemo(
    () => (isBancoMidia ? groupByPlatform(filteredAnalyses) : null),
    [isBancoMidia, filteredAnalyses]
  );

  return (
    <div className="min-h-screen bg-background">
      <DetailHeader projectName={projectName} isRefetching={isRefetching} />

      <main className="mx-auto max-w-[1200px] px-8 pt-24 pb-16 space-y-6">
        {/* Filter bar */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>

        {/* Execution volume chart */}
        <ExecutionVolumeChart analyses={filteredAnalyses} />

        {/* Execution list or error state */}
        {groupFailed && !isLoading ? (
          <ErrorState onRetry={() => queryClient.invalidateQueries()} />
        ) : platformGroups ? (
          // Banco de Dados de Midia: separate lists per platform
          Array.from(platformGroups.entries()).map(([platform, analyses]) => (
            <div key={platform} className="space-y-2">
              <h2 className="text-lg font-semibold">{platform}</h2>
              <ExecutionList analyses={analyses} isLoading={isLoading} />
            </div>
          ))
        ) : (
          <ExecutionList
            analyses={filteredAnalyses}
            isLoading={isLoading}
          />
        )}

        {/* Healthscore chart (only for Account Coach AI and Auditoria do Saber) */}
        <HealthscoreChart projectId={id} analyses={filteredAnalyses} />

        {/* Client overview table (only for Account Coach AI) */}
        <ClientOverviewTable projectId={id} analyses={filteredAnalyses} />

        {/* Vendor ranking table (only for Sales Coach AI) */}
        <VendorRankingTable projectId={id} analyses={filteredAnalyses} />
      </main>
    </div>
  );
}
