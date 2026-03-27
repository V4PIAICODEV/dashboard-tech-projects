import type { ProjectExecution, MetadataItem } from "./types";
import { normalizeBoolean } from "./normalizers";
import {
  grupo1Schema,
  grupo2Schema,
  grupo3Schema,
  grupo4Schema,
} from "./schemas";
import { PROJECT_NAMES, FIELD_LABELS } from "@/lib/config";

/**
 * Build MetadataItem[] from a project's metadado object.
 * Applies normalizeBoolean to detect boolean strings, resolves Portuguese labels
 * from FIELD_LABELS, and classifies each field's type.
 */
function buildMetadataItems(
  projectId: string,
  metadado: Record<string, unknown>
): MetadataItem[] {
  const labels = FIELD_LABELS[projectId] ?? {};
  const items: MetadataItem[] = [];

  for (const key of Object.keys(metadado)) {
    const rawValue = metadado[key];
    const label = labels[key] ?? key;
    const normalized = normalizeBoolean(rawValue);

    let type: MetadataItem["type"];
    if (key === "healthscore") {
      type = "healthscore";
    } else if (key === "status" || key === "status_execucao") {
      type = "execution-status";
    } else if (typeof normalized === "boolean") {
      type = "boolean";
    } else {
      type = "text";
    }

    items.push({ key, label, value: normalized, type });
  }

  return items;
}

/**
 * Adapt Grupo 1 raw webhook data (Handover Aquisicao, Handover Monetizacao, BANT)
 * into ProjectExecution[]. Skips items that fail Zod validation.
 */
export function adaptGrupo1(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.flatMap((item) => {
    const result = grupo1Schema.safeParse(item);
    if (!result.success) return [];
    const parsed = result.data;
    const projectId = parsed.project_id;

    return {
      projectId,
      projectName: PROJECT_NAMES[projectId] ?? projectId,
      webhookGroup: 1 as const,
      date: parsed.data,
      identifiers: { id_kommo: parsed.id_kommo },
      metadata: buildMetadataItems(
        projectId,
        parsed.metadado as Record<string, unknown>
      ),
      rawData: item,
    };
  });
}

/**
 * Adapt Grupo 2 raw webhook data (Sales Coach AI, Account Coach AI)
 * into ProjectExecution[]. Skips items that fail Zod validation.
 */
export function adaptGrupo2(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.flatMap((item) => {
    const result = grupo2Schema.safeParse(item);
    if (!result.success) return [];
    const parsed = result.data;
    const projectId = parsed.project_id;

    return {
      projectId,
      projectName: PROJECT_NAMES[projectId] ?? projectId,
      webhookGroup: 2 as const,
      date: parsed.data,
      identifiers: { email: parsed.email, tag: parsed.tag, score: parsed.score },
      metadata: buildMetadataItems(
        projectId,
        parsed.metadado as Record<string, unknown>
      ),
      rawData: item,
    };
  });
}

/**
 * Adapt Grupo 3 raw webhook data (Auditoria do Saber)
 * into ProjectExecution[]. Skips items that fail Zod validation.
 */
export function adaptGrupo3(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.flatMap((item) => {
    const result = grupo3Schema.safeParse(item);
    if (!result.success) return [];
    const parsed = result.data;
    const projectId = parsed.project_id;

    return {
      projectId,
      projectName: PROJECT_NAMES[projectId] ?? projectId,
      webhookGroup: 3 as const,
      date: parsed.data,
      identifiers: { id_kommo: parsed.id_kommo },
      metadata: buildMetadataItems(
        projectId,
        parsed.metadado as Record<string, unknown>
      ),
      rawData: item,
    };
  });
}

/**
 * Adapt Grupo 4 raw webhook data (Banco de Dados de Midia)
 * into ProjectExecution[].
 * NOTE: Uses "date" field (not "data") and a single status string (not metadado).
 * Skips items that fail Zod validation.
 */
export function adaptGrupo4(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.flatMap((item) => {
    const result = grupo4Schema.safeParse(item);
    if (!result.success) return [];
    const parsed = result.data;
    const projectId = parsed.project_id;

    const metadata: MetadataItem[] = [
      {
        key: "status",
        label: "Status",
        value: parsed.status,
        type: "execution-status",
      },
    ];

    return {
      projectId,
      projectName: PROJECT_NAMES[projectId] ?? projectId,
      webhookGroup: 4 as const,
      date: parsed.date,
      identifiers: {
        client_name: parsed.client_name,
        ekyte_id: parsed.ekyte_id,
        plataforma: parsed.plataforma,
        type: parsed.type,
      },
      metadata,
      rawData: item,
    };
  });
}
