# Requirements: Dashboard Tech Projects

**Defined:** 2026-03-25
**Core Value:** Visao centralizada e imediata da saude de todas as automacoes internas

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Pipeline

- [x] **DATA-01**: Dashboard busca dados via GET de 4 endpoints de webhook distintos
- [x] **DATA-02**: Normalizacao de 4 schemas diferentes em tipo unificado `ProjectExecution`
- [x] **DATA-03**: Deteccao de erro por checklist: campo `false` = item nao realizado (Handover Aquisicao, Handover Monetizacao, parte do Sales Coach)
- [x] **DATA-04**: Deteccao de erro por texto: campo vazio/null = informacao nao preenchida (BANT, Account Coach, campos especificos de Sales Coach e Auditoria)
- [x] **DATA-05**: Deteccao de erro por healthscore: `critical` ou `danger` = alerta (Auditoria, Account Coach)
- [x] **DATA-06**: Deteccao de erro por status array: `Falhas > 0` = erro (Banco de Dados de Midia)
- [x] **DATA-07**: Normalizacao de boolean strings (n8n serializa `false` como `"false"`)
- [x] **DATA-08**: Validacao de schema com Zod para detectar drift nos webhooks
- [ ] **DATA-09**: Breakdown campo-a-campo do metadado mostrando qual campo especifico falhou
- [x] **DATA-10**: Tratamento de falha parcial de webhook (um grupo falhando nao bloqueia os outros)

### Dashboard Overview

- [ ] **DASH-01**: Cards de resumo dos 7 projetos com nome, contagem de erros e timestamp da ultima execucao
- [ ] **DASH-02**: Indicadores de cor por projeto (verde = saudavel, amarelo = atencao, vermelho = critico)
- [ ] **DASH-03**: Timestamp "ultima atualizacao" visivel no header
- [ ] **DASH-04**: Badge de saude por projeto (healthy/warning/critical) baseado em regras de agregacao
- [ ] **DASH-05**: Percentual de erro por projeto (erros/total de execucoes)
- [ ] **DASH-06**: Navegacao de card para pagina de detalhe do projeto

### Detail Views

- [ ] **DTLV-01**: Lista de execucoes por projeto com identificador relevante (id_kommo, email, client_name)
- [ ] **DTLV-02**: Filtro por intervalo de data para historico de execucoes
- [ ] **DTLV-03**: Estados de loading (skeletons) e erro com mensagens claras
- [ ] **DTLV-04**: Exibicao de metadado expandivel por execucao com status por campo
- [ ] **DTLV-05**: Tempo relativo ("2 horas atras") com timestamp absoluto no hover
- [ ] **DTLV-06**: Grafico de tendencia de healthscore ao longo do tempo (Account Coach, Auditoria)
- [ ] **DTLV-07**: Labels em portugues para campos de metadado (nao exibir keys crus)

### Infrastructure

- [ ] **INFR-01**: Autenticacao basica com senha compartilhada via variavel de ambiente
- [ ] **INFR-02**: Refresh manual via botao no header
- [ ] **INFR-03**: Auto-polling a cada 60 segundos via TanStack Query
- [ ] **INFR-04**: Deploy via Docker (multi-stage: build -> nginx:alpine) no EasyPanel
- [ ] **INFR-05**: Configuracao de webhooks via variaveis de ambiente (nao hardcoded)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Visualizacao

- **VIS-01**: Grafico de barras comparativo de erros entre todos os projetos
- **VIS-02**: Exportacao de dados para CSV

### Operacional

- **OPR-01**: Notificacoes/alertas quando erros ultrapassam threshold
- **OPR-02**: Cache local para reduzir chamadas ao webhook em caso de timeout

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Contas individuais de usuario | Apenas 2 usuarios, senha compartilhada e suficiente |
| Notificacoes push/alertas | Monitoramento passivo por agora; se necessario, criar no n8n |
| Edicao de dados pelo dashboard | Somente leitura -- correcoes feitas na fonte (n8n, Kommo, Ekyte) |
| Monitoramento de falhas tecnicas do n8n | Foco em completude de checklist, nao em erros de execucao do n8n |
| WebSocket/real-time | Polling 60s suficiente para 2 usuarios internos |
| Dark mode | Um tema e suficiente para uso interno |
| Internacionalizacao (i18n) | Equipe brasileira, conteudo fixo em portugues |
| Layout responsivo mobile | Ferramenta interna acessada via desktop |
| Banco de dados proprio | Dados vivem nos webhooks; sem necessidade de persistencia |
| Layouts configuraveis (drag-and-drop) | 2 usuarios com necessidades identicas |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 2 | Complete |
| DATA-04 | Phase 2 | Complete |
| DATA-05 | Phase 2 | Complete |
| DATA-06 | Phase 2 | Complete |
| DATA-07 | Phase 1 | Complete |
| DATA-08 | Phase 1 | Complete |
| DATA-09 | Phase 2 | Pending |
| DATA-10 | Phase 1 | Complete |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DASH-06 | Phase 3 | Pending |
| DTLV-01 | Phase 4 | Pending |
| DTLV-02 | Phase 4 | Pending |
| DTLV-03 | Phase 4 | Pending |
| DTLV-04 | Phase 4 | Pending |
| DTLV-05 | Phase 4 | Pending |
| DTLV-06 | Phase 4 | Pending |
| DTLV-07 | Phase 4 | Pending |
| INFR-01 | Phase 3 | Pending |
| INFR-02 | Phase 3 | Pending |
| INFR-03 | Phase 3 | Pending |
| INFR-04 | Phase 5 | Pending |
| INFR-05 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
