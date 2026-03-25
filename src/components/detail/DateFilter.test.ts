import { describe, it, expect } from "vitest";
import { applyDateFilter } from "@/pages/ProjectDetailPage";
import type { ExecutionAnalysis } from "@/lib/data/types";

// Minimal ExecutionAnalysis factory for tests
function makeAnalysis(date: string): ExecutionAnalysis {
  return {
    execution: {
      projectId: "test",
      projectName: "Test",
      webhookGroup: 1,
      date,
      identifiers: {},
      metadata: [],
      rawData: null,
    },
    fields: [],
    counts: { error: 0, warning: 0, pass: 0, total: 0 },
    overallStatus: "pass",
  };
}

// Helper: today's date as "YYYY-MM-DD"
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Helper: date N days ago as "YYYY-MM-DD"
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

describe("applyDateFilter", () => {
  const today = makeAnalysis(todayStr());
  const threeDaysAgo = makeAnalysis(daysAgo(3));
  const tenDaysAgo = makeAnalysis(daysAgo(10));
  const fortyDaysAgo = makeAnalysis(daysAgo(40));
  const allAnalyses = [today, threeDaysAgo, tenDaysAgo, fortyDaysAgo];

  it("tudo returns all analyses", () => {
    const result = applyDateFilter(allAnalyses, { mode: "quick", preset: "tudo" });
    expect(result).toHaveLength(4);
  });

  it("hoje returns only today", () => {
    const result = applyDateFilter(allAnalyses, { mode: "quick", preset: "hoje" });
    expect(result).toHaveLength(1);
    expect(result[0].execution.date).toBe(todayStr());
  });

  it("7dias returns today + 3 days ago (within range), excludes 10 days ago", () => {
    const result = applyDateFilter(allAnalyses, { mode: "quick", preset: "7dias" });
    expect(result).toHaveLength(2);
    expect(result.some((a) => a.execution.date === todayStr())).toBe(true);
    expect(result.some((a) => a.execution.date === daysAgo(3))).toBe(true);
  });

  it("30dias returns today + 3 days ago + 10 days ago, excludes 40 days ago", () => {
    const result = applyDateFilter(allAnalyses, { mode: "quick", preset: "30dias" });
    expect(result).toHaveLength(3);
    expect(result.some((a) => a.execution.date === daysAgo(40))).toBe(false);
  });

  it("range mode filters to the specified interval", () => {
    const from = new Date(daysAgo(5) + "T00:00:00");
    const to = new Date(daysAgo(1) + "T23:59:59");
    const result = applyDateFilter(allAnalyses, { mode: "range", from, to });
    // Should include 3 days ago, exclude today and 10+ days ago
    expect(result.some((a) => a.execution.date === daysAgo(3))).toBe(true);
    expect(result.some((a) => a.execution.date === todayStr())).toBe(false);
    expect(result.some((a) => a.execution.date === daysAgo(10))).toBe(false);
  });

  it("empty input returns empty array for any filter", () => {
    expect(applyDateFilter([], { mode: "quick", preset: "hoje" })).toHaveLength(0);
  });
});
