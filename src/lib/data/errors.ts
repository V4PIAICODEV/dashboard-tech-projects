import type { MetadataItem, Severity } from "./types";

// Individual detector functions (not exported -- internal)

// D-07: Boolean false = error
function detectBoolean(item: MetadataItem): Severity {
  if (item.value === true) return "pass";
  return "error"; // false, null, undefined all = error (missing data)
}

// D-05/D-08: Empty/null/whitespace text = error
function detectText(item: MetadataItem): Severity {
  if (item.value === null || item.value === undefined) return "error";
  if (typeof item.value === "string" && item.value.trim() === "") return "error";
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
  enum: detectEnum,
};

/** Detect severity for a single metadata field by dispatching on item.type */
export function detectFieldSeverity(item: MetadataItem): Severity {
  const detect = DETECTOR[item.type];
  if (!detect) return "pass"; // graceful fallback for truly unknown types
  return detect(item);
}
