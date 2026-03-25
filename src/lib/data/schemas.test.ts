import { describe, it, expect } from "vitest";
import {
  grupo1Schema,
  grupo2Schema,
  grupo3Schema,
  grupo4Schema,
} from "./schemas";
import { z } from "zod";

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

// -- Grupo 1 Schema Tests --

describe("grupo1Schema", () => {
  it("parses valid Handover Aquisicao object", () => {
    expect(() => grupo1Schema.parse(validGrupo1Handover)).not.toThrow();
  });

  it("parses valid BANT object with different metadado keys", () => {
    expect(() => grupo1Schema.parse(validGrupo1Bant)).not.toThrow();
  });

  it("throws ZodError when project_id is missing", () => {
    const { project_id: _, ...noProjectId } = validGrupo1Handover;
    expect(() => grupo1Schema.parse(noProjectId)).toThrow();
  });

  it("throws ZodError when metadado is missing", () => {
    const { metadado: _, ...noMetadado } = validGrupo1Handover;
    expect(() => grupo1Schema.parse(noMetadado)).toThrow();
  });

  it("preserves extra unknown fields in metadado (looseObject)", () => {
    const withExtra = {
      ...validGrupo1Handover,
      metadado: {
        ...validGrupo1Handover.metadado,
        campo_novo_desconhecido: "valor inesperado",
      },
    };
    const result = grupo1Schema.parse(withExtra);
    expect(
      (result.metadado as Record<string, unknown>).campo_novo_desconhecido
    ).toBe("valor inesperado");
  });

  it("parses array of valid objects via z.array()", () => {
    const arraySchema = z.array(grupo1Schema);
    const result = arraySchema.parse([
      validGrupo1Handover,
      validGrupo1Bant,
    ]);
    expect(result).toHaveLength(2);
  });
});

// -- Grupo 2 Schema Tests --

describe("grupo2Schema", () => {
  it("parses valid Sales Coach object with email and score", () => {
    expect(() => grupo2Schema.parse(validGrupo2SalesCoach)).not.toThrow();
  });

  it("throws ZodError when email is missing", () => {
    const { email: _, ...noEmail } = validGrupo2SalesCoach;
    expect(() => grupo2Schema.parse(noEmail)).toThrow();
  });

  it("parses valid Account Coach object", () => {
    expect(() => grupo2Schema.parse(validGrupo2AccountCoach)).not.toThrow();
  });
});

// -- Grupo 3 Schema Tests --

describe("grupo3Schema", () => {
  it("parses valid Auditoria object with fase and status_id", () => {
    expect(() => grupo3Schema.parse(validGrupo3)).not.toThrow();
  });

  it("throws ZodError when metadado is missing", () => {
    const { metadado: _, ...noMetadado } = validGrupo3;
    expect(() => grupo3Schema.parse(noMetadado)).toThrow();
  });
});

// -- Grupo 4 Schema Tests --

describe("grupo4Schema", () => {
  it("parses valid Midia object with status array", () => {
    expect(() => grupo4Schema.parse(validGrupo4)).not.toThrow();
  });

  it('uses "date" field not "data" (different from other groups)', () => {
    const result = grupo4Schema.parse(validGrupo4);
    expect(result.date).toBe("2026-03-25");
  });

  it("requires status to be array of strings", () => {
    const withBadStatus = { ...validGrupo4, status: "not an array" };
    expect(() => grupo4Schema.parse(withBadStatus)).toThrow();
  });

  it("throws ZodError when client_name is missing", () => {
    const { client_name: _, ...noClientName } = validGrupo4;
    expect(() => grupo4Schema.parse(noClientName)).toThrow();
  });
});
