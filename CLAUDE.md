# CommerceBase — Engineering Handoff

> **What this is:** A polished frontend mockup (React/Vite/TypeScript) for a commerce media platform. Every page uses mock data and localStorage — there is zero backend. Your job is to build the backend, wire APIs, and bring this to production.
>
> **Read first:** [`PRODUCT_VISION.md`](PRODUCT_VISION.md) — maps every UI feature to the product strategy. Use section refs (e.g. `§3-1`) in PRs and tickets.

---

## Quick start

```bash
cd frontend
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint
```

---

## Tech stack

### Backend

| Layer | Choice |
|-------|--------|
| Framework | PHP / Laravel |
| Database | MongoDB (via Eloquent-compatible driver) |
| Auth | OAuth (Laravel Passport or Sanctum) |
| Deployment | AWS ECS (containerized) |
| AI proxy | Laravel backend proxies Claude API calls for Aeris |
| Real-time | Polling for v1 (no WebSockets/SSE) |

### Frontend

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Components | shadcn/ui + Radix UI primitives |
| Routing | React Router DOM 7 |
| Charts | Recharts 3 + d3-scale |
| Icons | Lucide React |
| Theme | next-themes (dark mode supported) |
| Font | Geist Variable (`@fontsource-variable/geist`) |

---

## Project structure

```
frontend/src/
├── App.tsx                    # All route definitions
├── main.tsx                   # Entry point
├── index.css                  # Global styles + CSS variables
├── components/
│   ├── ui/                    # ~27 shadcn/ui primitives (don't edit these directly)
│   ├── layout/                # AppSidebar, Header, RootLayout, AIAssistantPanel
│   ├── shared/                # Reusable feature components (cards, panels, charts)
│   ├── analytics/             # Analytics-specific components
│   └── campaigns/             # Campaign-specific components
├── pages/
│   ├── Home.tsx               # Dashboard with customizable widget grid
│   ├── Inbox.tsx              # Notifications hub
│   ├── Autopilot.tsx          # Placeholder — deferred to later phase
│   ├── campaigns/             # List, Detail, Create wizard
│   ├── ai-presence/           # AI Visibility hub (7 sub-pages)
│   ├── analytics/             # Performance, Channels, Products, Audiences, Regions
│   ├── assets/                # Catalogs, Publishers
│   ├── products/              # Product list, detail, sync status
│   └── settings/              # Account, Team, AI Permissions, Integrations
├── contexts/
│   ├── AIAssistantContext.tsx  # Aeris AI panel state + mock response logic
│   └── GlobalSearchContext.tsx # Cmd+K search/command palette
├── hooks/                     # Custom hooks (campaign plan allowance, etc.)
├── lib/                       # Utilities + ALL mock data (~26 files)
│   ├── mock-data.ts           # Base stats, nav, companies, campaigns
│   ├── analytics-mock.ts      # Revenue charts, funnel data
│   ├── ai-presence-mock.ts    # Share of voice, competitors, merchant data
│   ├── assets-mock.ts         # Catalogs, publishers, product feeds
│   ├── campaign-storage.ts    # localStorage wrapper for user-created campaigns
│   ├── campaign-ai-copy-mock.ts # AI draft campaign templates
│   ├── assistant-mock.ts      # Aeris mock response templates
│   ├── optimize-mock.ts       # Content optimization opportunities
│   ├── media-plans.ts         # 3-tier pricing: Free / Starter / Enterprise
│   └── ...                    # home layout, team, inbox, region flags, search
└── types/
    └── campaign-wizard.ts     # Campaign form schema + option constants
```

---

## Route map

