import { describe, it, expect } from "vitest";
import {
  adaptGrupo1,
  adaptGrupo2,
  adaptGrupo3,
  adaptGrupo4,
} from "./adapters";
import type { ProjectExecution, MetadataItem } from "./types";

// -- Test fixtures --

const validGrupo1Handover = {
  project_id: "a6eb735f",
  data: "2026-03-25",
  id_kommo: "12345",
  status: "completed",
  metadado: {
    workspace_ekyte: "true",
    grupo_gchat: "false",
    grupo_whatsapp: "true",
    pastas_drive: "false",
    notificacao_gerente: "true",
    notificacao_financeiro: "false",
    notificacao_aquisicao: "true",
    projeto_atribuido: "true",
    para_quem_atribuido: "Maria Silva",
    quando_atribuido: "2026-03-20",
    task_financeiro: "true",
    task_operacao: "false",
    coordenador_gchat: "true",
    coordenador_whatsapp: "false",
  },
};

const validGrupo1Bant = {
  project_id: "1522051f",
  data: "2026-03-25",
  id_kommo: "67890",
  status: "completed",
  metadado: {
    possiveis_objecoes: "Cliente preocupado com preco",
    pontos_cegos: "Nao mencionou orcamento",
    possiveis_solucoes: "Oferecer plano starter",
    pontos_atencao: "Contrato vence em abril",
    proximos_passos: "Agendar reuniao de follow-up",
  },
};

const validGrupo2SalesCoach = {
  project_id: "9902ec09",
  data: "2026-03-25",
  tag: "call-review",
  email: "vendedor@empresa.com",
  score: "85",
  metadado: {
    resumo_reuniao: "Reuniao sobre plano enterprise",
    spiced_aplicado: "true",
    spiced_observacoes: "Bem aplicado no pitch",
    produtos_oferecidos: "Enterprise, Pro",
    pediu_indicacao: "false",
    indicacao_observacoes: "",
  },
};

const validGrupo2AccountCoach = {
  project_id: "81034bbc",
  data: "2026-03-25",
  tag: "account-review",
  email: "gerente@empresa.com",
  score: "72",
  metadado: {
    resumo: "Revisao trimestral da conta",
    categoria_primaria_conteudo: "Alinhamento",
    categoria_secundaria_conteudo: "Alinhamento Operacional",
    healthscore: "safe",
    justificativa_healthscore: "Conta estavel, sem riscos",
    oportunidade_monetizacao: "Upsell para plano Pro",
    combinados: "Enviar proposta ate sexta",
    plano_de_acao_sugerido: "Agendar revisao mensal",
  },
};

const validGrupo3 = {
  project_id: "ddf44dbe",
  data: "2026-03-25",
  id_kommo: "11111",
  status_id: "42",
  fase: "Producao",
  status: "Em andamento",
  metadado: {
    resumo: "Auditoria do conteudo de marco",
    avaliacao_conteudo: "Conteudo alinhado com a estrategia",
    ortografia_adequada: "Sim, sem erros encontrados",
    checklist: "5/5 itens completos",
    oportunidades: "Explorar formato de video curto",
    healthscore: "care",
    justificativa_healthscore: "Melhorar frequencia de publicacao",
  },
};

const validGrupo4 = {
  project_id: "7fd3b921",
  date: "2026-03-25",
  client_name: "Cliente ABC",
  ekyte_id: "ek-001",
  account_id: "acc-001",
  type: "instagram",
  status: ["Sucessos: 5", "Falhas: 0"],
};

// -- Helper to find metadata item by key --
function findMeta(
  metadata: MetadataItem[],
  key: string
): MetadataItem | undefined {
  return metadata.find((m) => m.key === key);
}

// -- adaptGrupo1 Tests --

