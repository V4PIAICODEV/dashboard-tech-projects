import { X } from "lucide-react";
import { HEALTH_COLORS } from "@/lib/health";

interface PartialFailureBannerProps {
  failedCount: number;
  onDismiss: () => void;
}

/**
 * Warning-colored banner shown when some (but not all) webhook groups fail.
 * Dismissible with X button.
 */
export function PartialFailureBanner({
  failedCount,
  onDismiss,
}: PartialFailureBannerProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg p-3 mb-6"
      style={{
        backgroundColor: HEALTH_COLORS.warning.bg,
        color: HEALTH_COLORS.warning.text,
        border: `1px solid ${HEALTH_COLORS.warning.border}`,
      }}
    >
      <p className="text-sm">
        {failedCount} de 4 fontes de dados indisponiveis. Exibindo dados
        parciais.
      </p>
      <button
        onClick={onDismiss}
        className="ml-4 shrink-0 rounded p-1 hover:opacity-80 transition-opacity"
        aria-label="Fechar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
