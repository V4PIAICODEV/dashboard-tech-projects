import { describe, it, expect } from "vitest";
import { applyStatusFilter } from "@/pages/ProjectDetailPage";
import type { ExecutionAnalysis, Severity } from "@/lib/data/types";

function makeAnalysis(status: Severity): ExecutionAnalysis {
  return {
    execution: {
      projectId: "test",
      projectName: "Test",
      webhookGroup: 1,
      date: "2026-03-25",
      identifiers: {},
      metadata: [],
      rawData: null,
    },
    fields: [],
    counts: { error: status === "error" ? 1 : 0, warning: status === "warning" ? 1 : 0, pass: status === "pass" ? 1 : 0, total: 1 },
    overallStatus: status,
  };
}

describe("applyStatusFilter", () => {
  const pass = makeAnalysis("pass");
  const error = makeAnalysis("error");
  const warning = makeAnalysis("warning");
  const all = [pass, error, warning];

  it("todos returns all analyses", () => {
    expect(applyStatusFilter(all, "todos")).toHaveLength(3);
  });

  it("falhas returns only error analyses", () => {
    const result = applyStatusFilter(all, "falhas");
    expect(result).toHaveLength(1);
    expect(result[0].overallStatus).toBe("error");
  });

  it("sucessos returns only pass analyses", () => {
    const result = applyStatusFilter(all, "sucessos");
    expect(result).toHaveLength(1);
    expect(result[0].overallStatus).toBe("pass");
  });

  it("empty input returns empty array", () => {
    expect(applyStatusFilter([], "falhas")).toHaveLength(0);
  });
});
