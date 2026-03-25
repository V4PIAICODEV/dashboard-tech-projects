/**
 * Unified type for a single execution across all 7 projects and 4 webhook groups.
 * Every adapter must produce this shape. Downstream code (error detection, UI) only
 * consumes this interface -- never raw webhook data.
 */
export interface ProjectExecution {
  projectId: string;
  projectName: string;
  webhookGroup: 1 | 2 | 3 | 4;
  date: string; // ISO-ish string from webhook (e.g. "2026-03-25")
  identifiers: Record<string, string>; // id_kommo, email, ekyte_id, client_name, etc.
  metadata: MetadataItem[];
  rawData: unknown; // preserve original for debugging
}

/**
 * A single field from an execution's metadado, normalized with a display label
 * and its data type. Used by error detection and field-level UI rendering.
 */
export interface MetadataItem {
  key: string;
  label: string; // Portuguese display label (e.g. "Workspace Ekyte criado?")
  value: string | boolean | number | null;
  type: "boolean" | "text" | "enum" | "healthscore" | "status-array";
}

/**
 * Result of fetching and adapting a single webhook group.
 * Used by useAllProjects() combine callback to aggregate per-group results.
 */
export interface WebhookGroupResult {
  group: 1 | 2 | 3 | 4;
  executions: ProjectExecution[];
  error: Error | null;
  lastFetched: Date | null;
}

/**
 * Aggregated result from all 4 webhook groups.
 * Returned by useAllProjects() hook.
 */
export interface AllProjectsResult {
  groups: WebhookGroupResult[];
  allExecutions: ProjectExecution[];
  isLoading: boolean;
  failedGroups: WebhookGroupResult[];
  successfulGroups: WebhookGroupResult[];
}
