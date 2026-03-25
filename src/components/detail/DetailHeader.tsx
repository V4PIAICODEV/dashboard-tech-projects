import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/App";

interface DetailHeaderProps {
  projectName: string;
  isRefetching: boolean;
}

export function DetailHeader({ projectName, isRefetching }: DetailHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-card">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
        {/* Left: back button + project name */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-1 px-0 hover:bg-transparent hover:text-primary"
            aria-label="Voltar para visao geral"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          <h1 className="text-xl font-semibold">{projectName}</h1>
        </div>

        {/* Right: refresh + logout */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
            disabled={isRefetching}
            aria-label="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
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
