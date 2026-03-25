import { describe, it, expect } from "vitest";
import { normalizeBoolean, normalizeDate } from "./normalizers";

describe("normalizeBoolean", () => {
  it('converts "true" to true', () => {
    expect(normalizeBoolean("true")).toBe(true);
  });

  it('converts "false" to false (critical: "false" string is truthy in JS)', () => {
    expect(normalizeBoolean("false")).toBe(false);
  });

  it('converts "TRUE" to true', () => {
    expect(normalizeBoolean("TRUE")).toBe(true);
  });

  it('converts "FALSE" to false', () => {
    expect(normalizeBoolean("FALSE")).toBe(false);
  });

  it("passes through boolean true", () => {
    expect(normalizeBoolean(true)).toBe(true);
  });

  it("passes through boolean false", () => {
    expect(normalizeBoolean(false)).toBe(false);
  });

  it("returns null for null", () => {
    expect(normalizeBoolean(null)).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(normalizeBoolean(undefined)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(normalizeBoolean("")).toBe(null);
  });

  it("returns non-boolean string as-is", () => {
    expect(normalizeBoolean("random text")).toBe("random text");
  });

  it("returns a date-like string as-is", () => {
    expect(normalizeBoolean("2026-03-25")).toBe("2026-03-25");
  });
});

describe("normalizeDate", () => {
  it("passes through ISO-ish date string", () => {
    expect(normalizeDate("2026-03-25")).toBe("2026-03-25");
  });

  it("converts BR format DD/MM/YYYY to YYYY-MM-DD", () => {
    expect(normalizeDate("25/03/2026")).toBe("2026-03-25");
  });

  it("returns null for null", () => {
    expect(normalizeDate(null)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(normalizeDate("")).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(normalizeDate(undefined)).toBe(null);
  });
});
