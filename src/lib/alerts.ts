import type { ExecutionAnalysis } from "@/lib/data/types";
import { PROJECT_NAMES } from "@/lib/config";

const ALERT_WEBHOOK_URL =
  "https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook/387d73bd-d711-435d-bf12-60776329f5b7";

const STORAGE_KEY_ALERTED = "dashboard_alerted_executions";
const STORAGE_KEY_ENABLED = "dashboard_alerts_enabled";
const STORAGE_KEY_PROJECT_TOGGLES = "dashboard_alerts_projects";

/** Get set of already-alerted execution keys */
function getAlertedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTED);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

/** Save alerted execution keys */
function saveAlertedSet(set: Set<string>) {
  // Keep only last 1000 entries to prevent unbounded growth
  const arr = Array.from(set);
  const trimmed = arr.length > 1000 ? arr.slice(arr.length - 1000) : arr;
  localStorage.setItem(STORAGE_KEY_ALERTED, JSON.stringify(trimmed));
}

/**
 * Stable unique key for an execution.
 * Uses ALL identifier fields sorted alphabetically to prevent key drift
 * when webhook returns fields in different order or adds new fields.
 */
function executionKey(analysis: ExecutionAnalysis): string {
  const exec = analysis.execution;
  const idParts = Object.entries(exec.identifiers)
    .filter(([, v]) => v != null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
  return `${exec.projectId}:${exec.date}:${idParts}`;
}

/** Get execution identifier for alert text */
function getAlertIdentifier(analysis: ExecutionAnalysis): string {
  const ids = analysis.execution.identifiers;
  if (ids.id_kommo) return `Kommo #${ids.id_kommo}`;
  if (ids.email) return ids.email;
  if (ids.client_name) return ids.client_name;
  return analysis.execution.date;
}

/** Check if alerts are globally enabled */
export function isAlertsEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY_ENABLED) !== "false";
}

/** Toggle global alerts on/off */
export function setAlertsEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
}

/** Check if alerts are enabled for a specific project */
export function isProjectAlertEnabled(projectId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECT_TOGGLES);
    if (!raw) return true; // enabled by default
    const toggles = JSON.parse(raw) as Record<string, boolean>;
    return toggles[projectId] !== false;
  } catch {
    return true;
  }
}

/** Toggle alerts for a specific project */
export function setProjectAlertEnabled(projectId: string, enabled: boolean) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECT_TOGGLES);
    const toggles = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    toggles[projectId] = enabled;
    localStorage.setItem(STORAGE_KEY_PROJECT_TOGGLES, JSON.stringify(toggles));
  } catch {
    // ignore
  }
}

/** Get status label from overall status */
function getStatusLabel(status: string): string {
  switch (status) {
    case "error":
      return "Critico";
    case "warning":
      return "Atencao";
    default:
      return "Sucesso";
  }
}

/** Send alert for a single execution */
async function sendAlert(analysis: ExecutionAnalysis): Promise<boolean> {
  const exec = analysis.execution;
  const projectName = PROJECT_NAMES[exec.projectId] ?? exec.projectName;
  const identifier = getAlertIdentifier(analysis);
  const errorCount = analysis.counts.error;
  const status = getStatusLabel(analysis.overallStatus);

  const text = [
    "\u26a0\ufe0f *Alerta de Erro \u2014 Dashboard Tech Projects*",
    "",
    `\ud83d\udd34 *Projeto:* ${projectName}`,
    `\ud83d\udce7 *Execucao:* ${identifier}`,
    `\u274c *Erros detectados:* ${errorCount}`,
    `\ud83d\udd50 *Horario:* ${exec.date}`,
    `\ud83d\udcca *Status:* ${status}`,
    "",
    "Acesse o dashboard para mais detalhes.",
  ].join("\n");

  try {
    const response = await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: { text } }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Process analyses and send alerts for new errors.
 * Called after each data fetch cycle.
 * Only sends alerts for executions not previously alerted.
 */
export async function processAlerts(
  analyses: ExecutionAnalysis[]
): Promise<number> {
  if (!isAlertsEnabled()) return 0;

  const alerted = getAlertedSet();
  let sentCount = 0;

  for (const analysis of analyses) {
    if (analysis.overallStatus !== "error") continue;

    // Check project-level toggle
    if (!isProjectAlertEnabled(analysis.execution.projectId)) continue;

    const key = executionKey(analysis);
    if (alerted.has(key)) continue;

    const success = await sendAlert(analysis);
    if (success) {
      alerted.add(key);
      sentCount++;
    }
  }

  saveAlertedSet(alerted);
  return sentCount;
}