describe("adaptGrupo1", () => {
  it("produces ProjectExecution[] with correct projectId, projectName, webhookGroup", () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    expect(result).toHaveLength(1);
    expect(result[0].projectId).toBe("a6eb735f");
    expect(result[0].projectName).toBe("Handover Aquisicao");
    expect(result[0].webhookGroup).toBe(1);
  });

  it("sets identifiers with id_kommo", () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    expect(result[0].identifiers).toEqual({ id_kommo: "12345" });
  });

  it("applies Portuguese labels from FIELD_LABELS", () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    const meta = findMeta(result[0].metadata, "workspace_ekyte");
    expect(meta?.label).toBe("Workspace Ekyte criado?");
  });

  it('normalizes boolean string "false" to boolean false in metadata', () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    const grupGchat = findMeta(result[0].metadata, "grupo_gchat");
    expect(grupGchat?.value).toBe(false);
    expect(grupGchat?.type).toBe("boolean");
  });

  it('normalizes boolean string "true" to boolean true in metadata', () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    const workspace = findMeta(result[0].metadata, "workspace_ekyte");
    expect(workspace?.value).toBe(true);
    expect(workspace?.type).toBe("boolean");
  });

  it("classifies text fields as type text", () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    const paraQuem = findMeta(result[0].metadata, "para_quem_atribuido");
    expect(paraQuem?.type).toBe("text");
    expect(paraQuem?.value).toBe("Maria Silva");
  });

  it("adapts BANT data with all text metadata", () => {
    const result = adaptGrupo1([validGrupo1Bant]);
    expect(result[0].projectId).toBe("1522051f");
    expect(result[0].projectName).toBe("BANT");

    // All BANT fields are text
    for (const item of result[0].metadata) {
      expect(item.type).toBe("text");
    }
  });

  it("handles unknown project_id with fallback name and empty labels", () => {
    const unknownProject = {
      project_id: "unknown-id",
      data: "2026-03-25",
      id_kommo: "99999",
      status: "completed",
      metadado: { campo_x: "valor" },
    };
    const result = adaptGrupo1([unknownProject]);
    expect(result[0].projectId).toBe("unknown-id");
    expect(result[0].projectName).toBe("unknown-id");
    // Label falls back to raw key
    const campoX = findMeta(result[0].metadata, "campo_x");
    expect(campoX?.label).toBe("campo_x");
  });

  it("returns empty array for empty input", () => {
    const result = adaptGrupo1([]);
    expect(result).toEqual([]);
  });

  it("preserves rawData as the original input object", () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    expect(result[0].rawData).toBe(validGrupo1Handover);
  });

  it("sets the date field from data property", () => {
    const result = adaptGrupo1([validGrupo1Handover]);
    expect(result[0].date).toBe("2026-03-25");
  });
});

// -- adaptGrupo2 Tests --

describe("adaptGrupo2", () => {
  it("produces ProjectExecution with email in identifiers", () => {
    const result = adaptGrupo2([validGrupo2SalesCoach]);
    expect(result[0].identifiers.email).toBe("vendedor@empresa.com");
    expect(result[0].identifiers.tag).toBe("call-review");
  });

  it('normalizes spiced_aplicado="true" to boolean true', () => {
    const result = adaptGrupo2([validGrupo2SalesCoach]);
    const spiced = findMeta(result[0].metadata, "spiced_aplicado");
    expect(spiced?.value).toBe(true);
    expect(spiced?.type).toBe("boolean");
  });

  it('normalizes pediu_indicacao="false" to boolean false', () => {
    const result = adaptGrupo2([validGrupo2SalesCoach]);
    const pediu = findMeta(result[0].metadata, "pediu_indicacao");
    expect(pediu?.value).toBe(false);
    expect(pediu?.type).toBe("boolean");
  });

  it("classifies resumo_reuniao as text", () => {
    const result = adaptGrupo2([validGrupo2SalesCoach]);
    const resumo = findMeta(result[0].metadata, "resumo_reuniao");
    expect(resumo?.type).toBe("text");
    expect(resumo?.value).toBe("Reuniao sobre plano enterprise");
  });

  it("classifies Account Coach healthscore as type healthscore", () => {
    const result = adaptGrupo2([validGrupo2AccountCoach]);
    const hs = findMeta(result[0].metadata, "healthscore");
    expect(hs?.type).toBe("healthscore");
    expect(hs?.value).toBe("safe");
  });

  it("includes all 8 Account Coach metadata fields", () => {
    const result = adaptGrupo2([validGrupo2AccountCoach]);
    expect(result[0].metadata).toHaveLength(8);
  });

  it("preserves rawData", () => {
    const result = adaptGrupo2([validGrupo2SalesCoach]);
    expect(result[0].rawData).toBe(validGrupo2SalesCoach);
  });

  it("throws on invalid data (Zod validation)", () => {
    const invalid = { project_id: "test" }; // missing required fields
    expect(() => adaptGrupo2([invalid])).toThrow();
  });
});

