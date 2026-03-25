# Dashboard Tech Projects

## What This Is

Dashboard interno para monitoramento de 7 projetos de automação (n8n). Permite que a equipe de gestão (Pietro e seu chefe) acompanhe a saúde das execuções — identificando itens incompletos em checklists de metadados como "erros". Dados puxados via GET em webhooks do n8n hospedado no EasyPanel.

## Core Value

Visão centralizada e imediata da saúde de todas as automações internas — abrir o dashboard e saber em segundos o que precisa de atenção.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Resumo geral de todos os 7 projetos com contadores de erro
- [ ] Visualização detalhada por projeto com histórico de execuções
- [ ] Detecção automática de erros (itens false/incompletos no metadado)
- [ ] Suporte a 4 tipos diferentes de webhook/estrutura de dados
- [ ] Autenticação básica (senha compartilhada)
- [ ] Deploy no EasyPanel
- [ ] Filtro por data para histórico de execuções

### Out of Scope

- Login com usuários individuais — para v1, senha compartilhada é suficiente
- Notificações/alertas — monitoramento passivo por agora
- Edição de dados pelo dashboard — é somente leitura
- Monitoramento de falhas técnicas do n8n — foco é checklist incompleto

## Context

### Projetos Monitorados

| Projeto | ID | Grupo Webhook |
|---------|-----|---------------|
| Handover Aquisição → Operação | a6eb735f... | Grupo 1 |
| Handover Monetização → Operação | 91e5abc2... | Grupo 1 |
| BANT | 1522051f... | Grupo 1 |
| Sales Coach AI | 9902ec09... | Grupo 2 |
| Account Coach AI | 81034bbc... | Grupo 2 |
| Auditoria do Squad Saber | ddf44dbe... | Grupo 3 |
| Banco de Dados de Mídia | 7fd3b921... | Grupo 4 |

### Webhooks (GET — dashboard puxa dados)

**Grupo 1** — Handover Aquisição, Handover Monetização, BANT:
`https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook/cb34831c-9878-4b39-9435-c0887866ca62`
Retorna: project_id, data, id_kommo, status, metadado

**Grupo 2** — Sales Coach AI, Account Coach AI:
`https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook/4a2ec142-b475-4408-be9b-4cacd9f706c9`
Retorna: project_id, data, tag, email, score, metadado

**Grupo 3** — Auditoria do Saber:
`https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook/c75a5e5e-380c-4bcb-adb1-3564967dfddc`
Retorna: project_id, data, id_kommo, status_id, fase, status, metadado

**Grupo 4** — Banco de Dados de Mídia:
`https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook/af4548c0-4d63-44bc-9b35-da6421ca5de3`
Retorna: project_id, date, client_name, ekyte_id, account_id, type, status (array: ["Sucessos: X", "Falhas: X"])

### Estrutura de Metadados

**Handover Aquisição → Operação** (true/false exceto onde indicado):
- Workspace Ekyte, Grupo Gchat, Grupo Whatsapp, Pastas do Drive
- Notificação pro gerente?, Notificação pro financeiro?, Notificação pra aquisição?
- Projeto atribuído?, Para quem foi atribuído? (texto), Quando foi atribuído? (texto)
- Task do Financeiro Criada?, Task da Operação Criada?
- Coordenador add no gchat?, Coordenador add no whatsapp?

**Handover Monetização → Operação** (true/false exceto onde indicado):
- Notificação pro gerente?, Notificação pro financeiro?, Notificação pra monetização?
- Projeto atribuído?, Para quem foi atribuído? (texto), Quando foi atribuído? (texto)
- Task do Financeiro Criada?, Task da Operação Criada?
- Coordenador add no gchat?, Coordenador add no whatsapp?

**BANT** (todos texto):
- Possiveis Objeções, Pontos Cegos
- POSSÍVEIS SOLUÇÕES/OFERTAS A APRESENTAR
- PONTOS DE ATENÇÃO, PRÓXIMOS PASSOS SUGERIDOS

**Sales Coach AI** (true/false exceto onde indicado):
- resumo_reuniao (texto), spiced_aplicado, spiced_observacoes
- produtos_oferecidos (texto), pediu_indicacao, indicacao_observacoes (texto)

**Account Coach AI** (todos texto):
- resumo, categoria_primaria_conteudo, categoria_secundaria_conteudo
  - Opções categoria secundária: Performance & Resultados, Estratégia & Planejamento, Alinhamento Operacional, Diagnóstico & Troubleshooting, Educação & Consultoria
- healthscore (enum: critical | danger | care | safe), justificativa_healthscore
- Oportunidade de monetização
- combinados, plano_de_acao_sugerido

**Auditoria do Saber** (tipos mistos):
- resumo (texto), avaliacao_conteudo (texto)
- ortografia_adequada (texto)
- checklist (texto)
- Oportunidades (texto, máximo 3 por fase)
- healthscore (enum: critical | danger | care | safe), justificativa_healthscore (texto)

**Banco de Dados de Mídia**: sem metadado — usa campo status (array de sucessos/falhas)

### Definição de Erro por Projeto

- **Projetos com checklist true/false**: item false = erro (ação não realizada)
- **Projetos com texto**: campo vazio/null = erro (informação não preenchida)
- **Banco de Dados de Mídia**: Falhas > 0 no array de status = erro
- **Healthscore**: critical ou danger = alerta

## Constraints

- **Infraestrutura**: Deploy no EasyPanel (mesmo ambiente do n8n)
- **Dados**: Webhooks em estruturação — pode haver mudanças nos campos
- **Usuários**: Apenas 2 (Pietro + chefe) — não precisa escalar
- **Autenticação**: Senha compartilhada simples (sem gerenciamento de usuários)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dados via GET webhook (pull) | Dashboard busca dados ativamente, sem necessidade de banco de dados próprio | — Pending |
| Autenticação básica (senha) | Apenas 2 usuários internos, complexidade desnecessária | — Pending |
| Deploy no EasyPanel | Centralizar infraestrutura junto ao n8n | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after initialization*
