import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { isWithinInterval, startOfDay, endOfDay, subDays, parseISO } from "date-fns";
import { useAllProjects } from "@/hooks/useAllProjects";
import { analyzeAllExecutions } from "@/lib/data/errors";
import { PROJECT_NAMES, PROJECT_GROUPS } from "@/lib/config";
import { queryClient } from "@/App";
import { DetailHeader } from "@/components/detail/DetailHeader";
import { DateFilter, type FilterState } from "@/components/detail/DateFilter";
import { ExecutionList } from "@/components/detail/ExecutionList";
import { ExecutionDrawer } from "@/components/detail/ExecutionDrawer";
import { HealthscoreChart } from "@/components/detail/HealthscoreChart";
import { ErrorState } from "@/components/ErrorState";
import type { ExecutionAnalysis } from "@/lib/data/types";

/**
 * Pure date filter function. Exported for unit testing in DateFilter.test.ts.
 * Applies a FilterState to a list of ExecutionAnalysis and returns matching items.
 */
export function applyDateFilter(
  analyses: ExecutionAnalysis[],
  filter: FilterState
): ExecutionAnalysis[] {
  if (filter.mode === "quick" && filter.preset === "tudo") return analyses;

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

    if (filter.mode === "quick") {
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
    }

    if (filter.mode === "range") {
      return isWithinInterval(parsedDate, {
        start: startOfDay(filter.from),
        end: endOfDay(filter.to),
      });
    }

    return true;
  });
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { allExecutions, isLoading, groups } = useAllProjects();
  const isRefetching = useIsFetching() > 0;

  const [filter, setFilter] = useState<FilterState>({ mode: "quick", preset: "tudo" });
  const [selectedAnalysis, setSelectedAnalysis] = useState<ExecutionAnalysis | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Invalid project id — redirect to overview
  if (!id || !PROJECT_NAMES[id]) {
    return <Navigate to="/" replace />;
  }

  const projectName = PROJECT_NAMES[id];
  const projectGroup = PROJECT_GROUPS[id]; // 1 | 2 | 3 | 4
  const groupResult = groups[projectGroup - 1]; // groups is 0-indexed

  // Check if this project's webhook group has an error
  const groupFailed = groupResult?.error !== null && groupResult?.error !== undefined;

  // Filter executions for this project, analyze, then apply date filter
  const projectExecutions = allExecutions.filter((e) => e.projectId === id);
  const allAnalyses = analyzeAllExecutions(projectExecutions);
  const filteredAnalyses = applyDateFilter(allAnalyses, filter);

  const handleRowClick = (analysis: ExecutionAnalysis) => {
    setSelectedAnalysis(analysis);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Keep selectedAnalysis until drawer animation completes (prevents flash)
    setTimeout(() => setSelectedAnalysis(null), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <DetailHeader projectName={projectName} isRefetching={isRefetching} />

      <main className="mx-auto max-w-[1200px] px-8 pt-24 pb-16 space-y-6">
        {/* Date filter bar */}
        <DateFilter value={filter} onChange={setFilter} />

        {/* Execution list or error state */}
        {groupFailed && !isLoading ? (
          <ErrorState onRetry={() => queryClient.invalidateQueries()} />
        ) : (
          <ExecutionList
            analyses={filteredAnalyses}
            isLoading={isLoading}
            onRowClick={handleRowClick}
          />
        )}

        {/* Healthscore chart (only for Account Coach AI and Auditoria do Saber) */}
        <HealthscoreChart projectId={id} analyses={filteredAnalyses} />
      </main>

      {/* Field breakdown drawer */}
      <ExecutionDrawer
        analysis={selectedAnalysis}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
