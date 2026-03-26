import { useState, useEffect, useRef, useMemo } from "react";
import type { AllProjectsResult } from "@/lib/data/types";
import { analyzeAllExecutions } from "@/lib/data/errors";
import { computeProjectHealth, sortByHealth } from "@/lib/health";
import { processAlerts } from "@/lib/alerts";
import { PROJECT_REGISTRY } from "@/lib/config";
import { queryClient } from "@/App";
import { ProjectCard } from "@/components/ProjectCard";
import { GlobalMetrics } from "@/components/GlobalMetrics";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PartialFailureBanner } from "@/components/PartialFailureBanner";

interface OverviewGridProps {
  allProjectsResult: AllProjectsResult;
}

/**
 * Grid of project cards sorted worst-first.
 * Handles loading, error, empty, and partial failure states.
 */
export function OverviewGrid({ allProjectsResult }: OverviewGridProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const alertProcessedRef = useRef<number>(0);

  const {
    allExecutions,
    isLoading,
    failedGroups,
  } = allProjectsResult;

  // Compute health for each project (always, even if empty — hooks must not be conditional)
  const analyses = useMemo(
    () => analyzeAllExecutions(allExecutions),
    [allExecutions]
  );
  const sorted = useMemo(() => {
    const healthList = PROJECT_REGISTRY.map((project) =>
      computeProjectHealth(project.id, project.name, analyses)
    );
    return sortByHealth(healthList);
  }, [analyses]);

  // Process alerts for new errors (fire-and-forget, once per data update)
  useEffect(() => {
    const executionCount = allExecutions.length;
    if (executionCount > 0 && executionCount !== alertProcessedRef.current) {
      alertProcessedRef.current = executionCount;
      processAlerts(analyses);
    }
  }, [allExecutions.length, analyses]);

  // Loading: show 7 skeleton cards
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        aria-busy="true"
      >
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // All failed: show error state
  if (failedGroups.length === 4) {
    return (
      <ErrorState
        onRetry={() => queryClient.invalidateQueries()}
      />
    );
  }

  // No executions and no failures: show empty state
  if (allExecutions.length === 0 && failedGroups.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Partial failure banner */}
      {failedGroups.length > 0 && failedGroups.length < 4 && !bannerDismissed && (
        <PartialFailureBanner
          failedCount={failedGroups.length}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Global metrics header */}
      <GlobalMetrics healthList={sorted} />

      {/* Project cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((health) => (
          <ProjectCard key={health.projectId} health={health} />
        ))}
      </div>
    </div>
  );
}