| Route | Page | Status |
|-------|------|--------|
| `/` | Home dashboard (widgets: Alerts, Health Score, AI Visibility, Efficiency, Campaigns) | Ready — needs real data |
| `/inbox` | Notifications & alerts | Ready — needs real data |
| `/campaigns` | Campaign list (active/paused/draft/ended) | Ready — needs real data |
| `/campaigns/:id` | Campaign detail (metrics, channel breakdown, top products) | Ready — needs real data |
| `/campaigns?create=1` | 7-step campaign wizard | **Needs backend + UI adjustments** |
| `/ai-presence` | AI Visibility overview | Ready — needs real data |
| `/ai-presence/shopping-journey` | Customer journey funnel | Ready — needs real data |
| `/ai-presence/merchants` | Merchant share & checkout | Ready — needs real data |
| `/ai-presence/attributes` | Product attribute optimization | Ready — needs real data |
| `/ai-presence/prompts` | AI search prompt insights | Ready — needs real data |
| `/ai-presence/optimize` | Content optimization recommendations | Ready — needs real data |
| `/ai-presence/auto-agent` | Automated agent recommendations | **Not ready — deferred** |
| `/ai-presence/competitors` | Competitor benchmarking + Opportunities tab | Ready — needs real data |
| `/analytics` | Performance overview (revenue, orders, ROAS) | Ready — needs real data |
| `/analytics/channels` | Channel attribution | Ready — needs real data |
| `/analytics/products` | Product-level analytics | Ready — needs real data |
| `/analytics/audiences` | Segments, intent, LTV | Ready — needs real data |
| `/analytics/regions` | Geographic performance (map) | Ready — needs real data |
| `/catalogs` | Product catalog integrations | Ready — needs real data |
| `/publishers` | Publisher connections | Ready — needs real data |
| `/products` | Product list with search/filters | Ready — needs real data |
| `/products/:id` | Product detail with performance | Ready — needs real data |
| `/products/sync` | Feed sync status | Ready — needs real data |
| `/settings` | Account, workspace, company profile, plan management | Ready — needs real data |
| `/settings/team` | Team members & roles | Ready — needs real data |
| `/settings/ai-permissions` | Aeris permission grants | **Not ready — deferred with Aeris** |
| `/settings/integrations` | Data connector setup | Ready — needs real data + OAuth flows |
| `/autopilot` | Workflow automation | **Not ready — entirely deferred** |

---

## What is NOT ready (do not build yet)

These features are **deferred to a later phase**. The UI exists as placeholder/mockup only.

### 1. Aeris AI Assistant (chat panel)
- **File:** `components/layout/AIAssistantPanel.tsx`, `contexts/AIAssistantContext.tsx`
- **Current state:** Opens via `Cmd+/`, shows mock responses from `lib/assistant-mock.ts`
- **What's missing:** Real LLM integration, conversation persistence, action execution
- **Decision:** Aeris will route through the Laravel backend (not direct frontend calls) — keeps Claude API keys server-side

### 2. Auto Agent (`/ai-presence/auto-agent`)
- **File:** `pages/ai-presence/AutoAgent.tsx`
- **Current state:** Shows mock recommendation cards (draft/review/deploy actions)
- **What's missing:** Real recommendation engine, agent execution pipeline

### 3. Autopilot (`/autopilot`)
- **File:** `pages/Autopilot.tsx`
- **Current state:** "Coming soon" placeholder with template cards
- **What's missing:** Everything — workflow builder, node system, execution engine

### 4. Campaign creation wizard (partial)
- **File:** `pages/campaigns/CampaignCreate.tsx` (68KB, 7-step wizard)
- **Current state:** Full wizard UI exists, saves to localStorage
- **What's missing:** Backend CRUD + execution pipeline. **UI may also need adjustments** — coordinate with design before building the API contract.

---

## How mock data works (what you're replacing)

All data lives in `frontend/src/lib/*-mock.ts` files. There are **zero API calls** anywhere in the frontend.

