import { z } from "zod";

/**
 * Normalize boolean strings from n8n webhooks ("true", "false", "TRUE", "FALSE")
 * into actual JS booleans. This is critical because the string "false" is truthy in JS.
 *
 * - null/undefined/empty -> null
 * - already boolean -> passthrough
 * - "true"/"TRUE"/"false"/"FALSE" -> boolean via z.stringbool()
 * - other strings -> returned as-is (text field, not boolean)
 */
export function normalizeBoolean(
  value: unknown
): boolean | string | null {
  if (value === null || value === undefined) return null;
  if (value === "") return null;
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const result = z.stringbool().safeParse(value);
    if (result.success) return result.data;
    return value;
  }

  return null;
}

/**
 * Normalize date strings. Handles:
 * - ISO-ish strings (YYYY-MM-DD) -> passthrough
 * - BR format (DD/MM/YYYY) -> converted to YYYY-MM-DD
 * - null/undefined/empty -> null
 */
export function normalizeDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" || value === "") return null;

  // BR format: DD/MM/YYYY
  const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  // Assume ISO-ish, passthrough
  return value;
}
