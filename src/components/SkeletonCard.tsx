import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder matching ProjectCard anatomy.
 * Shows while data is loading.
 */
export function SkeletonCard() {
  return (
    <Card className="border-l-4 border-l-muted">
      <CardContent className="p-4 space-y-3">
        {/* Row 1: badge + error rate */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
        {/* Row 2: project name */}
        <Skeleton className="h-5 w-40" />
        {/* Row 3: error count */}
        <Skeleton className="h-4 w-32" />
        {/* Row 4: timestamp */}
        <Skeleton className="h-4 w-36" />
      </CardContent>
    </Card>
  );
}
