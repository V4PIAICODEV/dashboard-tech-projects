import { useAllProjects } from "@/hooks/useAllProjects";
import { OverviewGrid } from "@/components/OverviewGrid";

/**
 * Overview page showing all 7 project cards with health status.
 * Delegates data fetching to useAllProjects and rendering to OverviewGrid.
 */
export function OverviewPage() {
  const allProjectsResult = useAllProjects();

  return <OverviewGrid allProjectsResult={allProjectsResult} />;
}
