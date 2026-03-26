import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import {
  computeProjectHealth,
  sortByHealth,
  HEALTH_LABELS,
} from "@/lib/health";
import type { ExecutionAnalysis, Severity } from "@/lib/data/types";

// -- Test helper --

/** Today's date as YYYY-MM-DD, ensures tests don't become "inactive" */
const TODAY = format(new Date(), "yyyy-MM-dd");

function mockAnalysis(
  projectId: string,
  overallStatus: Severity,
  date: string = TODAY
): ExecutionAnalysis {
  return {
    execution: {
      projectId,
      projectName: "Test Project",
      webhookGroup: 1,
      date,
      identifiers: {},
      metadata: [],
      rawData: null,
    },
    fields: [],
    counts: {
      error: overallStatus === "error" ? 1 : 0,
      warning: overallStatus === "warning" ? 1 : 0,
      pass: overallStatus === "pass" ? 1 : 0,
      total: 1,
    },
    overallStatus,
  };
}

describe("computeProjectHealth", () => {
  it("returns inactive with 0 executions", () => {
    const result = computeProjectHealth("proj-1", "Empty Project", []);
    expect(result.errorRate).toBe(0);
    expect(result.status).toBe("inactive");
    expect(result.totalExecutions).toBe(0);
    expect(result.lastExecutionDate).toBeNull();
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
  });

  it("returns healthy with all passing recent executions", () => {
    const analyses = [
      mockAnalysis("proj-1", "pass", TODAY),
      mockAnalysis("proj-1", "pass", TODAY),
      mockAnalysis("proj-1", "pass", TODAY),
    ];
    const result = computeProjectHealth("proj-1", "All Pass", analyses);
    expect(result.errorRate).toBe(0);
    expect(result.status).toBe("healthy");
    expect(result.totalExecutions).toBe(3);
  });

  it("returns warning for errorRate 10% (1 error out of 10)", () => {
    const analyses = [
      mockAnalysis("proj-1", "error", TODAY),
      ...Array.from({ length: 9 }, () =>
        mockAnalysis("proj-1", "pass", TODAY)
      ),
    ];
    const result = computeProjectHealth("proj-1", "Low Error", analyses);
    expect(result.errorRate).toBe(10);
    expect(result.status).toBe("warning");
  });

  it("returns critical for errorRate 50% (5 errors out of 10)", () => {
    const analyses = [
      ...Array.from({ length: 5 }, () =>
        mockAnalysis("proj-1", "error", TODAY)
      ),
      ...Array.from({ length: 5 }, () =>
        mockAnalysis("proj-1", "pass", TODAY)
      ),
    ];
    const result = computeProjectHealth("proj-1", "High Error", analyses);
    expect(result.errorRate).toBe(50);
    expect(result.status).toBe("critical");
  });

  it("returns warning at the 30% boundary (3 errors out of 10)", () => {
    const analyses = [
      ...Array.from({ length: 3 }, () =>
        mockAnalysis("proj-1", "error", TODAY)
      ),
      ...Array.from({ length: 7 }, () =>
        mockAnalysis("proj-1", "pass", TODAY)
      ),
    ];
    const result = computeProjectHealth("proj-1", "Boundary", analyses);
    expect(result.errorRate).toBe(30);
    expect(result.status).toBe("warning");
  });

  it("filters executions by projectId — ignores other projects", () => {
    const analyses = [
      mockAnalysis("proj-1", "error", TODAY),
      mockAnalysis("proj-2", "error", TODAY),
      mockAnalysis("proj-1", "pass", TODAY),
    ];
    const result = computeProjectHealth("proj-1", "Filtered", analyses);
    expect(result.totalExecutions).toBe(2);
    expect(result.errorCount).toBe(1);
    // 1 error out of 2 = 50% -> critical
    expect(result.errorRate).toBe(50);
    expect(result.status).toBe("critical");
  });

  it("picks the most recent date as lastExecutionDate", () => {
    const analyses = [
      mockAnalysis("proj-1", "pass", "2026-03-15"),
      mockAnalysis("proj-1", "pass", TODAY),
      mockAnalysis("proj-1", "pass", "2026-03-10"),
    ];
    const result = computeProjectHealth("proj-1", "Date Check", analyses);
    expect(result.lastExecutionDate).toBe(TODAY);
  });

  it("counts warnings separately from errors", () => {
    const analyses = [
      mockAnalysis("proj-1", "error", TODAY),
      mockAnalysis("proj-1", "warning", TODAY),
      mockAnalysis("proj-1", "pass", TODAY),
    ];
    const result = computeProjectHealth("proj-1", "Mixed", analyses);
    expect(result.errorCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.totalExecutions).toBe(3);
  });

  it("returns inactive for projects with only old executions", () => {
    const analyses = [
      mockAnalysis("proj-1", "pass", "2025-01-01"),
      mockAnalysis("proj-1", "error", "2025-01-02"),
    ];
    const result = computeProjectHealth("proj-1", "Old Data", analyses);
    expect(result.status).toBe("inactive");
    expect(result.totalExecutions).toBe(2);
  });
});

describe("sortByHealth", () => {
  it("returns critical before warning before healthy", () => {
    const projects = [
      { projectId: "1", projectName: "Healthy", status: "healthy" as const, errorCount: 0, warningCount: 0, totalExecutions: 5, errorRate: 0, lastExecutionDate: null },
      { projectId: "2", projectName: "Critical", status: "critical" as const, errorCount: 3, warningCount: 0, totalExecutions: 5, errorRate: 60, lastExecutionDate: null },
      { projectId: "3", projectName: "Warning", status: "warning" as const, errorCount: 1, warningCount: 0, totalExecutions: 5, errorRate: 20, lastExecutionDate: null },
    ];
    const sorted = sortByHealth(projects);
    expect(sorted[0].status).toBe("critical");
    expect(sorted[1].status).toBe("warning");
    expect(sorted[2].status).toBe("healthy");
  });

  it("sorts alphabetically within the same status tier", () => {
    const projects = [
      { projectId: "1", projectName: "Zebra", status: "warning" as const, errorCount: 1, warningCount: 0, totalExecutions: 5, errorRate: 20, lastExecutionDate: null },
      { projectId: "2", projectName: "Alpha", status: "warning" as const, errorCount: 1, warningCount: 0, totalExecutions: 5, errorRate: 20, lastExecutionDate: null },
      { projectId: "3", projectName: "Midway", status: "warning" as const, errorCount: 1, warningCount: 0, totalExecutions: 5, errorRate: 20, lastExecutionDate: null },
    ];
    const sorted = sortByHealth(projects);
    expect(sorted[0].projectName).toBe("Alpha");
    expect(sorted[1].projectName).toBe("Midway");
    expect(sorted[2].projectName).toBe("Zebra");
  });
});

describe("HEALTH_LABELS", () => {
  it("maps all statuses to Portuguese labels", () => {
    expect(HEALTH_LABELS.healthy).toBe("Saudavel");
    expect(HEALTH_LABELS.warning).toBe("Atencao");
    expect(HEALTH_LABELS.critical).toBe("Critico");
    expect(HEALTH_LABELS.inactive).toBe("Inativo");
  });
});
