/** Mock data for AI Visibility — commerce-first (merchants, journey, catalog) */

export type AiVisibilitySubnavItem = { path: string; label: string }

export type AiVisibilitySubnavGroup = {
  groupLabel: string
  items: readonly AiVisibilitySubnavItem[]
}

/** Logical groups (ordering / docs). UI uses {@link aiPresenceSubnav} flat list. */
export const aiVisibilitySubnavGroups: readonly AiVisibilitySubnavGroup[] = [
  {
    groupLabel: "Journey & discovery",
    items: [
      { path: "", label: "Overview" },
      { path: "shopping-journey", label: "Shopping Journey" },
      { path: "merchants", label: "Merchants" },
    ],
  },
  {
    groupLabel: "Catalog & prompts",
    items: [
      { path: "attributes", label: "Attributes" },
      { path: "prompts", label: "Prompts" },
    ],
  },
  {
    groupLabel: "Growth & market",
    items: [
      { path: "optimize", label: "SEO / GEO" },
      { path: "auto-agent", label: "Auto Agent" },
      { path: "competitors", label: "Competitors" },
      { path: "opportunities", label: "Opportunities" },
    ],
  },
] as const

/** Flat list derived from groups — for code that iterates all routes in order. */
export const aiPresenceSubnav: readonly AiVisibilitySubnavItem[] =
  aiVisibilitySubnavGroups.flatMap((g) => [...g.items])

/** Path segment after `/ai-presence/` — `""` for overview. */
export function aiVisibilityPathSegment(pathname: string): string {
  const n = pathname.replace(/\/$/, "") || pathname
  if (n === "/ai-presence") return ""
  return n.replace(/^\/ai-presence\/?/, "")
}

/** Breadcrumb / H1 label for the active /ai-presence/* section. */
export function aiVisibilitySectionLabel(pathname: string): string {
  const seg = aiVisibilityPathSegment(pathname)
  if (seg === "") return "Overview"
  const found = aiPresenceSubnav.find((i) => i.path === seg)
  return found?.label ?? seg
}

/** Intro copy for the layout header — keyed by subnav path segment (see {@link aiPresenceSubnav}). */
export const aiVisibilityPageDescriptions: Record<string, string> = {
  "": "How AI shopping engines see and recommend your products",
  "shopping-journey":
    "Funnel from AI discovery to checkout—where shoppers drop off before they buy.",
  merchants:
    "When AI engines recommend purchasing, which merchant gets the click? Track share of checkout destination vs competitors, by category and by AI engine.",
  attributes:
    "Structured catalog data that answer engines rely on—coverage and gaps vs what AI surfaces.",
  prompts:
    "Shopping prompts with volume, trends, leader gap, engine-level SoV, and recommended fixes—filter and expand rows for detail.",
  optimize:
    "SEO and Generative Engine Optimization (GEO): scores, trends, citations, technical audits, and content gaps.",
  "auto-agent":
    "Background SEO & GEO optimization from your catalog signals—queue, impact, and controls.",
  competitors: "Compare share of voice (SoV) against competitors across AI platforms.",
  opportunities: "Discover gaps and get recommendations to improve your SoV.",
}

export function aiVisibilityPageDescription(pathname: string): string {
  const seg = aiVisibilityPathSegment(pathname)
  return aiVisibilityPageDescriptions[seg] ?? aiVisibilityPageDescriptions[""]!
}

export interface MerchantCheckoutRow {
  merchant: string
  isYou?: boolean
  share: number
  estCheckouts: string
  change: number
}

export const merchantCheckoutShare: MerchantCheckoutRow[] = [
  { merchant: "Realry", isYou: true, share: 24, estCheckouts: "2.1K", change: 5.2 },
  { merchant: "Farfetch", share: 18, estCheckouts: "1.6K", change: 2.1 },
  { merchant: "SSENSE", share: 15, estCheckouts: "1.3K", change: -1.3 },
  { merchant: "NET-A-PORTER", share: 12, estCheckouts: "1.1K", change: 0.8 },
  { merchant: "StockX", share: 11, estCheckouts: "983", change: 3.4 },
  { merchant: "Nike Direct", share: 10, estCheckouts: "894", change: -2.1 },
  { merchant: "Others", share: 10, estCheckouts: "893", change: -0.4 },
]

