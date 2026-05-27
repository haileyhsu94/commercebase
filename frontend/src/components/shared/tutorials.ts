import type { TourStep } from "@/components/shared/SpotlightTour"

/** Mini faux-UI illustration shown on the left of the tutorial card. */
export type TutorialVisual = "metrics" | "gauge" | "list"

export interface TutorialDef {
  id: string
  /** Canonical route to open this tutorial's page — used by the Help Center. */
  path: string
  match: (pathname: string) => boolean
  title: string
  body: string
  /** Which mini illustration to render on the card (defaults to "list"). */
  visual?: TutorialVisual
  /** Optional step-by-step spotlight tour. If present, the banner gets a "Watch
   * it again" button, the tour auto-starts on first visit, and the Help Center
   * can replay it. */
  steps?: TourStep[]
}

/**
 * Per-page tutorials for dashboard-mode feature pages, keyed by route. Adding a
 * tutorial to another page is just a new entry here. Consumed by PageTutorial
 * (banner + auto-start tour) and the Help Center (list + replay).
 */
export const TUTORIALS: TutorialDef[] = [
  {
    id: "campaigns",
    path: "/campaigns",
    match: (p) => p === "/campaigns",
    title: "Launch and monitor campaigns",
    body: "Create a campaign with Aeris or the wizard, then track spend, ROAS, and orders here. Drafts resume right where you left off.",
    visual: "metrics",
    steps: [
      {
        title: "Welcome to Campaigns",
        body: "This is your campaign command center. Here's a 5-step tour of where to start and how to read it.",
      },
      {
        target: "campaigns-new",
        title: "Create a campaign",
        body: "Click New Campaign to build one step-by-step in the wizard — goal, schedule & budget, audience, creative, then review.",
      },
      {
        target: "campaigns-aeris",
        title: "Or let Aeris build it",
        body: "Prefer to describe it in plain language? Create with Aeris drafts the brief, tasks, and deliverables for you.",
      },
      {
        target: "campaigns-metrics",
        title: "Read your performance",
        body: "These cards summarize active campaigns, spend vs budget, orders, and revenue/ROAS for the selected time range. Use the range control to change the window.",
      },
      {
        target: "campaigns-table",
        title: "Manage every campaign",
        body: "Filter by status, search, and click any row to open its detail. Drafts reopen in the wizard so you can finish and launch.",
      },
    ],
  },
  {
    id: "aiv-overview",
    path: "/ai-presence",
    match: (p) => p === "/ai-presence",
    title: "Your AI visibility at a glance",
    body: "A snapshot of how AI shopping engines discover, rank, and recommend your products — start here, then dive into a specific area.",
    visual: "gauge",
    steps: [
      {
        title: "Your AI visibility, in one view",
        body: "This overview shows how AI shopping engines see your brand. Here's a quick tour of what each part means.",
      },
      {
        target: "aiv-sov",
        title: "Share of Voice (SoV)",
        body: "Your headline score — roughly what share of relevant AI shopping answers mention your catalog. Higher means AI recommends you more often.",
      },
      {
        target: "aiv-platforms",
        title: "Where you win or lag",
        body: "The same score broken down by AI platform (ChatGPT, Perplexity, Gemini, and more) so you can see which engines you're strong or weak on.",
      },
      {
        target: "aiv-kpis",
        title: "Demand, mentions & gaps",
        body: "Shopping query volume, how often you're mentioned, and missed opportunities. Click any card to drill into the detail page.",
      },
      {
        target: "aiv-recommendations",
        title: "What to do next",
        body: "AI-generated suggestions to lift your visibility — your prioritized starting points. Dig deeper in Prompts, Optimize, and Competitors.",
      },
    ],
  },
  {
    id: "aiv-shopping-journey",
    path: "/ai-presence/shopping-journey",
    match: (p) => p === "/ai-presence/shopping-journey",
    title: "Find where shoppers drop off",
    body: "Trace the path from AI discovery to checkout and spot the steps losing the most buyers, so you know what to fix first.",
    steps: [
      {
        title: "Follow the shopping journey",
        body: "See how AI-driven demand turns into purchases — and where it leaks along the way. Here's a quick tour.",
      },
      {
        target: "sj-funnel",
        title: "Discovery-to-checkout funnel",
        body: "Each stage shows how many shoppers move from AI discovery toward checkout. A sharp narrowing between two stages is a leak worth investigating.",
      },
      {
        target: "sj-dropoff",
        title: "Where shoppers drop off",
        body: "The biggest leaks, ranked by impact, each with a recommended fix. Hover a row to act on it — including Fix with Aeris.",
      },
    ],
  },
  {
    id: "aiv-merchants",
    path: "/ai-presence/merchants",
    match: (p) => p === "/ai-presence/merchants",
    title: "See who wins the click",
    body: "When AI recommends a purchase, check which merchant the shopper is sent to — and how your share compares to competitors by category and engine.",
    steps: [
      {
        title: "Who wins the AI-driven click?",
        body: "When AI engines recommend where to buy, this page shows whether shoppers land on you or a competitor. Quick tour.",
      },
      {
        target: "mr-mentions",
        title: "Mentions & sentiment",
        body: "How often AI shopping advice names your brand, and whether the tone is positive — your raw presence in the conversation.",
      },
      {
        target: "mr-checkout-share",
        title: "Merchant checkout share",
        body: "Of the shoppers AI sends to buy, what share goes to you versus rival merchants. This is the bottom-line outcome to grow.",
      },
      {
        target: "mr-by-category",
        title: "Share by category",
        body: "Your checkout share vs the top competitor in each category — a fast way to spot where you're losing ground.",
      },
      {
        target: "mr-by-engine",
        title: "Share by AI engine",
        body: "The same comparison per engine (ChatGPT, Perplexity, and more) so you can see which engines send buyers your way.",
      },
    ],
  },
  {
    id: "aiv-attributes",
    path: "/ai-presence/attributes",
    match: (p) => p === "/ai-presence/attributes",
    title: "Close your catalog data gaps",
    body: "Answer engines rely on structured product attributes — see what's covered, what's missing, and what AI is surfacing instead.",
    steps: [
      {
        title: "Make your catalog AI-readable",
        body: "AI engines lean on structured attributes (materials, fit, occasion…) to recommend products. This page shows your coverage and the gaps to close.",
      },
      {
        target: "at-coverage",
        title: "Coverage health",
        body: "Your catalog completeness, the count of high-impact gaps, and how many products are affected. Click any tile to see the full attribute breakdown.",
      },
      {
        target: "at-needs-attention",
        title: "Fix high-impact gaps first",
        body: "The missing attributes hurting AI citations most, ranked by impact — start at the top for the fastest visibility lift.",
      },
      {
        target: "at-healthy",
        title: "What's already working",
        body: "Attributes that are well-covered — AI engines can reliably use these when recommending your products.",
      },
    ],
  },
  {
    id: "aiv-prompts",
    path: "/ai-presence/prompts",
    match: (p) => p === "/ai-presence/prompts",
    title: "Track the prompts that matter",
    body: "Monitor shopping prompts by volume and trend, see your share of voice per AI engine, and pick up recommended fixes to climb the rankings.",
    steps: [
      {
        title: "Win the shopping prompts",
        body: "These are the questions shoppers ask AI engines. This page shows where you rank and how to climb. Quick tour.",
      },
      {
        target: "pr-action-queue",
        title: "Your action queue",
        body: "The highest-opportunity prompts, each with one recommended fix. Hit Fix with Aeris to act, or View detail to dig in.",
      },
      {
        target: "pr-explore",
        title: "Explore every prompt",
        body: "The full list with share of voice, the gap to the leader, and the engine mix. Expand any row for detail and recommended fixes.",
      },
    ],
  },
  {
    id: "aiv-optimize",
    path: "/ai-presence/optimize",
    match: (p) => p === "/ai-presence/optimize",
    title: "Boost SEO & GEO",
    body: "Review your SEO and Generative Engine Optimization scores, citations, and technical/content gaps, then work the highest-impact items.",
    visual: "gauge",
    steps: [
      {
        title: "Lift your SEO & GEO",
        body: "SEO is how traditional search finds you; GEO (Generative Engine Optimization) is how AI engines read and cite you. Here's where to improve both.",
      },
      {
        target: "opt-snapshot",
        title: "Your optimization snapshot",
        body: "Combined SEO and GEO scores at a glance — your starting point and how much headroom you have.",
      },
      {
        target: "opt-geo-citations",
        title: "AI engine citation status",
        body: "Whether each AI engine can actually cite your content today, and where citations are blocked — the heart of GEO.",
      },
      {
        target: "opt-products",
        title: "Scores by product",
        body: "SEO and GEO scores for individual products, ranked by revenue — fix your top earners first for the biggest payoff.",
      },
      {
        target: "opt-content-gaps",
        title: "Content gaps to fill",
        body: "The content types AI engines look for but can't find on your site. Filling these is often the fastest visibility win.",
      },
      {
        target: "opt-technical",
        title: "Technical audit",
        body: "Crawlability and schema issues that stop AI from reading your pages. Clear these so everything above can take effect.",
      },
    ],
  },
  {
    id: "aiv-auto-agent",
    path: "/ai-presence/auto-agent",
    match: (p) => p === "/ai-presence/auto-agent",
    title: "Let the agent optimize for you",
    body: "Background SEO & GEO improvements are generated from your catalog signals — review the queue, see projected impact, and keep control of what ships.",
    steps: [
      {
        title: "Meet your optimization agent",
        body: "It works in the background to improve your SEO & GEO from catalog signals — and you stay in control of what ships. Quick tour.",
      },
      {
        target: "aa-mode",
        title: "You set the autonomy level",
        body: "This shows the agent's current mode. On 'Suggest only', nothing changes without your approval. Tune what it's allowed to do under Manage permissions.",
      },
      {
        target: "aa-delivered",
        title: "What it's delivered",
        body: "Measured improvements from changes you've already approved — the agent's track record so far.",
      },
      {
        target: "aa-pending",
        title: "Approve what ships",
        body: "Drafts wait here for you. Review each one and Approve or reject — nothing goes live until you say so. Approve all when you're confident.",
      },
      {
        target: "aa-pipeline",
        title: "What's coming next",
        body: "Changes the agent is preparing. Everything routes through Pending review first, so there are no surprises.",
      },
    ],
  },
  {
    id: "aiv-competitors",
    path: "/ai-presence/competitors",
    match: (p) => p === "/ai-presence/competitors",
    title: "Win share of voice",
    body: "Compare your Share of Voice against competitors across AI platforms and act on the biggest gaps — all in one place.",
    visual: "gauge",
    steps: [
      {
        title: "Size up the competition",
        body: "See how you stack up against rivals in AI answers — then jump to the gaps you can win. Quick tour.",
      },
      {
        target: "ci-leaderboard",
        title: "Share-of-Voice leaderboard",
        body: "Where you rank against competitors for AI shopping answers in your category — your overall standing at a glance.",
        navigateTo: "/ai-presence/competitors",
      },
      {
        target: "ci-platform",
        title: "Platform comparison",
        body: "The same head-to-head broken down by AI engine, so you can see which platforms a competitor is beating you on.",
      },
      {
        target: "ci-query",
        title: "Query-level comparison",
        body: "Go prompt-by-prompt against a chosen competitor to find the exact queries where you're losing ground.",
      },
      {
        target: "ci-opps-tab",
        title: "Now find the gaps",
        body: "Those were the head-to-head views. The Opportunities tab surfaces queries where you're losing — we'll switch you there next.",
      },
      {
        target: "ci-opportunities",
        title: "Find the gaps",
        body: "High-value queries where you're absent or weak — ranked by impact, each with a fix you can act on.",
        navigateTo: "/ai-presence/competitors?tab=opportunities",
      },
    ],
  },
  {
    id: "assets-catalogs",
    path: "/catalogs",
    match: (p) => /^\/catalogs(\/|$)/.test(p),
    title: "Keep your catalog in sync",
    body: "Connect product feeds, watch sync health, and clear the issues that block products from showing in ads and AI answers.",
    steps: [
      {
        title: "Your product catalog",
        body: "Everything campaigns and AI answers can show comes from here. Let's look at feeds, sync, and the issues to fix.",
      },
      {
        target: "cat-metrics",
        title: "Catalog at a glance",
        body: "Total products, sync health, and revenue at risk from feed problems — your headline numbers.",
      },
      {
        target: "cat-feeds",
        title: "Product feeds & sync",
        body: "Each connected platform with its last and next sync. Sync a single feed with 'Sync now', or refresh everything with 'Sync all'.",
      },
      {
        target: "cat-issues",
        title: "Fix feed issues",
        body: "Products blocked or suppressed because of missing attributes. Clearing these is the fastest way to put more inventory in front of shoppers.",
      },
    ],
  },
  {
    id: "assets",
    path: "/publishers",
    match: (p) => /^\/(publishers|products)(\/|$)/.test(p),
    title: "Publishers & products",
    body: "Review where your ads can run across the publisher network and the product inventory campaigns draw from.",
  },
]
