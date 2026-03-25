import { describe, it, expect } from "vitest";
import { detectFieldSeverity } from "./errors";
import type { MetadataItem } from "./types";

describe("detectFieldSeverity", () => {
  // -- Boolean fields (DATA-03) --

  describe("boolean fields (DATA-03)", () => {
    it("returns error for boolean false", () => {
      const item: MetadataItem = {
        key: "workspace_ekyte",
        label: "Workspace Ekyte criado?",
        value: false,
        type: "boolean",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns pass for boolean true", () => {
      const item: MetadataItem = {
        key: "workspace_ekyte",
        label: "Workspace Ekyte criado?",
        value: true,
        type: "boolean",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns error for boolean null (missing data)", () => {
      const item: MetadataItem = {
        key: "projeto_atribuido",
        label: "Projeto atribuido?",
        value: null,
        type: "boolean",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });
  });

  // -- Text fields (DATA-04) --

  describe("text fields (DATA-04)", () => {
    it("returns error for empty string", () => {
      const item: MetadataItem = {
        key: "resumo",
        label: "Resumo",
        value: "",
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns error for null", () => {
      const item: MetadataItem = {
        key: "resumo",
        label: "Resumo",
        value: null,
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns pass for non-empty text", () => {
      const item: MetadataItem = {
        key: "resumo",
        label: "Resumo",
        value: "Some analysis text",
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns error for whitespace-only string (pitfall 1)", () => {
      const item: MetadataItem = {
        key: "pontos_cegos",
        label: "Pontos Cegos",
        value: "   ",
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });
  });

  // -- Healthscore fields (DATA-05) --

  describe("healthscore fields (DATA-05)", () => {
    it("returns error for critical (D-01)", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: "critical",
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns error for danger (D-02)", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: "danger",
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns warning for care (D-03)", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: "care",
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("warning");
    });

    it("returns pass for safe (D-04)", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: "safe",
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns error for case-insensitive Critical (pitfall 3)", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: "Critical",
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns error for null healthscore", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: null,
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns error for unknown healthscore value", () => {
      const item: MetadataItem = {
        key: "healthscore",
        label: "Healthscore",
        value: "unknown_value",
        type: "healthscore",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });
  });

  // -- Status-array fields (DATA-06) --

  describe("status-array fields (DATA-06)", () => {
    it("returns error for falhas > 0", () => {
      const item: MetadataItem = {
        key: "falhas",
        label: "Falhas",
        value: 3,
        type: "status-array",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns pass for falhas === 0 (pitfall 4)", () => {
      const item: MetadataItem = {
        key: "falhas",
        label: "Falhas",
        value: 0,
        type: "status-array",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns pass for sucessos (non-falhas is informational)", () => {
      const item: MetadataItem = {
        key: "sucessos",
        label: "Sucessos",
        value: 5,
        type: "status-array",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns error for null falhas", () => {
      const item: MetadataItem = {
        key: "falhas",
        label: "Falhas",
        value: null,
        type: "status-array",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });
  });

  // -- Enum fields --

  describe("enum fields", () => {
    it("returns pass for enum type (placeholder handler)", () => {
      const item: MetadataItem = {
        key: "some_enum",
        label: "Some Enum",
        value: "option_a",
        type: "enum",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });
  });

  // -- Unknown type fallback --

  describe("unknown type fallback", () => {
    it("does not crash and returns pass for unrecognized type", () => {
      const item = {
        key: "mystery",
        label: "Mystery Field",
        value: "something",
        type: "totally-unknown" as MetadataItem["type"],
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });
  });
});
