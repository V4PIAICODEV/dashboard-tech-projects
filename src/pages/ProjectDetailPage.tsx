import { useParams } from "react-router-dom";
import { PROJECT_NAMES } from "@/lib/config";

/**
 * Project detail page placeholder. Will be implemented in Phase 4.
 */
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectName = id ? PROJECT_NAMES[id] : undefined;

  return (
    <div>
      <h2 className="text-xl font-semibold">
        {projectName ?? "Projeto nao encontrado"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        Detail view -- execution history coming in Phase 4.
      </p>
    </div>
  );
}
