import type { ProjectExecution, WebhookGroupResult } from "./types";
import { WEBHOOK_URLS } from "@/lib/config";
import { adaptGrupo1, adaptGrupo2, adaptGrupo3, adaptGrupo4 } from "./adapters";

/**
 * Generic fetcher factory. Produces a function that:
 * 1. Fetches from the webhook URL
 * 2. Validates HTTP status
 * 3. Validates response is an array
 * 4. Passes through the group-specific adapter
 * 5. Returns a WebhookGroupResult (never throws)
 *
 * Error isolation: every failure is caught and returned in the result's error
 * field. This is critical for partial failure isolation (DATA-10) -- one group
 * failing must not prevent the other three from loading.
 */
function createFetcher(
  group: 1 | 2 | 3 | 4,
  getUrl: () => string,
  adapt: (raw: unknown[]) => ProjectExecution[]
): () => Promise<WebhookGroupResult> {
  return async (): Promise<WebhookGroupResult> => {
    try {
      const url = getUrl();
      const response = await fetch(url);

      if (!response.ok) {
        return {
          group,
          executions: [],
          error: new Error(
            `Webhook grupo ${group} returned HTTP ${response.status}`
          ),
          lastFetched: null,
        };
      }

      const json: unknown = await response.json();

      // Support both plain array and { data: [...] } wrapper (n8n default format)
      const rawArray = Array.isArray(json)
        ? json
        : Array.isArray((json as Record<string, unknown>)?.data)
          ? (json as Record<string, unknown>).data as unknown[]
          : null;

      if (!rawArray) {
        return {
          group,
          executions: [],
          error: new Error(
            `Webhook grupo ${group}: expected array or {data: array}, got ${typeof json}`
          ),
          lastFetched: null,
        };
      }

      const executions = adapt(rawArray);

      return {
        group,
        executions,
        error: null,
        lastFetched: new Date(),
      };
    } catch (err) {
      return {
        group,
        executions: [],
        error: err instanceof Error ? err : new Error(String(err)),
        lastFetched: null,
      };
    }
  };
}

/** Fetch and adapt Grupo 1 (Handover Aquisicao, Handover Monetizacao, BANT) */
export const fetchGrupo1 = createFetcher(
  1,
  () => WEBHOOK_URLS.grupo1,
  adaptGrupo1
);

/** Fetch and adapt Grupo 2 (Sales Coach AI, Account Coach AI) */
export const fetchGrupo2 = createFetcher(
  2,
  () => WEBHOOK_URLS.grupo2,
  adaptGrupo2
);

/** Fetch and adapt Grupo 3 (Auditoria do Saber) */
export const fetchGrupo3 = createFetcher(
  3,
  () => WEBHOOK_URLS.grupo3,
  adaptGrupo3
);

/** Fetch and adapt Grupo 4 (Banco de Dados de Midia) */
export const fetchGrupo4 = createFetcher(
  4,
  () => WEBHOOK_URLS.grupo4,
  adaptGrupo4
);
