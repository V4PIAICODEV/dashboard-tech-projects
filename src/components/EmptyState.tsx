import { Card, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";

/**
 * Empty state shown when webhooks return no execution data.
 * Centered card with icon, heading, and body text in pt-BR.
 */
export function EmptyState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            Nenhuma execucao encontrada
          </h2>
          <p className="text-sm text-muted-foreground">
            Os webhooks nao retornaram dados. Verifique se as automacoes estao
            ativas no n8n.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
