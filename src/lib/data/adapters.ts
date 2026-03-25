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
 * into ProjectExecution[].
 */
export function adaptGrupo1(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.map((item) => {
    const parsed = grupo1Schema.parse(item);
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
 * into ProjectExecution[].
 */
export function adaptGrupo2(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.map((item) => {
    const parsed = grupo2Schema.parse(item);
    const projectId = parsed.project_id;

    return {
      projectId,
      projectName: PROJECT_NAMES[projectId] ?? projectId,
      webhookGroup: 2 as const,
      date: parsed.data,
      identifiers: { email: parsed.email, tag: parsed.tag },
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
 * into ProjectExecution[].
 */
export function adaptGrupo3(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.map((item) => {
    const parsed = grupo3Schema.parse(item);
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
 * Parse a status array string like "Sucessos: 5" into a MetadataItem.
 * Returns { key: "sucessos", label: "Sucessos", value: 5, type: "status-array" }
 */
function parseStatusEntry(entry: string): MetadataItem {
  const colonIndex = entry.indexOf(": ");
  if (colonIndex === -1) {
    return {
      key: entry.toLowerCase().replace(/\s+/g, "_"),
      label: entry,
      value: null,
      type: "status-array",
    };
  }

  const label = entry.slice(0, colonIndex);
  const countStr = entry.slice(colonIndex + 2);
  const value = parseInt(countStr, 10);

  return {
    key: label.toLowerCase(),
    label,
    value: isNaN(value) ? null : value,
    type: "status-array",
  };
}

/**
 * Adapt Grupo 4 raw webhook data (Banco de Dados de Midia)
 * into ProjectExecution[].
 * NOTE: Uses "date" field (not "data") and status array (not metadado).
 */
export function adaptGrupo4(rawArray: unknown[]): ProjectExecution[] {
  return rawArray.map((item) => {
    const parsed = grupo4Schema.parse(item);
    const projectId = parsed.project_id;

    const metadata: MetadataItem[] = parsed.status.map(parseStatusEntry);

    return {
      projectId,
      projectName: PROJECT_NAMES[projectId] ?? projectId,
      webhookGroup: 4 as const,
      date: parsed.date,
      identifiers: {
        client_name: parsed.client_name,
        ekyte_id: parsed.ekyte_id,
      },
      metadata,
      rawData: item,
    };
  });
}
