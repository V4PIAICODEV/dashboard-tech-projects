<!-- GSD:project-start source:PROJECT.md -->
## Project

**Dashboard Tech Projects**

Dashboard interno para monitoramento de 7 projetos de automação (n8n). Permite que a equipe de gestão (Pietro e seu chefe) acompanhe a saúde das execuções — identificando itens incompletos em checklists de metadados como "erros". Dados puxados via GET em webhooks do n8n hospedado no EasyPanel.

**Core Value:** Visão centralizada e imediata da saúde de todas as automações internas — abrir o dashboard e saber em segundos o que precisa de atenção.

### Constraints

- **Infraestrutura**: Deploy no EasyPanel (mesmo ambiente do n8n)
- **Dados**: Webhooks em estruturação — pode haver mudanças nos campos. Atualmente vazios (recém-criados), podem retornar vazio ou erro
- **Usuários**: Apenas 2 (Pietro + chefe) — não precisa escalar
- **Autenticação**: Senha compartilhada simples (sem gerenciamento de usuários)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Decision Context
## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Vite** | 8.x | Build tool and dev server | No SSR needed. Vite produces static files served by nginx -- drastically simpler Docker image (~30MB vs ~230MB for Next.js standalone). Instant HMR, sub-second cold starts. EasyPanel deploys static sites natively. Next.js would add server runtime complexity for zero benefit here. | HIGH |
| **React** | 19.x (19.2.4) | UI framework | Industry standard. All chosen libraries (shadcn/ui, Recharts, TanStack Query) target React 19. The company reference dashboards already use React. | HIGH |
| **TypeScript** | 6.x (6.0.2) | Type safety | Non-negotiable for any new project in 2026. Catches webhook data shape mismatches at compile time -- critical when 4 different webhook response formats exist. | HIGH |
### UI Layer
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Tailwind CSS** | 4.x (4.2.0) | Utility-first CSS | Company reference dashboards already use Tailwind. v4 uses CSS-native `@theme` directives (no JS config needed), 5x faster full builds, 100x faster incremental. Zero-config with Vite 8. | HIGH |
| **shadcn/ui** | latest (CLI v4) | Component library | Not a dependency -- copies components into your project. Built on Radix UI primitives (accessibility, keyboard nav). Has pre-built chart components wrapping Recharts. Matches the visual language of the company's existing dashboards. The `new-york` style uses a unified `radix-ui` package. | HIGH |
| **Recharts** | 3.x (3.8.0) | Data visualization | shadcn/ui charts are built on Recharts -- using it directly means zero abstraction mismatch. Covers all needed chart types (bar, line, area). Simpler API than Nivo or D3. No need for advanced visualization -- this is status/health monitoring, not data exploration. | HIGH |
### Data Layer
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **TanStack Query** | 5.x (5.95.0) | Server state, caching, polling | The dashboard pulls data from 4 GET webhooks. TanStack Query provides: `refetchInterval` for auto-polling (e.g., every 60s), automatic caching, loading/error states, background refetch. This single library replaces what would otherwise require manual `useEffect` + `useState` + `fetch` patterns. | HIGH |
### Routing
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **React Router** | 7.x | Client-side routing | Only 2-3 routes needed (overview, project detail, maybe settings). React Router is the most stable, battle-tested choice. TanStack Router offers superior type safety but is overkill for 3 routes. React Router v7 works perfectly in Vite SPA mode. | HIGH |
### Authentication
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Custom (no library)** | n/a | Shared password auth | For 2 users with a shared password, a library is unnecessary. Implementation: password input -> compare against env var -> store auth flag in `sessionStorage`. A simple React context wrapping the app. Total: ~30 lines of code. No JWT, no sessions, no auth library. | HIGH |
### Utilities
| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **date-fns** | 4.x | Date formatting and manipulation | Filtering executions by date range. Tree-shakeable (import only `format`, `isWithinInterval`, `parseISO`). Functional API aligns with React patterns. Lighter effective bundle than dayjs when tree-shaken. | MEDIUM |
| **clsx** | 2.x | Conditional class names | Already included with shadcn/ui setup. Used for dynamic styling (error states, health scores). | HIGH |
| **tailwind-merge** | 3.x | Merge Tailwind classes | Already included with shadcn/ui `cn()` utility. Prevents class conflicts when composing components. | HIGH |
### Development Tools
| Tool | Version | Purpose | Why | Confidence |
|------|---------|---------|-----|------------|
| **Vitest** | 3.x | Unit testing | Same config as Vite, zero extra setup. Test webhook data transformers and error detection logic. | HIGH |
| **ESLint** | 9.x | Code quality | Flat config format. Use `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks`. | HIGH |
| **Prettier** | 3.x | Code formatting | Consistent formatting. Use `prettier-plugin-tailwindcss` for class sorting. | HIGH |
### Deployment
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Docker (multi-stage)** | n/a | Containerization | Stage 1: `node:22-slim` builds the Vite app. Stage 2: `nginx:stable-alpine` serves static files. Final image ~30MB. EasyPanel deploys Docker images natively with auto-SSL via Let's Encrypt. | HIGH |
| **nginx** | stable-alpine | Static file serving | Serves the built `dist/` folder. Needs `try_files $uri $uri/ /index.html` for SPA routing. No Node.js runtime needed in production. | HIGH |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Build Tool** | Vite 8 | Next.js 16 | Next.js adds SSR runtime, API routes, and server components -- none needed. Docker image 8x larger. The company does use Next.js for other dashboards, but those are public-facing. For an internal SPA behind auth, Vite is strictly simpler. |
| **Build Tool** | Vite 8 | Astro | Astro excels at content sites with islands. This is a fully interactive SPA -- every component is interactive. Astro would add complexity (island architecture) for no benefit. |
| **UI Library** | shadcn/ui | Tremor | Tremor is built on Recharts + Tailwind (same as shadcn/ui charts) but is a proper npm dependency with less flexibility. shadcn/ui gives you ownership of the code. Tremor's opinionated dashboard components would initially speed things up but limit customization for the 4 different webhook data structures. |
| **UI Library** | shadcn/ui | Material UI (MUI) | Different design language from company dashboards. Heavier bundle. CSS-in-JS approach conflicts with Tailwind. |
| **Charts** | Recharts 3 | Nivo | Nivo has more chart types and prettier defaults, but this dashboard needs bar charts, line charts, and maybe pie charts. Recharts covers all of these, integrates natively with shadcn/ui, and has a simpler API. |
| **Charts** | Recharts 3 | Chart.js / react-chartjs-2 | Canvas-based (not SVG). Harder to style consistently with Tailwind. Recharts composes naturally with React. |
| **Data Fetching** | TanStack Query 5 | SWR | SWR is lighter but TanStack Query has better polling support (`refetchInterval`, `refetchIntervalInBackground`), better devtools, and wider community adoption in 2025-2026. For a polling-heavy dashboard, TanStack Query is the better fit. |
| **Data Fetching** | TanStack Query 5 | Plain fetch + useEffect | Manual state management for loading, error, caching, and polling across 4 webhooks would produce fragile, duplicated code. TanStack Query eliminates all of it. |
| **State Management** | None (TanStack Query only) | Zustand | With TanStack Query managing all server state (the webhook data), there is virtually no client state to manage. Auth state fits in a React Context. Date filter state fits in URL search params or local component state. Adding Zustand would be premature abstraction. |
| **State Management** | None | Redux Toolkit | Massive overkill for an internal dashboard with no client-side state complexity. |
| **Routing** | React Router 7 | TanStack Router | Superior type safety, but the dashboard has ~3 routes. The learning curve and code generation step are not justified. React Router v7 in SPA mode is stable and well-documented. |
| **Date Library** | date-fns 4 | dayjs | dayjs has a smaller base bundle but date-fns tree-shakes better when you only need 3-4 functions. date-fns has better TypeScript support and functional API. Either would work -- this is a LOW-stakes decision. |
| **Date Library** | date-fns 4 | Native Intl/Temporal | Temporal API is not yet widely available in all environments. `Intl.DateTimeFormat` covers formatting but not date arithmetic (isWithinInterval, addDays). |
| **Testing** | Vitest 3 | Jest | Jest requires separate configuration. Vitest shares Vite's config and transforms, making setup instant. Same API surface. |
## What NOT to Use (and Why)
| Technology | Why Not |
|------------|---------|
| **Next.js** | Adds server runtime for a purely client-side SPA. Larger Docker image. More complex deployment. No SEO, no SSR, no ISR needed. |
| **Redux / Redux Toolkit** | No complex client state. All data is server state managed by TanStack Query. |
| **Firebase / Supabase** | No database needed. Data comes from n8n webhooks. Adding a BaaS would create unnecessary coupling. |
| **NextAuth / Auth.js** | Designed for OAuth, magic links, database sessions. This needs a single shared password check -- 30 lines of custom code. |
| **Axios** | `fetch` is native and sufficient. TanStack Query wraps the fetch function you provide. Axios adds bundle weight for zero benefit. |
| **Moment.js** | Deprecated. 300KB+ bundle. Use date-fns instead. |
| **Styled Components / Emotion** | CSS-in-JS conflicts with Tailwind's utility-first approach. Runtime overhead. |
| **Storybook** | 2-user internal tool with ~15 components. Component isolation testing is overkill. |
## Installation
# Scaffold project
# Navigate to project
# Core dependencies
# Initialize Tailwind CSS v4 (Vite plugin)
# Initialize shadcn/ui
# Install shadcn/ui components as needed (these copy into your project)
# Dev dependencies
## Docker Deployment (EasyPanel)
# Stage 1: Build
# Stage 2: Serve
# nginx.conf
## Environment Variables
| Variable | Purpose | Build/Runtime |
|----------|---------|---------------|
| `VITE_API_BASE_URL` | Base URL for n8n webhooks (e.g., `https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host`) | Build-time (baked into bundle) |
| `VITE_AUTH_PASSWORD` | Shared dashboard password | Build-time (baked into bundle) |
## Version Summary
| Package | Pinned Version | Latest Verified |
|---------|---------------|-----------------|
| Vite | ^8.0.0 | 8.0.2 (March 2026) |
| React | ^19.0.0 | 19.2.4 (Jan 2026) |
| TypeScript | ^6.0.0 | 6.0.2 (March 2026) |
| Tailwind CSS | ^4.2.0 | 4.2.0 (Feb 2026) |
| shadcn/ui CLI | latest | v4 (March 2026) |
| Recharts | ^3.0.0 | 3.8.0 (March 2026) |
| TanStack Query | ^5.0.0 | 5.95.0 (March 2026) |
| React Router | ^7.0.0 | 7.x (stable) |
| date-fns | ^4.0.0 | 4.x (stable) |
| Vitest | ^3.0.0 | 3.x (stable) |
## Sources
### Verified (HIGH confidence)
- [Vite Releases](https://vite.dev/releases) -- v8.0.2 confirmed as latest stable
- [React v19 Blog Post](https://react.dev/blog/2024/12/05/react-19) + [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [Tailwind CSS v4.0 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [shadcn/ui Official Installation - Vite](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui Charts](https://ui.shadcn.com/docs/components/radix/chart) -- confirms Recharts v3 integration
- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [EasyPanel Next.js Quickstart](https://easypanel.io/docs/quickstarts/nextjs) + [Static Site Quickstart](https://easypanel.io/docs/quickstarts/static-website)
- [TypeScript 5.9 Docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) + TypeScript 6.0 release
- [Recharts npm](https://www.npmjs.com/package/recharts) -- v3.8.0 confirmed
### Ecosystem Research (MEDIUM confidence)
- [Vite vs Next.js Comparison (2026)](https://designrevision.com/blog/vite-vs-nextjs)
- [Vite vs Next.js Developer Guide (2025)](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison)
- [State Management in 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [TanStack Query Polling](https://samwithcode.in/tutorial/react-js/real-time-polling-in-react-query-2025)
- [Recharts vs Tremor vs Nivo (2025)](https://embeddable.com/blog/react-chart-libraries)
- [React Router vs TanStack Router](https://betterstack.com/community/comparisons/tanstack-router-vs-react-router/)
- [shadcn/ui Guide (2026)](https://designrevision.com/blog/shadcn-ui-guide)
- [Vite React Docker Production Guide](https://www.buildwithmatija.com/blog/production-react-vite-docker-deployment)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
