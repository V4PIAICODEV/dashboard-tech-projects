# Roadmap: Dashboard Tech Projects

## Overview

This roadmap delivers a centralized monitoring dashboard for 7 n8n automation projects. The journey starts with the highest-risk work -- a data pipeline that fetches from 4 heterogeneous webhook endpoints, normalizes schemas, and detects business-logic errors. Once the data foundation is solid and tested against real webhooks, the UI layers build on top: first the overview dashboard with auth and polling, then per-project detail views with filtering and field-level breakdowns. Deployment to EasyPanel via Docker closes the loop. Every phase delivers a verifiable capability; no phase depends on speculation about untested data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Fetching and Schema Normalization** - Scaffold project, fetch from 4 webhook groups, normalize into unified ProjectExecution type with Zod validation
- [ ] **Phase 2: Error Detection Engine** - Detect errors across all 4 project types using checklist, text, healthscore, and status-array rules
- [ ] **Phase 3: App Shell and Overview Dashboard** - Auth gate, overview page with 7 project cards, health badges, polling, and refresh
- [ ] **Phase 4: Detail Views and Filtering** - Per-project drill-down with execution history, field-level breakdowns, date filtering, and trend charts
- [ ] **Phase 5: Docker Deployment** - Multi-stage Docker build and deploy to EasyPanel with nginx serving the SPA

## Phase Details

### Phase 1: Data Fetching and Schema Normalization
**Goal**: Raw webhook data from all 4 endpoint groups is reliably fetched, validated, and normalized into a single TypeScript type that downstream code can trust
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-07, DATA-08, DATA-10, INFR-05
**Success Criteria** (what must be TRUE):
  1. A browser fetch to each of the 4 webhook endpoints returns data successfully (CORS validated or nginx proxy configured)
  2. All 4 webhook response shapes are parsed through Zod schemas that reject unexpected structures with clear error messages
  3. Boolean strings from n8n (e.g., "false", "true") are normalized to actual booleans before any downstream consumption
  4. All 4 adapters produce a unified ProjectExecution[] array where each execution carries its project_id, timestamp, and raw fields
  5. One webhook group failing does not prevent the other three from loading -- partial failure is handled gracefully

Plans:
- [x] 01-01: Scaffold Vite project, types, config, env vars ✓ 2026-03-25
- [x] 01-02: Normalizers, Zod schemas, 4 adapters (TDD)
- [x] 01-03: Fetcher pipeline, useAllProjects hook (TDD)

### Phase 2: Error Detection Engine
**Goal**: The dashboard can accurately identify which executions have errors and which specific fields failed, across all 7 projects with their 4 different error detection strategies
**Depends on**: Phase 1
**Requirements**: DATA-03, DATA-04, DATA-05, DATA-06, DATA-09
**Plans:** 2 plans
**Success Criteria** (what must be TRUE):
  1. Checklist-based projects (Handover Aquisicao, Handover Monetizacao, Sales Coach boolean fields) flag any field with value false as an error
  2. Text-based projects (BANT, Account Coach, text fields in Sales Coach and Auditoria) flag any empty/null field as an error
  3. Healthscore-based projects (Account Coach, Auditoria) flag critical or danger values as alerts
  4. Status-array project (Banco de Dados de Midia) flags executions where Falhas > 0 as errors
  5. Every execution exposes a per-field breakdown showing exactly which fields passed and which failed

Plans:
- [x] 02-01-PLAN.md -- Types, detection functions, and TDD tests for 4 field-level strategies (DATA-03, DATA-04, DATA-05, DATA-06)
- [x] 02-02-PLAN.md -- Aggregation layer: per-execution breakdown with counts and overall status (DATA-09)

### Phase 3: App Shell and Overview Dashboard
**Goal**: Users can log in and see the health of all 7 projects at a glance -- knowing immediately which projects need attention and which are healthy
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, INFR-01, INFR-02, INFR-03
**Success Criteria** (what must be TRUE):
  1. User must enter a shared password to access the dashboard; without it, only the login page is visible
  2. Overview page shows 7 project cards, each displaying the project name, error count, and timestamp of the last execution
  3. Each card is color-coded (green/yellow/red) based on aggregated health, with a health badge (healthy/warning/critical)
  4. Each card shows the error rate as a percentage (errors / total executions)
  5. A "last updated" timestamp is visible in the header, data auto-refreshes every 60 seconds, and a manual refresh button triggers an immediate fetch
  6. Clicking a project card navigates to that project's detail page
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Detail Views and Filtering
**Goal**: Users can drill into any project and see exactly which executions failed, which fields caused the failure, and filter by date range to focus on the relevant period
**Depends on**: Phase 3
**Requirements**: DTLV-01, DTLV-02, DTLV-03, DTLV-04, DTLV-05, DTLV-06, DTLV-07
**Success Criteria** (what must be TRUE):
  1. Detail page shows a list of executions for the selected project, each identified by its relevant field (id_kommo, email, or client_name)
  2. User can filter executions by date range; the list updates to show only executions within the selected interval
  3. Each execution row is expandable to reveal the full metadado with per-field pass/fail status and Portuguese field labels (not raw JSON keys)
  4. Loading states show skeleton placeholders and error states show clear messages when a webhook fails
  5. Timestamps display as relative time ("2 horas atras") with the absolute timestamp visible on hover
  6. Projects with healthscore (Account Coach, Auditoria) show a trend chart of healthscore values over time
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Docker Deployment
**Goal**: The dashboard is deployed and accessible via HTTPS on EasyPanel, running as a lightweight Docker container with all configuration via environment variables
**Depends on**: Phase 4
**Requirements**: INFR-04
**Success Criteria** (what must be TRUE):
  1. A multi-stage Docker build produces a nginx:alpine image serving the SPA with correct SPA routing fallback (all routes resolve to index.html)
  2. The deployed dashboard on EasyPanel loads, authenticates, fetches live webhook data, and displays correct project health -- end-to-end verified
  3. Webhook URLs and auth password are configured via environment variables, not hardcoded in the build
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Fetching and Schema Normalization | 3/3 | Complete | 2026-03-25 |
| 2. Error Detection Engine | 2/2 | Complete | 2026-03-25 |
| 3. App Shell and Overview Dashboard | 1/3 | In progress | - |
| 4. Detail Views and Filtering | 0/3 | Not started | - |
| 5. Docker Deployment | 0/1 | Not started | - |
