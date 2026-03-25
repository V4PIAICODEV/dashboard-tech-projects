---
phase: 01-data-fetching-and-schema-normalization
plan: 03
subsystem: data
tags: [fetch, tanstack-query, useQueries, webhook, error-isolation, react-hooks]

# Dependency graph
requires:
  - phase: 01-data-fetching-and-schema-normalization
    plan: 02
    provides: "adaptGrupo1-4 functions, Zod schemas for all 4 webhook groups"
provides:
  - "fetchGrupo1-4 fetcher functions with error isolation"
  - "useAllProjects React hook combining all 4 groups via useQueries with combine"
  - "AllProjectsResult aggregated type with partial failure tracking"
affects: [02-error-detection-and-scoring, 03-ui-components]

# Tech tracking
tech-stack:
  added: ["@testing-library/react", "@testing-library/dom", "jsdom"]
  patterns: ["createFetcher factory for DRY webhook fetching", "useQueries combine for parallel query aggregation", "error-in-result pattern (never throw from fetchers)"]

key-files:
  created:
    - src/lib/data/fetchers.ts
    - src/lib/data/fetchers.test.ts
    - src/hooks/useAllProjects.ts
    - src/hooks/useAllProjects.test.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Fetchers never throw -- all errors returned in WebhookGroupResult.error for partial failure isolation (DATA-10)"
  - "createFetcher factory pattern eliminates duplication across 4 grupo fetchers"
  - "useQueries with combine callback over 4 separate useQuery calls for single-render efficiency"
  - "Lazy URL access via getUrl() lambda for Vite env var compatibility"
  - "Per-file @vitest-environment jsdom directive instead of global config change"

patterns-established:
  - "Error-in-result pattern: async functions that never throw, returning errors in the result object"
  - "createFetcher factory: group + getUrl + adapt -> () => Promise<WebhookGroupResult>"
  - "useQueries combine: merge parallel query results in a single callback"

requirements-completed: [DATA-01, DATA-10]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 01 Plan 03: Fetchers and useAllProjects Hook Summary

**Fetcher pipeline with error isolation per webhook group and useAllProjects hook using TanStack Query useQueries combine for parallel 4-group fetching**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T17:37:12Z
- **Completed:** 2026-03-25T17:42:55Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Built 4 fetcher functions (fetchGrupo1-4) via createFetcher factory with full error isolation -- HTTP errors, network failures, non-array responses, and Zod validation failures all return in result.error without throwing
- Implemented useAllProjects hook using TanStack Query v5 useQueries with combine callback for parallel fetching of all 4 webhook groups in a single render
- Partial failure isolation verified: when 1 group fails, the other 3 groups' data remains available in allExecutions (DATA-10 requirement)
- Full test suite passes: 80 tests across 6 test files covering schemas, normalizers, adapters, fetchers, and the hook

## Task Commits

Each task was committed atomically (TDD: RED then GREEN):

1. **Task 1: Fetcher functions with tests**
   - `356d50b` (test) -- RED: failing fetcher tests
   - `a6412cb` (feat) -- GREEN: implement fetcher pipeline
2. **Task 2: useAllProjects hook with TanStack Query**
   - `6acf61d` (test) -- RED: failing hook tests
   - `ebe2dbf` (feat) -- GREEN: implement useAllProjects with useQueries combine
   - `caa2b45` (chore) -- add @testing-library/react, @testing-library/dom, jsdom

_TDD tasks had multiple commits (test then feat)_

## Files Created/Modified

- `src/lib/data/fetchers.ts` -- createFetcher factory producing fetchGrupo1-4 with error isolation
- `src/lib/data/fetchers.test.ts` -- 11 tests covering happy path, network error, HTTP error, non-array, adapter throw
- `src/hooks/useAllProjects.ts` -- useQueries combine hook returning AllProjectsResult
- `src/hooks/useAllProjects.test.ts` -- 4 tests covering all-succeed, partial failure, loading state, group structure
- `package.json` -- added @testing-library/react, @testing-library/dom, jsdom dev dependencies
- `package-lock.json` -- lockfile updated

## Decisions Made

- **Fetchers never throw**: All errors caught and returned in WebhookGroupResult.error. This is critical for DATA-10 partial failure isolation -- TanStack Query sees all queries as "successful" but combine logic checks data.error for failure detection.
- **createFetcher factory**: DRY pattern accepting (group, getUrl, adapt) produces the 4 fetcher functions without code duplication.
- **Lazy URL access**: URLs accessed via `getUrl()` lambda instead of direct `WEBHOOK_URLS.grupo1` reference, ensuring Vite env vars are resolved at call time not module load time.
- **Per-file jsdom**: Used `// @vitest-environment jsdom` directive in hook test file rather than changing global vitest config, keeping unit tests in node environment.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed @testing-library/react, @testing-library/dom, jsdom**
- **Found during:** Task 2 (useAllProjects hook tests)
- **Issue:** renderHook and waitFor require @testing-library/react which was not installed; jsdom environment needed for React hooks
- **Fix:** `npm install --save-dev @testing-library/react @testing-library/dom jsdom`
- **Files modified:** package.json, package-lock.json
- **Verification:** Hook tests run successfully with jsdom environment
- **Committed in:** caa2b45

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** Essential dependency for React hook testing. No scope creep.

## Issues Encountered

None -- plan executed as specified.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness

- Phase 1 data pipeline is complete: types -> schemas -> normalizers -> adapters -> fetchers -> useAllProjects hook
- Any React component can now call `useAllProjects()` to get typed AllProjectsResult with partial failure isolation
- Ready for Phase 2 (error detection and scoring) which will consume AllProjectsResult.allExecutions
- CORS behavior still needs validation against real n8n endpoints (documented blocker from Phase 1 planning)

## Self-Check: PASSED

All 4 created files verified on disk. All 5 commit hashes verified in git log.

---
*Phase: 01-data-fetching-and-schema-normalization*
*Completed: 2026-03-25*
