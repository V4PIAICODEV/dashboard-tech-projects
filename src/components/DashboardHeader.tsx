import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button } from "@/components/ui/button";
import { AlertSettings } from "@/components/AlertSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/App";

interface DashboardHeaderProps {
  dataUpdatedAt: Date | null;
  isLoading: boolean;
  isRefetching: boolean;
}

/**
 * Fixed top header with dashboard title, refresh button,
 * last-updated timestamp, and logout button.
 */
export function DashboardHeader({
  dataUpdatedAt,
  isLoading,
  isRefetching,
}: DashboardHeaderProps) {
  const { logout } = useAuth();

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const lastUpdatedText = isLoading
    ? "Carregando dados..."
    : dataUpdatedAt
      ? `Atualizado ${formatDistanceToNow(dataUpdatedAt, { locale: ptBR, addSuffix: true })}`
      : "Carregando dados...";

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-card">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
        <h1 className="text-xl font-semibold">Dashboard Tech Projects</h1>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {lastUpdatedText}
          </span>

          <AlertSettings />

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            aria-label="Atualizar dados"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