// -- adaptGrupo3 Tests --

describe("adaptGrupo3", () => {
  it("produces ProjectExecution with id_kommo in identifiers", () => {
    const result = adaptGrupo3([validGrupo3]);
    expect(result[0].identifiers).toEqual({ id_kommo: "11111" });
  });

  it("sets webhookGroup to 3", () => {
    const result = adaptGrupo3([validGrupo3]);
    expect(result[0].webhookGroup).toBe(3);
  });

  it("classifies healthscore field as type healthscore", () => {
    const result = adaptGrupo3([validGrupo3]);
    const hs = findMeta(result[0].metadata, "healthscore");
    expect(hs?.type).toBe("healthscore");
    expect(hs?.value).toBe("care");
  });

  it("classifies all other fields as text", () => {
    const result = adaptGrupo3([validGrupo3]);
    const nonHealthscore = result[0].metadata.filter(
      (m) => m.key !== "healthscore"
    );
    for (const item of nonHealthscore) {
      expect(item.type).toBe("text");
    }
  });

  it("preserves rawData", () => {
    const result = adaptGrupo3([validGrupo3]);
    expect(result[0].rawData).toBe(validGrupo3);
  });

  it("applies Portuguese labels from FIELD_LABELS", () => {
    const result = adaptGrupo3([validGrupo3]);
    const resumo = findMeta(result[0].metadata, "resumo");
    expect(resumo?.label).toBe("Resumo");
  });
});

// -- adaptGrupo4 Tests --

describe("adaptGrupo4", () => {
  it("produces ProjectExecution with client_name and ekyte_id in identifiers", () => {
    const result = adaptGrupo4([validGrupo4]);
    expect(result[0].identifiers).toEqual({
      client_name: "Cliente ABC",
      ekyte_id: "ek-001",
    });
  });

  it("sets webhookGroup to 4", () => {
    const result = adaptGrupo4([validGrupo4]);
    expect(result[0].webhookGroup).toBe(4);
  });

  it('uses "date" field correctly (not "data")', () => {
    const result = adaptGrupo4([validGrupo4]);
    expect(result[0].date).toBe("2026-03-25");
  });

  it("parses status array into MetadataItem entries with type status-array", () => {
    const result = adaptGrupo4([validGrupo4]);
    const sucessos = findMeta(result[0].metadata, "sucessos");
    expect(sucessos).toBeDefined();
    expect(sucessos?.type).toBe("status-array");
    expect(sucessos?.label).toBe("Sucessos");
    expect(sucessos?.value).toBe(5);

    const falhas = findMeta(result[0].metadata, "falhas");
    expect(falhas).toBeDefined();
    expect(falhas?.type).toBe("status-array");
    expect(falhas?.label).toBe("Falhas");
    expect(falhas?.value).toBe(0);
  });

  it("has exactly 2 metadata items from status array", () => {
    const result = adaptGrupo4([validGrupo4]);
    expect(result[0].metadata).toHaveLength(2);
  });

  it("preserves rawData", () => {
    const result = adaptGrupo4([validGrupo4]);
    expect(result[0].rawData).toBe(validGrupo4);
  });

  it("sets correct projectName from PROJECT_NAMES", () => {
    const result = adaptGrupo4([validGrupo4]);
    expect(result[0].projectName).toBe("Banco de Dados de Midia");
  });

  it("throws on invalid data (Zod validation)", () => {
    const invalid = { project_id: "test", date: "2026-03-25" }; // missing required fields
    expect(() => adaptGrupo4([invalid])).toThrow();
  });
});
