import { useState, useCallback } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  isAlertsEnabled,
  setAlertsEnabled,
  isProjectAlertEnabled,
  setProjectAlertEnabled,
} from "@/lib/alerts";
import { PROJECT_REGISTRY } from "@/lib/config";

export function AlertSettings() {
  const [globalEnabled, setGlobalEnabled] = useState(isAlertsEnabled);
  const [projectToggles, setProjectToggles] = useState(() =>
    Object.fromEntries(
      PROJECT_REGISTRY.map((p) => [p.id, isProjectAlertEnabled(p.id)])
    )
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleGlobalToggle = useCallback(() => {
    const newValue = !globalEnabled;
    setAlertsEnabled(newValue);
    setGlobalEnabled(newValue);
  }, [globalEnabled]);

  const handleProjectToggle = useCallback(
    (projectId: string) => {
      const newValue = !projectToggles[projectId];
      setProjectAlertEnabled(projectId, newValue);
      setProjectToggles((prev) => ({ ...prev, [projectId]: newValue }));
    },
    [projectToggles]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Configuracoes de alerta"
      >
        {globalEnabled ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Alertas</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border rounded-lg shadow-lg p-4 w-72">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Alertas de Erro</span>
              <button
                onClick={handleGlobalToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  globalEnabled ? "bg-emerald-600" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    globalEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {globalEnabled && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Por projeto:
                </p>
                {PROJECT_REGISTRY.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm truncate mr-2">
                      {project.name}
                    </span>
                    <button
                      onClick={() => handleProjectToggle(project.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        projectToggles[project.id]
                          ? "bg-emerald-600"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                          projectToggles[project.id]
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