export interface CategoryShareRow {
  category: string
  topCompetitor: string
  youPct: number
  competitorPct: number
}

export const merchantCategoryShare: CategoryShareRow[] = [
  { category: "Sneakers", topCompetitor: "StockX", youPct: 32, competitorPct: 28 },
  { category: "Luxury Bags", topCompetitor: "Farfetch", youPct: 18, competitorPct: 31 },
  { category: "Streetwear", topCompetitor: "SSENSE", youPct: 22, competitorPct: 26 },
  { category: "Outerwear", topCompetitor: "NET-A-PORTER", youPct: 14, competitorPct: 24 },
  { category: "Footwear", topCompetitor: "Nike Direct", youPct: 28, competitorPct: 22 },
]

/** Engine-level merchant share — aligns with platform list in mock-data */
export interface EngineMerchantShare {
  name: string
  shortName: string
  iconSlug: string
  color: string
  topCompetitor: string
  competitorShare: number
  yourShare: number
}

export const engineMerchantShare: EngineMerchantShare[] = [
  {
    name: "ChatGPT",
    shortName: "C",
    iconSlug: "openai",
    color: "bg-green-500",
    topCompetitor: "Farfetch",
    competitorShare: 22,
    yourShare: 28,
  },
  {
    name: "Perplexity",
    shortName: "P",
    iconSlug: "perplexity",
    color: "bg-purple-500",
    topCompetitor: "SSENSE",
    competitorShare: 19,
    yourShare: 31,
  },
  {
    name: "Gemini",
    shortName: "G",
    iconSlug: "googlegemini",
    color: "bg-blue-500",
    topCompetitor: "NET-A-PORTER",
    competitorShare: 24,
    yourShare: 19,
  },
  {
    name: "Claude",
    shortName: "C",
    iconSlug: "anthropic",
    color: "bg-orange-500",
    topCompetitor: "Farfetch",
    competitorShare: 20,
    yourShare: 22,
  },
  {
    name: "Copilot",
    shortName: "C",
    iconSlug: "githubcopilot",
    color: "bg-cyan-500",
    topCompetitor: "StockX",
    competitorShare: 25,
    yourShare: 15,
  },
  {
    name: "Grok",
    shortName: "X",
    iconSlug: "x",
    color: "bg-zinc-900",
    topCompetitor: "Farfetch",
    competitorShare: 21,
    yourShare: 20,
  },
]

export interface ShoppingJourneyStep {
  id: string
  label: string
  description: string
  ratePct: number
  volume?: number
  change?: string
  changeTrend?: "up" | "down" | "neutral"
}

export interface ShoppingJourneyInsight {
  stageId: string
  dropOffPct: number | null
  headline: string
  detail: string
  actionLabel: string
  actionHref: string
  severity: "critical" | "warning" | "info"
}

/** Base data for 28-day window */
const _baseJourneySteps: ShoppingJourneyStep[] = [
  {
    id: "discover",
    label: "AI discovery",
    description: "Shoppers see your brand or products in AI answers",
    ratePct: 100,
    volume: 42500,
    change: "+12%",
    changeTrend: "up",
  },
  {
    id: "consider",
    label: "Consideration",
    description: "Users compare options the assistant surfaces",
    ratePct: 64,
    volume: 27200,
    change: "+8.3%",
    changeTrend: "up",
  },
  {
    id: "click",
    label: "Click-through",
    description: "Clicks to your site or PDP from the assistant",
    ratePct: 41,
    volume: 17425,
    change: "−2.1%",
    changeTrend: "down",
  },
  {
    id: "cart",
    label: "Cart / intent",
    description: "Add-to-cart or strong purchase intent signals",
    ratePct: 18,
    volume: 7650,
    change: "+5.7%",
    changeTrend: "up",
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "Completed purchases attributed to AI-assisted journeys",
    ratePct: 11,
    volume: 4675,
    change: "+14.2%",
    changeTrend: "up",
  },
]

