import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
}

/**
 * Error state shown when all webhook groups fail.
 * Centered card with destructive styling, retry button.
 */
export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md border-destructive">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Falha ao carregar dados</h2>
          <p className="text-sm text-muted-foreground">
            Nao foi possivel conectar aos webhooks. Verifique a conexao e tente
            novamente.
          </p>
          <Button onClick={onRetry}>Tentar novamente</Button>
        </CardContent>
      </Card>
    </div>
  );
}
