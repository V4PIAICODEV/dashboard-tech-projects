import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { FieldRow } from "@/components/detail/FieldRow";
import { getExecutionIdentifier } from "@/components/detail/ExecutionRow";
import type { ExecutionAnalysis } from "@/lib/data/types";

interface ExecutionDrawerProps {
  analysis: ExecutionAnalysis | null;
  open: boolean;
  onClose: () => void;
}

export function ExecutionDrawer({
  analysis,
  open,
  onClose,
}: ExecutionDrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-[480px] max-w-[480px] overflow-y-auto"
      >
        {analysis && (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl font-semibold">
                Detalhes da Execucao
              </SheetTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {analysis.execution.projectName} -{" "}
                {getExecutionIdentifier(
                  analysis.execution.identifiers,
                  analysis.execution.date
                )}
              </p>
            </SheetHeader>

            <Separator className="my-4" />

            {/* Field list */}
            <div className="space-y-0">
              {/* Banco de Dados de Midia (status-array project with no named fields) */}
              {analysis.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Falhas: {analysis.counts.error}
                </p>
              ) : (
                analysis.fields.map((field) => (
                  <FieldRow key={field.key} field={field} />
                ))
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