/** Static export for legacy use */
export const shoppingJourneySteps: ShoppingJourneyStep[] = _baseJourneySteps

type TimePreset = "7d" | "14d" | "28d"

const JOURNEY_VOLUME_SCALE: Record<TimePreset, number> = {
  "7d": 0.28,
  "14d": 0.52,
  "28d": 1,
}

const JOURNEY_CHANGE_OVERRIDES: Record<
  TimePreset,
  { change: string; changeTrend: "up" | "down" | "neutral" }[]
> = {
  "7d": [
    { change: "+18%", changeTrend: "up" },
    { change: "+11%", changeTrend: "up" },
    { change: "−4.8%", changeTrend: "down" },
    { change: "+3.2%", changeTrend: "up" },
    { change: "+9.1%", changeTrend: "up" },
  ],
  "14d": [
    { change: "+15%", changeTrend: "up" },
    { change: "+9.7%", changeTrend: "up" },
    { change: "−3.4%", changeTrend: "down" },
    { change: "+4.5%", changeTrend: "up" },
    { change: "+11.8%", changeTrend: "up" },
  ],
  "28d": [
    { change: "+12%", changeTrend: "up" },
    { change: "+8.3%", changeTrend: "up" },
    { change: "−2.1%", changeTrend: "down" },
    { change: "+5.7%", changeTrend: "up" },
    { change: "+14.2%", changeTrend: "up" },
  ],
}

export function getShoppingJourneySteps(
  range: { kind: "preset"; preset: string } | { kind: "custom"; from: string; to: string }
): ShoppingJourneyStep[] {
  const preset = range.kind === "preset" ? (range.preset as TimePreset) : null
  const scale = preset ? JOURNEY_VOLUME_SCALE[preset] ?? 1 : 0.7
  const changes = preset ? JOURNEY_CHANGE_OVERRIDES[preset] : undefined

  return _baseJourneySteps.map((step, i) => ({
    ...step,
    volume: Math.round((step.volume ?? 0) * scale),
    ...(changes?.[i] ?? {}),
  }))
}

export function getShoppingJourneyInsights(steps: ShoppingJourneyStep[]): ShoppingJourneyInsight[] {
  const insights: ShoppingJourneyInsight[] = []

  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1]
    const curr = steps[i]
    const dropOff = Math.round(100 - (curr.ratePct / prev.ratePct) * 100)
    const lostVolume = (prev.volume ?? 0) - (curr.volume ?? 0)

    const template = STAGE_INSIGHT_TEMPLATES[curr.id]
    if (template) {
      insights.push({
        stageId: curr.id,
        dropOffPct: dropOff,
        headline: template.headline(dropOff, lostVolume),
        detail: template.detail,
        actionLabel: template.actionLabel,
        actionHref: template.actionHref,
        severity: dropOff > 50 ? "critical" : dropOff > 30 ? "warning" : "info",
      })
    }
  }

  return insights
}

const STAGE_INSIGHT_TEMPLATES: Record<
  string,
  {
    headline: (drop: number, lost: number) => string
    detail: string
    actionLabel: string
    actionHref: string
  }
