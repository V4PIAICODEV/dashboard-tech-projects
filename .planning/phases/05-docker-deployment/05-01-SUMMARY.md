---
phase: 05-docker-deployment
plan: 01
subsystem: infra
tags: [docker, nginx, dockerfile, easypanel, vite, spa-routing]

# Dependency graph
requires:
  - phase: 04-detail-views-and-filtering
    provides: complete Vite SPA ready for production bundling
provides:
  - Two-stage Dockerfile (node:22-slim build + nginx:stable-alpine serve)
  - nginx.conf with SPA try_files fallback and asset caching
  - .dockerignore excluding secrets and build artifacts
affects: [easypanel-deployment, production-ops]

# Tech tracking
tech-stack:
  added: [Docker multi-stage build, nginx:stable-alpine]
  patterns:
    - ARG/ENV pair pattern for Vite build-time env vars in Docker
    - SPA try_files nginx fallback for React Router client-side routing
    - Aggressive 1y caching for hashed assets, no-cache for index.html

key-files:
  created:
    - Dockerfile
    - nginx.conf
    - .dockerignore
  modified: []

key-decisions:
  - "VITE_* vars must be EasyPanel Build Variables (not Runtime Env Vars) -- Vite bakes them at build time"
  - "nginx.conf serves index.html for all unmatched routes via try_files to support React Router"
  - "node:22-slim chosen over node:22-alpine to avoid musl libc native module issues"
  - "nginx:stable-alpine chosen over nginx:alpine for production stability (pinned release train)"
  - "Chunk size warning (872kB, 264kB gzipped) accepted as-is -- cosmetic for 2-user internal tool"

patterns-established:
  - "Pattern: COPY package.json + RUN npm ci BEFORE COPY . . for Docker layer caching"
  - "Pattern: Multi-stage Dockerfile always separates build tools from runtime image"

requirements-completed: [INFR-04]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 5 Plan 1: Docker Deployment Summary

**Two-stage Dockerfile (node:22-slim + nginx:stable-alpine) with SPA routing, asset caching, and EasyPanel build-arg env var injection -- ready to deploy**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-25T22:31:00Z
- **Completed:** 2026-03-25T22:31:53Z
- **Tasks:** 1 of 2 auto tasks completed (Task 2 is a human-verify checkpoint)
- **Files modified:** 3

## Accomplishments
- Created production Dockerfile with two stages: node:22-slim builds the Vite app, nginx:stable-alpine serves the static dist/
- Created nginx.conf with SPA try_files fallback (React Router support), 1-year asset caching for hashed files, and no-cache headers for index.html
- Created .dockerignore excluding node_modules, dist, all .env.* files, .git, and .planning directory -- secrets cannot enter the image
- Verified `npm run build` exits 0 with no regressions (cosmetic chunk size warning expected)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write Dockerfile, nginx.conf, and .dockerignore** - `d7d9216` (chore)

**Plan metadata:** (committed below after state update)

## Files Created/Modified
- `Dockerfile` - Two-stage build: node:22-slim build stage with ARG/ENV for VITE_* vars, nginx:stable-alpine serve stage
- `nginx.conf` - SPA routing fallback, 1y hashed asset caching, no-cache for index.html, gzip compression
- `.dockerignore` - Excludes node_modules, dist, .env, .env.*, .env.local, .env.production, .git, .planning, *.md

## Decisions Made
- VITE_* vars wired as ARG -> ENV in build stage. EasyPanel must use "Build Variables" (build args), NOT "Environment Variables" (runtime). Runtime vars are invisible to Vite at build time.
- nginx:stable-alpine preferred over nginx:alpine for production (stable release train, fewer breaking changes)
- node:22-slim preferred over node:22-alpine (glibc vs musl libc avoids native npm module compatibility issues)
- 872 kB JS chunk warning left as-is. Build succeeds; gzipped transfer is 264 kB, acceptable for a 2-user internal tool.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build completed in 715ms with expected chunk size warning (cosmetic, non-blocking).

## User Setup Required

**EasyPanel deployment requires manual configuration.** Steps:

1. Push commit `d7d9216` (and this SUMMARY commit) to git
2. In EasyPanel, open or create the service for this dashboard
3. In service settings, find **"Build Variables"** (also called Build Args -- NOT "Environment Variables")
4. Add these 5 build variables with values from your .env.production:
   - `VITE_WEBHOOK_GRUPO1`
   - `VITE_WEBHOOK_GRUPO2`
   - `VITE_WEBHOOK_GRUPO3`
   - `VITE_WEBHOOK_GRUPO4`
   - `VITE_AUTH_PASSWORD`
5. Trigger a deploy. Watch build logs for Vite build output (chunk warning is cosmetic)
6. Open the HTTPS URL, verify: login page appears, password works, project cards load, clicking a card navigates to detail, refreshing the detail page does NOT 404

**CORS note:** If webhook fetches show CORS errors in DevTools, n8n is blocking cross-origin requests. Notify so an nginx `proxy_pass` block can be added to nginx.conf as a follow-up.

## Next Phase Readiness
- All infrastructure files committed and verified. EasyPanel can build directly from the git repo.
- Human verification (Task 2 checkpoint) is the remaining step: deploy to EasyPanel and confirm browser end-to-end works.
- No code blockers. CORS behavior against live n8n webhooks remains unconfirmed until first browser test.

---
*Phase: 05-docker-deployment*
*Completed: 2026-03-25*