### Storage mechanisms to replace
| Mechanism | Where | Replace with |
|-----------|-------|-------------|
| Hardcoded mock arrays | `lib/mock-data.ts`, `lib/analytics-mock.ts`, etc. | API responses |
| `localStorage` | Campaign CRUD (`lib/campaign-storage.ts`, key: `commercebase_user_campaigns_v1`) | Backend API |
| `localStorage` | Home dashboard layout (`commercebase_home_layout_v1`) | User preferences API |
| `sessionStorage` | AI-drafted campaign pre-fill (`CAMPAIGN_WIZARD_AI_DRAFT_KEY`) | Keep client-side or move to draft API |
| `CustomEvent` | `commercebase-campaigns-updated` — triggers re-renders after localStorage writes | Replace with React Query / SWR cache invalidation |

### Mock data shape reference
When designing your API response schemas, match the existing TypeScript types so the frontend needs minimal changes:

- **Campaigns:** `Campaign` type in `lib/mock-data.ts` — fields: `id, name, status, spent, revenue, cvr, roas, cpc, cps, launchedAt, wizardSnapshot?`
- **Campaign wizard form:** `CampaignWizardFormData` in `types/campaign-wizard.ts` — 30+ fields covering goal, budget, products, channels, audience, creative, attribution
- **Products:** Defined inline in `lib/mock-data.ts` — `id, name, category, price, status, sales, cvr, revenue`
- **Catalogs:** `lib/assets-mock.ts` — `id, name, source, products, syncFrequency, lastSync, status, autoSync`
- **Publishers:** `lib/assets-mock.ts` — `id, name, status, checkoutShare, revenue`
- **Analytics:** Various chart data shapes in `lib/analytics-mock.ts`
- **AI Presence:** Share of voice, competitor data, merchant data in `lib/ai-presence-mock.ts`

---

## v1 priority order

Build in this order:

### Phase 1: Foundation
1. **Auth system** — OAuth-based login/registration via Laravel Passport or Sanctum. Token management, protected routes. Plan for SSO/SAML at Enterprise tier.
2. **Multi-tenancy** — One backend serving multiple brands/advertisers. The settings page already shows workspace/team management UI. Every API must be tenant-scoped.
3. **Plan-based feature gating** — 3 tiers defined in `lib/media-plans.ts`:
   - **Free** ($0/mo): 1 catalog, Realry network only, basic reporting, 1 active campaign
   - **Starter** ($1K-$10K/mo): Full publisher network, CPC+CPS hybrid, monthly reporting, 5 active campaigns
   - **Enterprise** ($100K+/mo): Dedicated team, RTB + programmatic, real-time dashboard, unlimited campaigns
   - Gate features at the API level, not just UI. The frontend already reads plan data from `media-plans.ts` and shows plan badges/upgrade prompts.

### Phase 2: API layer for existing pages
4. **Products API** — CRUD, search, category filters, sync status
5. **Catalogs API** — Manage catalog sources, sync frequency, auto-sync toggle, sync status
6. **Publishers API** — Manage publisher connections, status, checkout share, revenue attribution
7. **Analytics APIs** — Performance metrics, channel attribution, product analytics, audience segments, regional breakdown. Support date range filters (the frontend already sends `7d | 30d | 90d | custom`).
8. **AI Presence APIs** — Share of voice, competitor benchmarking, merchant checkout data, prompt insights, attributes, content optimization scores. These pages have rich mock data — see `lib/ai-presence-mock.ts` for the expected response shapes.
9. **Home dashboard API** — Aggregated widgets (alerts, health score, AI visibility score, efficiency metrics, campaign summary)
10. **Inbox/Notifications API** — Alert list with read/unread, action links

### Phase 3: Campaign management
11. **Campaign CRUD API** — Create, read, update, delete, pause, resume, duplicate
12. **Campaign execution pipeline** — Budget allocation, bid management, channel distribution
13. **Campaign analytics** — Per-campaign performance metrics, channel breakdown, top products