> = {
  consider: {
    headline: (drop, lost) =>
      `${drop}% drop at Consideration — ${lost.toLocaleString()} shoppers lost`,
    detail:
      "AI engines mention your brand but don't include enough detail for comparison. 3 attributes (sustainability claims, availability, reviews) have coverage gaps that limit what AI can say about your products.",
    actionLabel: "Review attribute gaps",
    actionHref: "/ai-presence/attributes?highlight=coverage",
  },
  click: {
    headline: (drop, lost) =>
      `${drop}% drop at Click-through — ${lost.toLocaleString()} shoppers lost`,
    detail:
      "Shoppers compare your products in AI answers but click competitor links instead. Your SEO/GEO combined score is 62 — improving structured data and content gaps can lift your click share.",
    actionLabel: "Optimize SEO / GEO",
    actionHref: "/ai-presence/optimize?highlight=scores",
  },
  cart: {
    headline: (drop, lost) =>
      `${drop}% drop at Cart — ${lost.toLocaleString()} shoppers lost`,
    detail:
      "Visitors land on your site from AI referrals but don't add to cart. This often means a mismatch between what the AI promised and what the PDP shows. Check which prompts drive this traffic and align your content.",
    actionLabel: "Review top prompts",
    actionHref: "/ai-presence/prompts?highlight=actions",
  },
  checkout: {
    headline: (drop, lost) =>
      `${drop}% drop at Checkout — ${lost.toLocaleString()} shoppers lost`,
    detail:
      "Shoppers with cart intent drop off before purchase. AI engines may surface competitor checkout links. Your merchant checkout share is 24% — review which competitors capture the remaining 76%.",
    actionLabel: "Check merchant share",
    actionHref: "/ai-presence/merchants?highlight=share",
  },
}

export interface AttributeCoverageRow {
  attribute: string
  coveragePct: number
  gap: boolean
  /** How much this attribute affects AI recommendation quality (high / medium / low) */
  aiImpact: "high" | "medium" | "low"
  /** Number of SKUs missing this attribute */
  missingSKUs: number
  /** Why this gap matters for AI recommendations */
  whyItMatters?: string
}

export const attributeCoverage: AttributeCoverageRow[] = [
  { attribute: "Size & fit", coveragePct: 94, gap: false, aiImpact: "high", missingSKUs: 48 },
  { attribute: "Materials & care", coveragePct: 88, gap: false, aiImpact: "medium", missingSKUs: 96 },
  {
    attribute: "Sustainability claims",
    coveragePct: 52,
    gap: true,
    aiImpact: "high",
    missingSKUs: 384,
    whyItMatters: "AI engines often infer sustainability from unstructured text and get it wrong. Add structured data to control the narrative.",
  },
  { attribute: "Price & currency", coveragePct: 97, gap: false, aiImpact: "high", missingSKUs: 24 },
  {
    attribute: "Availability / ships to",
    coveragePct: 71,
    gap: true,
    aiImpact: "medium",
    missingSKUs: 232,
    whyItMatters: "Without this, AI may recommend your products to shoppers in regions you don't serve, driving clicks that can't convert.",
  },
  {
    attribute: "Reviews aggregate",
    coveragePct: 63,
    gap: true,
    aiImpact: "high",
    missingSKUs: 296,
    whyItMatters: "AI engines heavily weight review signals when ranking products. Missing this reduces how often your products get cited.",
  },
]

export type PromptIntent = "commercial" | "comparison" | "navigational" | "informational"
export type PromptPlacement = "top3" | "lower" | "mixed"
export type PromptImpact = "high" | "medium" | "low"
export type ShoppingJourneyStage = "awareness" | "consideration" | "decision"

export interface PromptInsightRow {
  id: string
  prompt: string
  category: string
  intent: PromptIntent
  /** Display e.g. "42K/wk" */
  volume: string
  /** Thousands of weekly queries — for sort / filter */
  volumeKPerWeek: number
  /** WoW volume change % */
  volumeTrendPctWoW: number
  /** Your aggregate SoV % across engines (headline) */
  visibility: number
  /** WoW change in pts */
  visibilityDeltaWoW: number
  trend: "up" | "down" | "flat"
  leader: string
  leaderVisibility: number
  gapVsLeader: number
  opportunityScore: number
  placement: PromptPlacement
  sovChatgpt: number
  sovPerplexity: number
  sovGoogleAi: number
  recommendedFix: string
  affectedSkusApprox: number
  impact: PromptImpact
  sampleAnswerLine: string
  lastUpdated: string
  shoppingJourneyStage: ShoppingJourneyStage
}

/** @deprecated Use {@link PromptInsightRow} */
export type PromptVolumeRow = Pick<
  PromptInsightRow,
  "prompt" | "volume" | "visibility" | "trend"
