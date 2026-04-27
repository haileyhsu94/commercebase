# CommerceBase — Frontend (Advertiser Dashboard)

> **What this is:** Vite + React + TypeScript dashboard for `ads.realry.com`.
> Built by Hailey (design) + Steve (API integration).
>
> **Backend lives elsewhere:** `realry/ads-realry-backend` (Laravel + MongoDB,
> Playwright worker, ECS deploy). This repo only ships the dashboard SPA to
> Vercel.
>
> **Landing page:** `haileyhsu94/commercebase-official-website` (Next.js,
> separate Vercel project).

---

## Quick start

```bash
cd frontend
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint
```

For full local stack (frontend + backend + mongo), see the backend repo's
README.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui + Radix UI |
| Routing | React Router DOM 7 |
| Data fetching | TanStack Query (React Query) |
| HTTP | Axios with Bearer token interceptor |
| Charts | Recharts 3 |
| Theme | next-themes (light/dark) |
| Font | Geist Variable |
| Deploy | Vercel (auto-deploy from main) |

---

## Repository ownership

This repo is **shared between Hailey (design) and Steve (API integration)**.

### Hailey owns (do not let backend code touch these)
```
frontend/src/
├── components/ui/         shadcn primitives
├── components/shared/     reusable feature components
├── components/layout/     AppSidebar, Header, RootLayout
├── components/analytics/  charts/maps
├── components/campaigns/  wizard sub-components
├── pages/<Section>/*.tsx  page-level layouts (Hailey leads, Steve adds 1-line API hook)
├── lib/*-mock.ts          mock data (replaced gradually)
├── lib/utils.ts           class-name helpers
├── index.css              design tokens
```

### Steve owns (Hailey doesn't touch)
```
frontend/src/
├── components/auth/       ProtectedRoute
├── components/shared/PageStatusBadge.tsx  data-source indicator
├── lib/api/               axios client + endpoint modules
├── hooks/api/             React Query hooks
├── contexts/AuthContext.tsx
├── pages/auth/Login.tsx
```

### Convention
- New page → Hailey ships with mock data. Steve replaces mock with API hook
  in a one-line diff.
- Type drift → backend changes break TypeScript here, caught in CI.
- Conflicts on page files: rare. AI-resolved when they happen.

---

## Routes

| Route | Page | Status (data source) |
|-------|------|---------------------|
| `/login` | Login | LIVE |
| `/` | Home dashboard | WORKING (greeting from API, widgets mock) |
| `/campaigns` | Campaign list | WORKING (API list, charts mock) |
| `/campaigns/:id` | Campaign detail | WORKING |
| `/campaigns?create=1` | 7-step wizard | WORKING (POST /api/v1/campaigns) |
| `/analytics` | Performance Overview | WORKING (real DailyClicks data) |
| `/analytics/channels` | Channel Attribution | WORKING |
| `/analytics/products` | Product Performance | DEMO (mock — next iteration) |
| `/analytics/audiences` | Audiences | DEMO |
| `/analytics/regions` | Regional Breakdown | DEMO |
| `/ai-presence/*` | AI Visibility hub | DEMO |
| `/catalogs`, `/publishers`, `/products/*` | Assets | DEMO |
| `/settings/*` | Account / Team / AI Permissions / Integrations | DEMO |
| `/inbox`, `/autopilot` | Notifications / Workflow placeholder | DEMO |

Every page shows a `<PageStatusBadge>` with the appropriate level so anyone
viewing the running app knows which data is real.

---

## API integration

```ts
// API client setup (Steve's territory)
import { useCampaignsQuery } from "@/hooks/api/useCampaigns"

// In a page (Hailey's territory, but uses the hook)
const { data: campaigns } = useCampaignsQuery()
```

Backend base URL is `import.meta.env.VITE_API_BASE_URL` (defaults to
`http://localhost:8000/api/v1` for local).

In production, Cloudflare path-routes `ads.realry.com/api/*` → backend ECS,
so the frontend uses relative `/api/v1/*` URLs and there's no CORS.

---

## Deploy

Vercel auto-deploys from `main`. Designer PRs get preview URLs automatically.

```
ads.realry.com (Cloudflare)
  ├── /                   → commercebase-official-website (landing)
  ├── /app/* or /         → THIS repo (dashboard)
  └── /api/*              → ads-realry-backend (ECS)
```

Vite must build with `base: '/app/'` if dashboard mounts under `/app/*`,
or `'/'` if dashboard is the root. (Decision pending — currently `'/'`.)

---

## Conventions

- TypeScript strict mode. No `any` in Steve's code.
- React Query for all server state; never local `useState` for fetched data.
- Route guards via `ProtectedRoute` outlet wrapper.
- 401 from API → axios interceptor clears token + redirects `/login`.
- Status badges (`<PageStatusBadge status="demo|working|live">`) on every
  route header to communicate data freshness to viewers.
