import { useQueries } from "@tanstack/react-query";
import type { AllProjectsResult, WebhookGroupResult } from "@/lib/data/types";
import {
  fetchGrupo1,
  fetchGrupo2,
  fetchGrupo3,
  fetchGrupo4,
} from "@/lib/data/fetchers";

/**
 * Hook that fetches all 4 webhook groups in parallel and combines them
 * into a single AllProjectsResult.
 *
 * Uses TanStack Query v5 `useQueries` with `combine` callback:
 * - All 4 queries run in parallel
 * - Results are merged in a single render via the combine callback
 * - Partial failure is isolated: one group failing does not block others
 *
 * Important: Fetchers never throw -- they return errors inside
 * WebhookGroupResult.error. TanStack Query sees all queries as "successful"
 * but our combine logic checks result.data.error for partial failure detection.
 */
export function useAllProjects(): AllProjectsResult {
  return useQueries({
    queries: [
      {
        queryKey: ["webhook", "grupo1"] as const,
        queryFn: fetchGrupo1,
      },
      {
        queryKey: ["webhook", "grupo2"] as const,
        queryFn: fetchGrupo2,
      },
      {
        queryKey: ["webhook", "grupo3"] as const,
        queryFn: fetchGrupo3,
      },
      {
        queryKey: ["webhook", "grupo4"] as const,
        queryFn: fetchGrupo4,
      },
    ],
    combine: (results): AllProjectsResult => {
      const groups: WebhookGroupResult[] = results.map((result, index) => {
        const group = (index + 1) as 1 | 2 | 3 | 4;

        if (result.data) {
          return result.data;
        }

        // Query still loading or errored at TanStack level
        return {
          group,
          executions: [],
          error: result.error ?? null,
          lastFetched: null,
        };
      });

      const allExecutions = groups.flatMap((g) => g.executions);
      const isLoading = results.some((r) => r.isLoading);
      const failedGroups = groups.filter((g) => g.error !== null);
      const successfulGroups = groups.filter(
        (g) => g.error === null && g.lastFetched !== null
      );

      return {
        groups,
        allExecutions,
        isLoading,
        failedGroups,
        successfulGroups,
      };
    },
  });
}
