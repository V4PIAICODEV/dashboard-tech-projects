import { Outlet } from "react-router-dom";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Toaster } from "@/components/ui/sonner";

/**
 * App shell layout with header and main content area.
 * Renders child routes via <Outlet />.
 *
 * Provides DashboardHeader with real-time data:
 * - dataUpdatedAt: most recent query update timestamp
 * - isLoading: any webhook query still loading
 * - isRefetching: any webhook query refetching in background
 */
export function AppLayout() {
  const queryClientInstance = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["webhook"] });

  // Find the most recent dataUpdatedAt across all webhook queries
  const queryCache = queryClientInstance.getQueryCache();
  const webhookQueries = queryCache.findAll({ queryKey: ["webhook"] });

  let dataUpdatedAt: Date | null = null;
  let isLoading = false;

  for (const query of webhookQueries) {
    const state = query.state;
    if (state.status === "pending") {
      isLoading = true;
    }
    if (state.dataUpdatedAt) {
      const updatedAt = new Date(state.dataUpdatedAt);
      if (!dataUpdatedAt || updatedAt > dataUpdatedAt) {
        dataUpdatedAt = updatedAt;
      }
    }
  }

  // If no webhook queries exist yet, we're still loading
  if (webhookQueries.length === 0) {
    isLoading = true;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        dataUpdatedAt={dataUpdatedAt}
        isLoading={isLoading}
        isRefetching={isFetching > 0}
      />
      <main className="mx-auto max-w-[1200px] px-8 pt-6 mt-16">
        <Outlet />
      </main>
      <Toaster theme="dark" richColors />
    </div>
  );
}