>

export const promptInsights: PromptInsightRow[] = [
  {
    id: "p1",
    prompt: "best white sneakers under $200",
    category: "Sneakers",
    intent: "commercial",
    volume: "42K/wk",
    volumeKPerWeek: 42,
    volumeTrendPctWoW: 12,
    visibility: 38,
    visibilityDeltaWoW: 4,
    trend: "up",
    leader: "StockX",
    leaderVisibility: 61,
    gapVsLeader: 23,
    opportunityScore: 966,
    placement: "mixed",
    sovChatgpt: 41,
    sovPerplexity: 35,
    sovGoogleAi: 38,
    recommendedFix: "Add comparison bullets and price band copy on top sneaker PDPs; align with this query in FAQ.",
    affectedSkusApprox: 34,
    impact: "high",
    sampleAnswerLine: "Popular picks under $200 include Nike Air Force 1, Adidas Samba, and New Balance 550…",
    lastUpdated: "2026-03-30",
    shoppingJourneyStage: "consideration",
  },
  {
    id: "p2",
    prompt: "luxury tote bags similar to [brand]",
    category: "Bags",
    intent: "comparison",
    volume: "28K/wk",
    volumeKPerWeek: 28,
    volumeTrendPctWoW: -3,
    visibility: 22,
    visibilityDeltaWoW: -5,
    trend: "down",
    leader: "Farfetch",
    leaderVisibility: 58,
    gapVsLeader: 36,
    opportunityScore: 1008,
    placement: "lower",
    sovChatgpt: 24,
    sovPerplexity: 19,
    sovGoogleAi: 23,
    recommendedFix: "Structured similar-to attributes and brand-comparison modules on luxury bag PDPs.",
    affectedSkusApprox: 56,
    impact: "high",
    sampleAnswerLine: "For a similar look to [brand], retailers like Farfetch and SSENSE carry…",
    lastUpdated: "2026-03-29",
    shoppingJourneyStage: "consideration",
  },
  {
    id: "p3",
    prompt: "sustainable winter coat brands",
    category: "Outerwear",
    intent: "informational",
    volume: "19K/wk",
    volumeKPerWeek: 19,
    volumeTrendPctWoW: 22,
    visibility: 15,
    visibilityDeltaWoW: 2,
    trend: "up",
    leader: "Patagonia",
    leaderVisibility: 47,
    gapVsLeader: 32,
    opportunityScore: 608,
    placement: "lower",
    sovChatgpt: 18,
    sovPerplexity: 12,
    sovGoogleAi: 15,
    recommendedFix: "Publish sustainability proof points (materials, certifications) in schema and PDP body.",
    affectedSkusApprox: 41,
    impact: "medium",
    sampleAnswerLine: "Brands often cited for sustainable coats include Patagonia, Arc'teryx, and…",
    lastUpdated: "2026-03-28",
    shoppingJourneyStage: "awareness",
  },
  {
    id: "p4",
    prompt: "where to buy limited sneakers",
    category: "Sneakers",
    intent: "navigational",
    volume: "61K/wk",
    volumeKPerWeek: 61,
    volumeTrendPctWoW: 8,
    visibility: 51,
    visibilityDeltaWoW: 1,
    trend: "flat",
    leader: "StockX",
    leaderVisibility: 64,
    gapVsLeader: 13,
    opportunityScore: 793,
    placement: "top3",
    sovChatgpt: 54,
    sovPerplexity: 48,
    sovGoogleAi: 51,
    recommendedFix: "Strengthen availability and authenticity signals; link drops calendar to PDP.",
    affectedSkusApprox: 28,
    impact: "high",
    sampleAnswerLine: "Limited releases are commonly available on StockX, GOAT, and select brand sites…",
    lastUpdated: "2026-03-30",
    shoppingJourneyStage: "decision",
  },
  {
    id: "p5",
    prompt: "designer sale mens jackets",
    category: "Outerwear",
    intent: "commercial",
    volume: "12K/wk",
    volumeKPerWeek: 12,
    volumeTrendPctWoW: 5,
    visibility: 44,
    visibilityDeltaWoW: 6,
    trend: "up",
    leader: "SSENSE",
    leaderVisibility: 52,
    gapVsLeader: 8,
    opportunityScore: 96,
    placement: "mixed",
    sovChatgpt: 46,
    sovPerplexity: 42,
    sovGoogleAi: 44,
    recommendedFix: "Surface sale price and compare-at in feed + Product schema for jacket SKUs.",
    affectedSkusApprox: 62,
    impact: "medium",
    sampleAnswerLine: "End-of-season sales often feature SSENSE, Mr Porter, and department stores…",
    lastUpdated: "2026-03-27",
    shoppingJourneyStage: "consideration",
  },
  {
    id: "p6",
    prompt: "Italian leather handbag under $500",
    category: "Bags",
    intent: "commercial",
    volume: "33K/wk",
    volumeKPerWeek: 33,
    volumeTrendPctWoW: 15,
    visibility: 19,
    visibilityDeltaWoW: -2,
    trend: "down",
    leader: "NET-A-PORTER",
    leaderVisibility: 55,
    gapVsLeader: 36,
    opportunityScore: 1188,
    placement: "lower",
    sovChatgpt: 21,
    sovPerplexity: 17,
    sovGoogleAi: 19,
    recommendedFix: "Add material origin + price ladder content; target this band in prompts feed.",
    affectedSkusApprox: 48,
    impact: "high",
    sampleAnswerLine: "Under $500, shoppers often see Coach, Tory Burch, and contemporary Italian brands…",
    lastUpdated: "2026-03-30",
    shoppingJourneyStage: "consideration",
  },
  {
    id: "p7",
    prompt: "how to spot fake luxury sneakers",
    category: "Sneakers",
    intent: "informational",
    volume: "8K/wk",
    volumeKPerWeek: 8,
    volumeTrendPctWoW: 3,
    visibility: 27,
    visibilityDeltaWoW: 3,
    trend: "up",
    leader: "YouTube / guides",
    leaderVisibility: 40,
    gapVsLeader: 13,
    opportunityScore: 104,
    placement: "mixed",
    sovChatgpt: 29,
    sovPerplexity: 25,
    sovGoogleAi: 27,
    recommendedFix: "Publish authenticity checklist + imagery on Help center and link from PDP.",
    affectedSkusApprox: 0,
    impact: "low",
    sampleAnswerLine: "Guides typically mention box labels, stitching, and SKU verification…",
    lastUpdated: "2026-03-25",
    shoppingJourneyStage: "awareness",
  },
  {
    id: "p8",
    prompt: "best running shoes for marathon training",
    category: "Sneakers",
    intent: "comparison",
    volume: "25K/wk",
    volumeKPerWeek: 25,
    volumeTrendPctWoW: -1,
    visibility: 31,
    visibilityDeltaWoW: 0,
    trend: "flat",
    leader: "Nike Direct",
    leaderVisibility: 49,
    gapVsLeader: 18,
    opportunityScore: 450,
    placement: "lower",
    sovChatgpt: 33,
    sovPerplexity: 30,
    sovGoogleAi: 31,
    recommendedFix: "Add use-case tags (marathon, cushioning) to running SKUs and comparison guides.",
    affectedSkusApprox: 19,
    impact: "medium",
    sampleAnswerLine: "Common recommendations include Nike Alphafly, Adidas Adios, and…",
    lastUpdated: "2026-03-29",
    shoppingJourneyStage: "consideration",
  },
]

