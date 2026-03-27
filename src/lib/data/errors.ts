import type { MetadataItem, Severity, FieldResult, ExecutionAnalysis, ProjectExecution } from "./types";
import { PROJECT_IDS } from "@/lib/config";

/** Projects that use per-field error detection (boolean checklist items) */
const PER_FIELD_PROJECTS: Set<string> = new Set([PROJECT_IDS.HANDOVER_AQUISICAO, PROJECT_IDS.HANDOVER_MONETIZACAO]);

// Individual detector functions (not exported -- internal)

// D-07: Boolean false = error
function detectBoolean(item: MetadataItem): Severity {
  if (item.value === true) return "pass";
  return "error"; // false, null, undefined all = error (missing data)
}

// Text fields are informational only — they don't determine errors.
// Error/success for text-heavy projects is determined by the "status" metadado field.
function detectText(_item: MetadataItem): Severity {
  return "pass";
}

// D-01 through D-04: Healthscore severity mapping
const HEALTHSCORE_MAP: Record<string, Severity> = {
  critical: "error", // D-01
  danger: "error", // D-02
  care: "warning", // D-03
  safe: "pass", // D-04
};

function detectHealthscore(item: MetadataItem): Severity {
  if (typeof item.value === "string") {
    return HEALTHSCORE_MAP[item.value.toLowerCase()] ?? "error"; // unknown = error
  }
  return "error"; // null/missing = error
}

// D-09: Status array -- only "falhas" key with value > 0 is error
function detectStatusArray(item: MetadataItem): Severity {
  if (item.key === "falhas") {
    if (typeof item.value === "number" && item.value > 0) return "error";
    if (item.value === 0) return "pass";
    return "error"; // null/NaN = error
  }
  return "pass"; // "sucessos" and other status-array items are informational
}

// Execution status: "sucesso" = pass, "falha" = error
function detectExecutionStatus(item: MetadataItem): Severity {
  if (typeof item.value === "string" && item.value.toLowerCase() === "sucesso") {
    return "pass";
  }
  return "error"; // "falha", null, unknown
}

// Enum placeholder -- no current fields use this type
function detectEnum(_item: MetadataItem): Severity {
  return "pass"; // placeholder for future enum-typed fields
}

// Type-based dispatch map -- project-agnostic per D-10
const DETECTOR: Record<MetadataItem["type"], (item: MetadataItem) => Severity> = {
  boolean: detectBoolean,
  text: detectText,
  healthscore: detectHealthscore,
  "status-array": detectStatusArray,
  "execution-status": detectExecutionStatus,
  enum: detectEnum,
};

/** Detect severity for a single metadata field by dispatching on item.type */
export function detectFieldSeverity(item: MetadataItem): Severity {
  const detect = DETECTOR[item.type];
  if (!detect) return "pass"; // graceful fallback for truly unknown types
  return detect(item);
}

// -- Aggregation Layer (Plan 02) --

/**
 * Analyze a single execution: classify each field and compute aggregate counts.
 *
 * Two modes:
 * - **Status-driven** (BANT, Sales Coach, Account Coach, Auditoria, Banco de Dados):
 *   only the status/status_execucao field determines severity. All other fields
 *   (healthscore, boolean, text) are informational (pass).
 * - **Per-field** (Handover Aquisição, Handover Monetização): each boolean checklist
 *   field is evaluated individually — false/missing = error.
 */
export function analyzeExecution(exec: ProjectExecution): ExecutionAnalysis {
  const isPerField = PER_FIELD_PROJECTS.has(exec.projectId);
  const hasStatusField = exec.metadata.some((m) => m.type === "execution-status");

  const fields: FieldResult[] = exec.metadata.map((item) => {
    let severity: Severity;
    if (!isPerField && hasStatusField && item.type !== "execution-status") {
      // Status-driven mode: only status field determines errors
      severity = "pass";
    } else {
      severity = detectFieldSeverity(item);
    }
    return {
      key: item.key,
      label: item.label,
      value: item.value,
      type: item.type,
      severity,
    };
  });

  const counts = { error: 0, warning: 0, pass: 0, total: fields.length };
  for (const f of fields) {
    counts[f.severity]++;
  }

  const overallStatus: Severity =
    counts.error > 0 ? "error" : counts.warning > 0 ? "warning" : "pass";

  return { execution: exec, fields, counts, overallStatus };
}

/** Analyze a batch of executions */
export function analyzeAllExecutions(executions: ProjectExecution[]): ExecutionAnalysis[] {
  return executions.map(analyzeExecution);
}
