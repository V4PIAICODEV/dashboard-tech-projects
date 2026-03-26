import { ENV } from "@/lib/env";

// Per D-02 / INFR-05: All webhook URLs from environment variables
export const WEBHOOK_URLS = {
  grupo1: ENV.VITE_WEBHOOK_GRUPO1,
  grupo2: ENV.VITE_WEBHOOK_GRUPO2,
  grupo3: ENV.VITE_WEBHOOK_GRUPO3,
  grupo4: ENV.VITE_WEBHOOK_GRUPO4,
} as const;

// Full project IDs as returned by webhook project_id field
const ID = {
  HANDOVER_AQUISICAO:
    "a6eb735f07ea69c464f62703bfb51c4e89de4271d23a2e08950a2f0105602105",
  HANDOVER_MONETIZACAO:
    "91e5abc2e306b137953cf5bfdcc8be0f4185e888763889b166cf86fd22c18597",
  BANT: "1522051fa3035e2674272ea1cadccd66a5c0a5345a024528d2b99ac31292b710",
  SALES_COACH:
    "9902ec091d87e1125c0ee9f258cb3853cfe74bdf751d1568b017bb01a9d9ddba",
  ACCOUNT_COACH:
    "81034cbce6a2c1e0fe1d7a1fac995ada04d626a46a4d45dd1afd4ec50415f61f",
  AUDITORIA:
    "ddf44dbfec3de36038d12f215b354129f67b1ed9f0ce71ca53c22b6ab573ee83",
  BANCO_MIDIA:
    "7fd3b921c8244a39bd0be982d77113b74f47fd9da49c0060d54f1afff1eb1058",
} as const;

// 7 projects mapped to their display names
export const PROJECT_NAMES: Record<string, string> = {
  [ID.HANDOVER_AQUISICAO]: "Handover Aquisicao",
  [ID.HANDOVER_MONETIZACAO]: "Handover Monetizacao",
  [ID.BANT]: "BANT",
  [ID.SALES_COACH]: "Sales Coach AI",
  [ID.ACCOUNT_COACH]: "Account Coach AI",
  [ID.AUDITORIA]: "Auditoria do Saber",
  [ID.BANCO_MIDIA]: "Banco de Dados de Midia",
};

// Which webhook group each project belongs to
export const PROJECT_GROUPS: Record<string, 1 | 2 | 3 | 4> = {
  [ID.HANDOVER_AQUISICAO]: 1,
  [ID.HANDOVER_MONETIZACAO]: 1,
  [ID.BANT]: 1,
  [ID.SALES_COACH]: 2,
  [ID.ACCOUNT_COACH]: 2,
  [ID.AUDITORIA]: 3,
  [ID.BANCO_MIDIA]: 4,
};

// Field labels: raw metadado key -> Portuguese display label, per project
export const FIELD_LABELS: Record<string, Record<string, string>> = {
  // Handover Aquisicao
  [ID.HANDOVER_AQUISICAO]: {
    workspace_ekyte: "Workspace Ekyte criado?",
    grupo_gchat: "Grupo Gchat criado?",
    grupo_whatsapp: "Grupo Whatsapp criado?",
    pastas_drive: "Pastas do Drive criadas?",
    notificacao_gerente: "Notificacao pro gerente?",
    notificacao_financeiro: "Notificacao pro financeiro?",
    notificacao_aquisicao: "Notificacao pra aquisicao?",
    projeto_atribuido: "Projeto atribuido?",
    para_quem_atribuido: "Para quem foi atribuido?",
    quando_atribuido: "Quando foi atribuido?",
    task_financeiro: "Task do Financeiro Criada?",
    task_operacao: "Task da Operacao Criada?",
    coordenador_gchat: "Coordenador add no gchat?",
    coordenador_whatsapp: "Coordenador add no whatsapp?",
  },
  // Handover Monetizacao
  [ID.HANDOVER_MONETIZACAO]: {
    notificacao_gerente: "Notificacao pro gerente?",
    notificacao_financeiro: "Notificacao pro financeiro?",
    notificacao_monetizacao: "Notificacao pra monetizacao?",
    projeto_atribuido: "Projeto atribuido?",
    para_quem_atribuido: "Para quem foi atribuido?",
    quando_atribuido: "Quando foi atribuido?",
    task_financeiro: "Task do Financeiro Criada?",
    task_operacao: "Task da Operacao Criada?",
    coordenador_gchat: "Coordenador add no gchat?",
    coordenador_whatsapp: "Coordenador add no whatsapp?",
  },
  // BANT (all text fields)
  [ID.BANT]: {
    possiveis_objecoes: "Possiveis Objecoes",
    pontos_cegos: "Pontos Cegos",
    possiveis_solucoes: "Possiveis Solucoes/Ofertas a Apresentar",
    pontos_atencao: "Pontos de Atencao",
    proximos_passos: "Proximos Passos Sugeridos",
  },
  // Sales Coach AI
  [ID.SALES_COACH]: {
    resumo_reuniao: "Resumo da Reuniao",
    spiced_aplicado: "SPICED aplicado?",
    spiced_observacoes: "Observacoes SPICED",
    produtos_oferecidos: "Produtos Oferecidos",
    pediu_indicacao: "Pediu indicacao?",
    indicacao_observacoes: "Observacoes de Indicacao",
  },
  // Account Coach AI
  [ID.ACCOUNT_COACH]: {
    resumo: "Resumo",
    categoria_primaria_conteudo: "Categoria Primaria do Conteudo",
    categoria_secundaria_conteudo: "Categoria Secundaria do Conteudo",
    healthscore: "Healthscore",
    justificativa_healthscore: "Justificativa do Healthscore",
    oportunidade_monetizacao: "Oportunidade de Monetizacao",
    combinados: "Combinados",
    plano_de_acao_sugerido: "Plano de Acao Sugerido",
  },
  // Auditoria do Saber
  [ID.AUDITORIA]: {
    resumo: "Resumo",
    avaliacao_conteudo: "Avaliacao do Conteudo",
    ortografia_adequada: "Ortografia Adequada",
    checklist: "Checklist",
    oportunidades: "Oportunidades",
    healthscore: "Healthscore",
    justificativa_healthscore: "Justificativa do Healthscore",
  },
  // Banco de Dados de Midia has no metadado fields -- uses status array
  [ID.BANCO_MIDIA]: {},
};

/**
 * Project registry: all metadata about each project in one place.
 * Used for iteration, display, and lookup throughout the app.
 */
export interface ProjectInfo {
  id: string;
  name: string;
  webhookGroup: 1 | 2 | 3 | 4;
}

export const PROJECT_REGISTRY: ProjectInfo[] = [
  { id: ID.HANDOVER_AQUISICAO, name: "Handover Aquisicao", webhookGroup: 1 },
  {
    id: ID.HANDOVER_MONETIZACAO,
    name: "Handover Monetizacao",
    webhookGroup: 1,
  },
  { id: ID.BANT, name: "BANT", webhookGroup: 1 },
  { id: ID.SALES_COACH, name: "Sales Coach AI", webhookGroup: 2 },
  { id: ID.ACCOUNT_COACH, name: "Account Coach AI", webhookGroup: 2 },
  { id: ID.AUDITORIA, name: "Auditoria do Saber", webhookGroup: 3 },
  { id: ID.BANCO_MIDIA, name: "Banco de Dados de Midia", webhookGroup: 4 },
];

// Re-export ID constants for use in tests and components
export { ID as PROJECT_IDS };