/** Legacy export — same rows as {@link promptInsights} for older imports */
export const promptVolumes: PromptInsightRow[] = promptInsights

export interface SeoGeoRow {
  region: string
  code: string
  aiVisibility: number
  classicSerp: number
}

export const seoGeoRows: SeoGeoRow[] = [
  { region: "United States", code: "US", aiVisibility: 62, classicSerp: 58 },
  { region: "United Kingdom", code: "GB", aiVisibility: 55, classicSerp: 61 },
  { region: "Germany", code: "DE", aiVisibility: 48, classicSerp: 52 },
  { region: "Japan", code: "JP", aiVisibility: 41, classicSerp: 47 },
  { region: "France", code: "FR", aiVisibility: 44, classicSerp: 49 },
]

/** Minimal v1 Auto Agent — headline stats + current run + impact + queue */

export interface AutoAgentSummary {
  stateLabel: string
  subtitle: string
  actionsToday: number
  actionsDeltaVsYesterday: string
  seoImprovementPtsVsWeek: number
  geoImprovementPtsVsWeek: number
  citationsLiftPct: number
  queueItems: number
  queueEtaMinutes: number
  nextRunLabel: string
}

export interface AutoAgentCurrentRun {
  taskTitle: string
  productName: string
  sku: string
  current: number
  total: number
  progressPct: number
}

