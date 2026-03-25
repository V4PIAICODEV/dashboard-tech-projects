import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Card, CardContent } from "@/components/ui/card";
import { HealthBadge } from "@/components/HealthBadge";
import { HEALTH_COLORS } from "@/lib/health";
import type { ProjectHealth } from "@/lib/health";

interface ProjectCardProps {
  health: ProjectHealth;
}

/**
 * Individual project health card. Clickable link to project detail.
 * Shows health badge, error rate %, project name, error count, last execution.
 */
export function ProjectCard({ health }: ProjectCardProps) {
  const colors = HEALTH_COLORS[health.status];

  const errorCountText =
    health.totalExecutions === 0
      ? "Sem execucoes recentes"
      : `${health.errorCount} erros em ${health.totalExecutions} execucoes`;

  const lastExecutionText =
    health.lastExecutionDate
      ? `Ultima execucao: ${formatDistanceToNow(new Date(health.lastExecutionDate), { locale: ptBR, addSuffix: true })}`
      : "Sem execucoes recentes";

  return (
    <Link to={`/project/${health.projectId}`} className="block">
      <Card
        className="cursor-pointer hover:scale-[1.02] transition-all duration-150 ease-in-out hover:shadow-lg"
        style={{ borderLeft: `4px solid ${colors.border}` }}
      >
        <CardContent className="p-4 space-y-2">
          {/* Row 1: badge + error rate */}
          <div className="flex items-center justify-between">
            <HealthBadge status={health.status} />
            <span
              className="text-xl font-semibold"
              style={{ color: colors.text }}
            >
              {health.errorRate}%
            </span>
          </div>

          {/* Row 2: project name */}
          <h3 className="text-lg font-semibold truncate">
            {health.projectName}
          </h3>

          {/* Row 3: error count */}
          <p className="text-sm text-muted-foreground">{errorCountText}</p>

          {/* Row 4: last execution */}
          <p className="text-sm text-muted-foreground">{lastExecutionText}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
