// Per D-02 / INFR-05: All webhook URLs from environment variables
export const WEBHOOK_URLS = {
  grupo1: import.meta.env.VITE_WEBHOOK_GRUPO1,
  grupo2: import.meta.env.VITE_WEBHOOK_GRUPO2,
  grupo3: import.meta.env.VITE_WEBHOOK_GRUPO3,
  grupo4: import.meta.env.VITE_WEBHOOK_GRUPO4,
} as const;

// 7 projects mapped to their display names
export const PROJECT_NAMES: Record<string, string> = {
  a6eb735f: "Handover Aquisicao",
  "91e5abc2": "Handover Monetizacao",
  "1522051f": "BANT",
  "9902ec09": "Sales Coach AI",
  "81034bbc": "Account Coach AI",
  ddf44dbe: "Auditoria do Saber",
  "7fd3b921": "Banco de Dados de Midia",
};

// Which webhook group each project belongs to
export const PROJECT_GROUPS: Record<string, 1 | 2 | 3 | 4> = {
  a6eb735f: 1, // Handover Aquisicao
  "91e5abc2": 1, // Handover Monetizacao
  "1522051f": 1, // BANT
  "9902ec09": 2, // Sales Coach AI
  "81034bbc": 2, // Account Coach AI
  ddf44dbe: 3, // Auditoria do Saber
  "7fd3b921": 4, // Banco de Dados de Midia
};

// Field labels: raw metadado key -> Portuguese display label, per project
export const FIELD_LABELS: Record<string, Record<string, string>> = {
  // Handover Aquisicao
  a6eb735f: {
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
  "91e5abc2": {
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
  "1522051f": {
    possiveis_objecoes: "Possiveis Objecoes",
    pontos_cegos: "Pontos Cegos",
    possiveis_solucoes: "Possiveis Solucoes/Ofertas a Apresentar",
    pontos_atencao: "Pontos de Atencao",
    proximos_passos: "Proximos Passos Sugeridos",
  },
  // Sales Coach AI
  "9902ec09": {
    resumo_reuniao: "Resumo da Reuniao",
    spiced_aplicado: "SPICED aplicado?",
    spiced_observacoes: "Observacoes SPICED",
    produtos_oferecidos: "Produtos Oferecidos",
    pediu_indicacao: "Pediu indicacao?",
    indicacao_observacoes: "Observacoes de Indicacao",
  },
  // Account Coach AI
  "81034bbc": {
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
  ddf44dbe: {
    resumo: "Resumo",
    avaliacao_conteudo: "Avaliacao do Conteudo",
    ortografia_adequada: "Ortografia Adequada",
    checklist: "Checklist",
    oportunidades: "Oportunidades",
    healthscore: "Healthscore",
    justificativa_healthscore: "Justificativa do Healthscore",
  },
  // Banco de Dados de Midia has no metadado fields -- uses status array
  "7fd3b921": {},
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
  { id: "a6eb735f", name: "Handover Aquisicao", webhookGroup: 1 },
  { id: "91e5abc2", name: "Handover Monetizacao", webhookGroup: 1 },
  { id: "1522051f", name: "BANT", webhookGroup: 1 },
  { id: "9902ec09", name: "Sales Coach AI", webhookGroup: 2 },
  { id: "81034bbc", name: "Account Coach AI", webhookGroup: 2 },
  { id: "ddf44dbe", name: "Auditoria do Saber", webhookGroup: 3 },
  { id: "7fd3b921", name: "Banco de Dados de Midia", webhookGroup: 4 },
];