export interface AutoAgentImpactMetric {
  label: string
  before: string
  after: string
  deltaLabel: string
}

export type AutoAgentQueueStatus = "running" | "queued" | "skipped"

export type AutoAgentPriority = "high" | "medium" | "low"

export interface AutoAgentQueueTask {
  id: string
  title: string
  description: string
  priority: AutoAgentPriority
  status: AutoAgentQueueStatus
  progressPct?: number
  itemCount?: number
  totalItems?: number
  etaMinutes?: number | null
}

export const autoAgentSummary: AutoAgentSummary = {
  stateLabel: "Agent running",
  subtitle: "Autonomous SEO & GEO optimization — runs continuously in the background.",
  actionsToday: 47,
  actionsDeltaVsYesterday: "+12",
  seoImprovementPtsVsWeek: 7,
  geoImprovementPtsVsWeek: 16,
  citationsLiftPct: 46,
  queueItems: 595,
  queueEtaMinutes: 71,
  nextRunLabel: "Tonight 2:00 AM",
}

export const autoAgentCurrentRun: AutoAgentCurrentRun = {
  taskTitle: "Description Expansion",
  productName: "Nike Air Max 97 Silver Bullet",
  sku: "NK-AM97-SB",
  current: 42,
  total: 124,
  progressPct: 34,
}

export const autoAgentImpactMetrics: AutoAgentImpactMetric[] = [
  { label: "SEO score", before: "65", after: "72", deltaLabel: "+7 pts" },
  { label: "GEO score", before: "42", after: "58", deltaLabel: "+16 pts" },
  { label: "AI citations", before: "650", after: "950", deltaLabel: "+46%" },
  { label: "Schema coverage", before: "41%", after: "68%", deltaLabel: "+27%" },
]

export const autoAgentQueueTasks: AutoAgentQueueTask[] = [
  {
    id: "q1",
    title: "Description Expansion",
    description: "Expand thin product descriptions (<50 words) with AI-generated rich content",
    priority: "high",
    status: "running",
    progressPct: 34,
    itemCount: 42,
    totalItems: 124,
    etaMinutes: null,
  },
  {
    id: "q2",
    title: "Schema Markup",
    description: "Product + offer JSON-LD for flagged SKUs",
    priority: "high",
    status: "queued",
    itemCount: 47,
    etaMinutes: 6,
  },
  {
    id: "q3",
    title: "FAQ Generation",
    description: "Category-level FAQ blocks for AI surfaces",
    priority: "high",
    status: "queued",
    itemCount: 12,
    etaMinutes: 22,
  },
  {
    id: "q4",
    title: "Image Alt Text",
    description: "Descriptive alts for gallery images missing text",
    priority: "medium",
    status: "queued",
    itemCount: 89,
    etaMinutes: 8,
  },
  {
    id: "q5",
    title: "Feed Sync Optimization",
    description: "Refresh merchant feeds after enrichment",
    priority: "medium",
    status: "queued",
    itemCount: 318,
    etaMinutes: 3,
  },
  {
    id: "q6",
    title: "Comparison Content",
    description: "Buying guides for high-intent categories",
    priority: "medium",
    status: "skipped",
    etaMinutes: null,
  },
]
