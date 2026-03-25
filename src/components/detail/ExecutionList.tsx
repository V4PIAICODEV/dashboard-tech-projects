import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import { ExecutionRow } from "@/components/detail/ExecutionRow";
import type { ExecutionAnalysis } from "@/lib/data/types";

interface ExecutionListProps {
  analyses: ExecutionAnalysis[];
  isLoading: boolean;
  onRowClick: (analysis: ExecutionAnalysis) => void;
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-5 w-16 mx-4" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

/**
 * Inline empty state for the detail list — uses detail-specific copy
 * (date-filter context, not global webhook empty state).
 */
function DetailEmptyState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Nenhuma execucao encontrada</h2>
          <p className="text-sm text-muted-foreground">
            Este projeto nao possui execucoes no periodo selecionado. Tente
            outro intervalo de datas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ExecutionList({
  analyses,
  isLoading,
  onRowClick,
}: ExecutionListProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return <DetailEmptyState />;
  }

  // Sort newest first per D-05
  const sorted = [...analyses].sort((a, b) =>
    b.execution.date.localeCompare(a.execution.date)
  );

  return (
    <div className="bg-card rounded-lg border">
      {sorted.map((analysis, index) => (
        <ExecutionRow
          key={`${analysis.execution.projectId}-${analysis.execution.date}-${index}`}
          analysis={analysis}
          onClick={() => onRowClick(analysis)}
        />
      ))}
    </div>
  );
}
