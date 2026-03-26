import { describe, it, expect } from "vitest";
import { detectFieldSeverity, analyzeExecution, analyzeAllExecutions } from "./errors";
import type { MetadataItem, ProjectExecution } from "./types";

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

  describe("text fields (informational — always pass)", () => {
    it("returns pass for empty string (text fields are informational)", () => {
      const item: MetadataItem = {
        key: "resumo",
        label: "Resumo",
        value: "",
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns pass for null (text fields are informational)", () => {
      const item: MetadataItem = {
        key: "resumo",
        label: "Resumo",
        value: null,
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
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

    it("returns pass for whitespace-only string (text fields are informational)", () => {
      const item: MetadataItem = {
        key: "pontos_cegos",
        label: "Pontos Cegos",
        value: "   ",
        type: "text",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });
  });

  // -- Execution status fields --

  describe("execution-status fields", () => {
    it("returns pass for sucesso", () => {
      const item: MetadataItem = {
        key: "status",
        label: "Status",
        value: "sucesso",
        type: "execution-status",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns pass for Sucesso (case-insensitive)", () => {
      const item: MetadataItem = {
        key: "status",
        label: "Status",
        value: "Sucesso",
        type: "execution-status",
      };
      expect(detectFieldSeverity(item)).toBe("pass");
    });

    it("returns error for falha", () => {
      const item: MetadataItem = {
        key: "status",
        label: "Status",
        value: "falha",
        type: "execution-status",
      };
      expect(detectFieldSeverity(item)).toBe("error");
    });

    it("returns error for null status", () => {
      const item: MetadataItem = {
        key: "status",
        label: "Status",
        value: null,
        type: "execution-status",
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

// -- Aggregation Layer Tests (Plan 02) --

/** Helper: build a ProjectExecution fixture with given metadata */
function makeExecution(
  projectId: string,
  projectName: string,
  metadata: MetadataItem[]
): ProjectExecution {
  return {
    projectId,
    projectName,
    webhookGroup: 1,
    date: "2026-03-25",
    identifiers: {},
    metadata,
    rawData: {},
  };
}

describe("analyzeExecution (DATA-09)", () => {
  it("returns correct breakdown for Handover Aquisicao with 3 booleans (2 true, 1 false) and 1 filled text", () => {
    const exec = makeExecution("a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105", "Handover Aquisicao", [
      { key: "workspace_ekyte", label: "Workspace Ekyte criado?", value: true, type: "boolean" },
      { key: "grupo_gchat", label: "Grupo Gchat criado?", value: true, type: "boolean" },
      { key: "projeto_atribuido", label: "Projeto atribuido?", value: false, type: "boolean" },
      { key: "para_quem_atribuido", label: "Para quem foi atribuido?", value: "Maria", type: "text" },
    ]);

    const result = analyzeExecution(exec);

    expect(result.fields).toHaveLength(4);
    expect(result.counts.error).toBe(1);
    expect(result.counts.pass).toBe(3);
    expect(result.counts.warning).toBe(0);
    expect(result.counts.total).toBe(4);
    expect(result.overallStatus).toBe("error");
  });

  it("returns all-pass for BANT with 5 filled text fields", () => {
    const exec = makeExecution("1522051fa3035e2674272ea1cadccd66a5c0a5345a024528d2b99ac31292b710", "BANT", [
      { key: "possiveis_objecoes", label: "Possiveis Objecoes", value: "Price concern", type: "text" },
      { key: "pontos_cegos", label: "Pontos Cegos", value: "Timeline unclear", type: "text" },
      { key: "possiveis_solucoes", label: "Possiveis Solucoes/Ofertas a Apresentar", value: "Discount option", type: "text" },
      { key: "pontos_atencao", label: "Pontos de Atencao", value: "Budget constraint", type: "text" },
      { key: "proximos_passos", label: "Proximos Passos Sugeridos", value: "Follow-up call", type: "text" },
    ]);

    const result = analyzeExecution(exec);

    expect(result.counts.error).toBe(0);
    expect(result.counts.pass).toBe(5);
    expect(result.counts.total).toBe(5);
    expect(result.overallStatus).toBe("pass");
  });

  it("returns all-pass for BANT with 2 empty text fields (text is informational) and status sucesso", () => {
    const exec = makeExecution("1522051fa3035e2674272ea1cadccd66a5c0a5345a024528d2b99ac31292b710", "BANT", [
      { key: "possiveis_objecoes", label: "Possiveis Objecoes", value: "", type: "text" },
      { key: "pontos_cegos", label: "Pontos Cegos", value: null, type: "text" },
      { key: "possiveis_solucoes", label: "Possiveis Solucoes/Ofertas a Apresentar", value: "Discount option", type: "text" },
      { key: "pontos_atencao", label: "Pontos de Atencao", value: "Budget constraint", type: "text" },
      { key: "proximos_passos", label: "Proximos Passos Sugeridos", value: "Follow-up call", type: "text" },
      { key: "status", label: "Status", value: "sucesso", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);

    expect(result.counts.error).toBe(0);
    expect(result.counts.pass).toBe(6);
    expect(result.counts.total).toBe(6);
    expect(result.overallStatus).toBe("pass");
  });

  it("returns warning for Account Coach with healthscore care (status-driven mode)", () => {
    const exec = makeExecution("81034cbce6a2c1e0fe1d7a1fac995ada04d626a46a4d45dd1afd4ec50415f61f", "Account Coach AI", [
      { key: "resumo", label: "Resumo", value: "Client meeting summary", type: "text" },
      { key: "categoria_primaria_conteudo", label: "Categoria Primaria do Conteudo", value: "Performance", type: "text" },
      { key: "healthscore", label: "Healthscore", value: "care", type: "healthscore" },
      { key: "combinados", label: "Combinados", value: "Weekly check-in", type: "text" },
      { key: "status", label: "Status", value: "sucesso", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);

    // healthscore "care" = warning, status "sucesso" = pass, text fields = pass (status-driven)
    expect(result.counts.warning).toBe(1);
    expect(result.counts.pass).toBe(4);
    expect(result.counts.error).toBe(0);
    expect(result.counts.total).toBe(5);
    expect(result.overallStatus).toBe("warning");
  });

  it("returns pass for Midia with status Sucesso", () => {
    const exec = makeExecution("7fd3b921c8244a39bd0be982d77113b74f47fd9da49c0060d54f1afff1eb1058", "Banco de Dados de Midia", [
      { key: "status", label: "Status", value: "Sucesso", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);

    expect(result.counts.error).toBe(0);
    expect(result.counts.pass).toBe(1);
    expect(result.counts.total).toBe(1);
    expect(result.overallStatus).toBe("pass");
  });

  it("returns error for Midia with status Falha", () => {
    const exec = makeExecution("7fd3b921c8244a39bd0be982d77113b74f47fd9da49c0060d54f1afff1eb1058", "Banco de Dados de Midia", [
      { key: "status", label: "Status", value: "Falha", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);

    expect(result.counts.error).toBe(1);
    expect(result.counts.pass).toBe(0);
    expect(result.counts.total).toBe(1);
    expect(result.overallStatus).toBe("error");
  });

  it("returns zero counts and pass for execution with empty metadata", () => {
    const exec = makeExecution("a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105", "Handover Aquisicao", []);

    const result = analyzeExecution(exec);

    expect(result.fields).toEqual([]);
    expect(result.counts.error).toBe(0);
    expect(result.counts.warning).toBe(0);
    expect(result.counts.pass).toBe(0);
    expect(result.counts.total).toBe(0);
    expect(result.overallStatus).toBe("pass");
  });

  it("preserves FieldResult shape with key, label, value, type, severity", () => {
    const exec = makeExecution("1522051fa3035e2674272ea1cadccd66a5c0a5345a024528d2b99ac31292b710", "BANT", [
      { key: "pontos_cegos", label: "Pontos Cegos", value: "Some text", type: "text" },
      { key: "status", label: "Status", value: "falha", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);
    const field = result.fields[0];

    expect(field.key).toBe("pontos_cegos");
    expect(field.label).toBe("Pontos Cegos");
    expect(field.value).toBe("Some text");
    expect(field.type).toBe("text");
    expect(field.severity).toBe("pass");

    // status field determines the error
    const statusField = result.fields[1];
    expect(statusField.severity).toBe("error");
    expect(result.overallStatus).toBe("error");
  });

  it("preserves the same execution object reference", () => {
    const exec = makeExecution("a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105", "Handover Aquisicao", []);

    const result = analyzeExecution(exec);

    expect(result.execution).toBe(exec);
  });

  it("status-driven mode: booleans become informational when status field exists", () => {
    const exec = makeExecution("9902ec091d87e1125c0ee9f258cb3853cfe74bdf751d1568b017bb01a9d9ddba", "Sales Coach AI", [
      { key: "spiced_aplicado", label: "SPICED aplicado?", value: false, type: "boolean" },
      { key: "pediu_indicacao", label: "Pediu indicacao?", value: false, type: "boolean" },
      { key: "resumo_reuniao", label: "Resumo da Reuniao", value: "Summary", type: "text" },
      { key: "status", label: "Status", value: "sucesso", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);

    // Status-driven: booleans + text = pass, status "sucesso" = pass
    expect(result.counts.error).toBe(0);
    expect(result.counts.pass).toBe(4);
    expect(result.overallStatus).toBe("pass");
  });

  it("per-field mode: booleans still count errors when no status field (Handover)", () => {
    const exec = makeExecution("a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105", "Handover Aquisicao", [
      { key: "workspace_ekyte", label: "Workspace Ekyte criado?", value: false, type: "boolean" },
      { key: "grupo_gchat", label: "Grupo Gchat criado?", value: true, type: "boolean" },
    ]);

    const result = analyzeExecution(exec);

    // Per-field: boolean false = error
    expect(result.counts.error).toBe(1);
    expect(result.counts.pass).toBe(1);
    expect(result.overallStatus).toBe("error");
  });

  it("counts are consistent: error + warning + pass === total", () => {
    const exec = makeExecution("81034cbce6a2c1e0fe1d7a1fac995ada04d626a46a4d45dd1afd4ec50415f61f", "Account Coach AI", [
      { key: "resumo", label: "Resumo", value: "", type: "text" },
      { key: "healthscore", label: "Healthscore", value: "care", type: "healthscore" },
      { key: "combinados", label: "Combinados", value: "Weekly sync", type: "text" },
      { key: "status", label: "Status", value: "falha", type: "execution-status" },
    ]);

    const result = analyzeExecution(exec);

    expect(result.counts.error + result.counts.warning + result.counts.pass).toBe(result.counts.total);
    expect(result.counts.error).toBe(1);
    expect(result.counts.warning).toBe(1);
    expect(result.counts.pass).toBe(2);
    expect(result.counts.total).toBe(4);
    expect(result.overallStatus).toBe("error");
  });
});

describe("analyzeAllExecutions", () => {
  it("processes a batch of 3 executions and returns ExecutionAnalysis[] of length 3", () => {
    const executions: ProjectExecution[] = [
      makeExecution("a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105", "Handover Aquisicao", [
        { key: "workspace_ekyte", label: "Workspace Ekyte criado?", value: true, type: "boolean" },
      ]),
      makeExecution("1522051fa3035e2674272ea1cadccd66a5c0a5345a024528d2b99ac31292b710", "BANT", [
        { key: "pontos_cegos", label: "Pontos Cegos", value: "", type: "text" },
        { key: "status", label: "Status", value: "falha", type: "execution-status" },
      ]),
      makeExecution("7fd3b921c8244a39bd0be982d77113b74f47fd9da49c0060d54f1afff1eb1058", "Banco de Dados de Midia", [
        { key: "status", label: "Status", value: "Sucesso", type: "execution-status" },
      ]),
    ];

    const results = analyzeAllExecutions(executions);

    expect(results).toHaveLength(3);
    expect(results[0].overallStatus).toBe("pass");
    expect(results[0].counts.pass).toBe(1);
    expect(results[1].overallStatus).toBe("error");
    expect(results[1].counts.error).toBe(1);
    expect(results[2].overallStatus).toBe("pass");
    expect(results[2].counts.pass).toBe(1);
  });

  it("returns empty array for empty input", () => {
    const results = analyzeAllExecutions([]);
    expect(results).toEqual([]);
  });

  it("each item in batch has correct counts and overallStatus", () => {
    const executions: ProjectExecution[] = [
      makeExecution("81034cbce6a2c1e0fe1d7a1fac995ada04d626a46a4d45dd1afd4ec50415f61f", "Account Coach AI", [
        { key: "healthscore", label: "Healthscore", value: "care", type: "healthscore" },
        { key: "resumo", label: "Resumo", value: "Summary text", type: "text" },
        { key: "status", label: "Status", value: "sucesso", type: "execution-status" },
      ]),
      makeExecution("a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105", "Handover Aquisicao", [
        { key: "workspace_ekyte", label: "Workspace Ekyte criado?", value: false, type: "boolean" },
        { key: "grupo_gchat", label: "Grupo Gchat criado?", value: false, type: "boolean" },
      ]),
    ];

    const results = analyzeAllExecutions(executions);

    // Account Coach: status-driven — healthscore care=warning, text+status=pass
    expect(results[0].counts).toEqual({ error: 0, warning: 1, pass: 2, total: 3 });
    expect(results[0].overallStatus).toBe("warning");
    // Handover: per-field — 2 boolean false = 2 errors
    expect(results[1].counts).toEqual({ error: 2, warning: 0, pass: 0, total: 2 });
    expect(results[1].overallStatus).toBe("error");
  });
});
