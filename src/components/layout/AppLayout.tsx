import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

/**
 * App shell layout with header and main content area.
 * Renders child routes via <Outlet />.
 *
 * Header contains:
 * - Dashboard title
 * - Last-updated timestamp placeholder (wired in Plan 03-03)
 * - Refresh button placeholder (wired in Plan 03-03)
 * - Logout button
 */
export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold tracking-tight">
            Dashboard Tech Projects
          </h1>

          <div className="flex items-center gap-3">
            {/* Last updated timestamp -- wired in Plan 03-03 */}
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Ultima atualizacao: --
            </span>

            {/* Refresh button -- wired in Plan 03-03 */}
            <Button variant="outline" size="sm" disabled>
              Atualizar
            </Button>

            <Button variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