### Phase 4: Integrations
14. **Shopify** — Product catalog sync (priority)
15. **Google Ads** — Campaign data import/export
16. **Meta Ads** — Performance data sync
17. **Slack** — Notifications and alerts
- The Integrations page UI is at `/settings/integrations` — it shows connection cards with OAuth-style "Connect" buttons.
- **Future consideration:** Affiliate networks (Rakuten, Awin) — not required for v1 campaign or AI discovery flows, but worth designing the integration abstraction layer to accommodate them later since they feed into cross-channel attribution (§4-1).

### Phase 5: AI features (later)
15. Aeris AI assistant — LLM integration, conversation history, action execution
16. Auto Agent — Recommendation engine + automated execution
17. AI Permissions backend — Grant/revoke scoped permissions for AI actions

### Phase 6: Autopilot (later)
18. Workflow builder, execution engine, templates — entirely deferred

---

## Architecture decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| **Backend stack** | PHP / Laravel | — |
| **Database** | MongoDB | Use `jenssegers/laravel-mongodb` or similar Eloquent-compatible driver |
| **Deployment** | AWS ECS | Containerized Laravel app |
| **Auth** | OAuth | Laravel Passport or Sanctum for API tokens. Enterprise tier will likely need SSO/SAML later. |
| **Aeris routing** | Backend proxy | Frontend calls Laravel API, which proxies to Claude API. Keeps API keys server-side. |
| **Real-time data** | Polling (v1) | No WebSockets/SSE needed for v1. Simple polling for sync status and live metrics. |
| **API style** | REST | Frontend expects simple JSON responses. Laravel resource controllers are a natural fit. |

---

## Frontend patterns to know

### State management
- No global state library (no Redux, Zustand, etc.) — uses React Context + local state
- Two contexts: `AIAssistantContext` (Aeris panel) and `GlobalSearchContext` (Cmd+K)
- When adding API calls, consider React Query or SWR for caching/invalidation

### Component conventions
- shadcn/ui components in `components/ui/` — these are copy-pasted primitives, not a package. Don't edit them directly; use `npx shadcn@latest add <component>` to add new ones.
- Feature components use Tailwind utility classes directly
- CVA (Class Variance Authority) for component variants
- Responsive: standard Tailwind breakpoints (sm/md/lg/xl), mobile sidebar auto-closes

### Routing
- All routes defined in `App.tsx` using React Router v7
- Nested layouts: `AssetsLayout`, `AnalyticsLayout`, `AIPresenceLayout` wrap their sub-pages
- Legacy `/ai-visibility/*` routes redirect to `/ai-presence/*`

### Dark mode
- Handled by `next-themes` — CSS variables in `index.css` define both light and dark tokens
- Components use semantic color classes (`bg-background`, `text-foreground`, etc.)

---

## Design principles (from product vision)

Apply these when making API design decisions:

1. **Sales over clicks** — Revenue, ROAS, and conversions are primary metrics. Never lead with impressions or CTR alone.
2. **Cross-channel first** — Aggregated totals always precede per-channel breakdowns.
3. **AI explains itself** — Every AI decision or recommendation must include a reason.
4. **Reduce marketer toil** — If the user has to do something manually that the AI could do, it's a product gap.
5. **Close the loop visually** — Impression -> purchase journey should be visible, not inferred.

---

## Conventions

- Use the section references from `PRODUCT_VISION.md` (e.g. `§3-1`, `§4-2`) in PR descriptions and commit messages to tie work back to product strategy
- Keep API response shapes close to existing TypeScript types to minimize frontend refactoring
- All APIs must be tenant-scoped (multi-tenant from day 1)
- Enforce plan limits at the API level, not just the frontend
- Use Laravel API Resource classes to shape JSON responses — match the existing frontend TypeScript types
- Use Laravel Form Requests for validation on all write endpoints
- MongoDB collections should use the same field names as the frontend TypeScript interfaces where possible (e.g. `camelCase` field names via Eloquent accessors, or agree on a naming convention early)
- All environment-specific config (API keys, DB connection strings, AWS credentials) goes in `.env` — never commit secrets
