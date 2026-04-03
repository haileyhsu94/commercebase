/** Mock data for AI Presence → Optimize (SEO + GEO health) — benchmarked to product UX */

export const optimizationScores = {
  combined: 72,
  seo: 58,
  geo: 64,
  combinedLabel: "Combined",
  seoLabel: "SEO Score",
  geoLabel: "GEO Score",
  seoSub: "Traditional Search",
  geoSub: "AI Engines",
} as const

export const scoreTrendData = [
  { date: "Mar 3", seo: 52, geo: 58 },
  { date: "Mar 10", seo: 54, geo: 59 },
  { date: "Mar 17", seo: 55, geo: 61 },
  { date: "Mar 24", seo: 56, geo: 62 },
  { date: "Mar 31", seo: 57, geo: 63 },
  { date: "Apr 7", seo: 58, geo: 64 },
]

export const optimizeKpis = [
  { label: "Google Indexed", value: "2,847", delta: "+124 this week", trend: "up" as const },
  { label: "AI Citations", value: "950", delta: "+18% WoW", trend: "up" as const },
  { label: "Schema Coverage", value: "68%", delta: "47 missing", trend: "neutral" as const },
]

export interface TrendingTopic {
  rank: number
  title: string
  badge: string
  source: string
  /** Opens in new tab — subreddit, report, or article (mock) */
  sourceUrl?: string
  quote: string
  action: string
  tone: "hot" | "risk" | "watch"
}

export const trendingTopics: TrendingTopic[] = [
  {
    rank: 1,
    title: "Zero-Click Search is killing organic traffic",
    badge: "GEO",
    source: "r/SEO · 4,200+ upvotes",
    sourceUrl: "https://www.reddit.com/r/SEO/",
    quote:
      "Google #1 ranking but traffic dropped 40%. AI is citing my content without sending clicks.",
    action: "Add AI-citeable summaries to your product pages to capture zero-click visibility",
    tone: "hot",
  },
  {
    rank: 2,
    title: "ChatGPT Shopping is 4,700% up YoY",
    badge: "SEO+GEO",
    source: "Adobe Analytics · Industry-wide stat",
    sourceUrl: "https://business.adobe.com/blog/basics/analytics",
    quote:
      "AI-driven shopping traffic surged 4,700% year-over-year. Fashion seeing highest CVR at 2.4%.",
    action: "Your ChatGPT visibility (78%) is your strongest channel — double down on structured data",
    tone: "hot",
  },
  {
    rank: 3,
    title: "Reddit is now the #1 AI citation source",
    badge: "GEO",
    source: "Tinuiti Q1 2026 · 24% of all Perplexity citations",
    sourceUrl: "https://tinuiti.com/blog/",
    quote:
      "Brands already mentioned in Reddit threads get cited for free. Brands not there are invisible.",
    action: "Seed Reddit threads with authentic product reviews in r/FashionReps, r/Sneakers, r/femalefashionadvice",
    tone: "hot",
  },
  {
    rank: 4,
    title: '"Best luxury sneakers under $300" — AI gap query',
    badge: "SEO",
    source: "r/Sneakers + ChatGPT · 42.5K queries/week",
    sourceUrl: "https://www.reddit.com/r/Sneakers/",
    quote:
      'I asked ChatGPT for luxury sneakers under $300 and it only showed Farfetch. Why isn\'t Realry here?',
    action: "Create a dedicated buying guide targeting this query — currently won by Farfetch",
    tone: "risk",
  },
  {
    rank: 5,
    title: "Perplexity Shopping — 0% commission window",
    badge: "GEO",
    source: "BigCommerce Report · Growing fast",
    sourceUrl: "https://www.bigcommerce.com/blog/",
    quote:
      "Perplexity Shopping is currently free for merchants. Early movers get free traffic + citations.",
    action:
      "Perplexity citation rate (17.4%) is your best engine — optimize feed before commission kicks in",
    tone: "watch",
  },
  {
    rank: 6,
    title: "AI product descriptions vs thin content",
    badge: "GEO",
    source: "r/ecommerce + G2 · 2,100+ discussions",
    sourceUrl: "https://www.reddit.com/r/ecommerce/",
    quote: "GEO engines skip products with <50 word descriptions. AI needs context to recommend.",
    action: "124 of your SKUs have thin descriptions — this is your highest-impact quick fix",
    tone: "watch",
  },
]

export interface GeoEngineRow {
  id: string
  name: string
  short: string
  /** Simple Icons slug — same CDN as PlatformLogo / AI Visibility overview */
  iconSlug: string
  /** Tailwind bg-* for letter fallback if logo fails (matches Platform Breakdown) */
  logoFallbackColor: string
  indexed: string
  cited: string
  rate: string
  trend: string
}

export const geoEngineRows: GeoEngineRow[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Shopping",
    short: "C",
    iconSlug: "openai",
    logoFallbackColor: "bg-green-500",
    indexed: "1.8K",
    cited: "312",
    rate: "16.9%",
    trend: "+4.2%",
  },
  {
    id: "perplexity",
    name: "Perplexity Shopping",
    short: "P",
    iconSlug: "perplexity",
    logoFallbackColor: "bg-purple-500",
    indexed: "1.6K",
    cited: "287",
    rate: "17.4%",
    trend: "+6.8%",
  },
  {
    id: "google",
    name: "Google AI Overview",
    short: "G",
    iconSlug: "google",
    logoFallbackColor: "bg-blue-500",
    indexed: "2.1K",
    cited: "198",
    rate: "9.4%",
    trend: "+2.1%",
  },
  {
    id: "claude",
    name: "Claude",
    short: "A",
    iconSlug: "anthropic",
    logoFallbackColor: "bg-orange-500",
    indexed: "980",
    cited: "89",
    rate: "9.1%",
    trend: "+3.5%",
  },
  {
    id: "copilot",
    name: "Copilot Shopping",
    short: "M",
    iconSlug: "githubcopilot",
    logoFallbackColor: "bg-cyan-500",
    indexed: "1.2K",
    cited: "64",
    rate: "5.3%",
    trend: "−1.2%",
  },
]

export type AuditSeverity = "fail" | "warn" | "pass"
export type AuditCategory = "SEO" | "GEO" | "SEO + GEO"

export interface AuditItem {
  id: string
  title: string
  severity: AuditSeverity
  category: AuditCategory
  affected?: string
  impact: "high" | "medium" | "low"
}

export const technicalAuditItems: AuditItem[] = [
  {
    id: "1",
    title: "Missing structured data (Product schema)",
    severity: "fail",
    category: "SEO + GEO",
    affected: "47 affected",
    impact: "high",
  },
  {
    id: "2",
    title: "Thin product descriptions (<50 words)",
    severity: "fail",
    category: "GEO",
    affected: "124 affected",
    impact: "high",
  },
  {
    id: "3",
    title: "Missing alt text on product images",
    severity: "fail",
    category: "SEO",
    affected: "89 affected",
    impact: "medium",
  },
  {
    id: "4",
    title: "No FAQ / Q&A content on category pages",
    severity: "fail",
    category: "GEO",
    affected: "12 affected",
    impact: "high",
  },
  {
    id: "5",
    title: "Duplicate title tags across product variants",
    severity: "fail",
    category: "SEO",
    affected: "56 affected",
    impact: "medium",
  },
  {
    id: "6",
    title: "Brand entity not linked in Knowledge Graph",
    severity: "fail",
    category: "GEO",
    affected: "1 affected",
    impact: "high",
  },
  {
    id: "7",
    title: "Product feed freshness (>24h stale)",
    severity: "warn",
    category: "SEO + GEO",
    affected: "318 affected",
    impact: "medium",
  },
  {
    id: "8",
    title: "Canonical URLs properly set",
    severity: "pass",
    category: "SEO",
    impact: "low",
  },
  {
    id: "9",
    title: "Comparison content for key categories",
    severity: "warn",
    category: "GEO",
    affected: "8 affected",
    impact: "high",
  },
  {
    id: "10",
    title: "Page speed (Core Web Vitals)",
    severity: "warn",
    category: "SEO",
    impact: "medium",
  },
  {
    id: "11",
    title: "Review/rating markup present",
    severity: "warn",
    category: "SEO + GEO",
    affected: "203 affected",
    impact: "high",
  },
  {
    id: "12",
    title: "AI citation-friendly content format",
    severity: "warn",
    category: "GEO",
    impact: "high",
  },
]

export interface OptimizeProductRow {
  sku: string
  name: string
  seo: number
  geo: number
  mentions: number
  rank: string
  issue: string
}

export const optimizeProductRows: OptimizeProductRow[] = [
  {
    sku: "NK-AM97-SB",
    name: "Nike Air Max 97 Silver Bullet",
    seo: 82,
    geo: 71,
    mentions: 342,
    rank: "#3",
    issue: "Expand description",
  },
  {
    sku: "GC-GGM-MB",
    name: "Gucci GG Marmont Mini Bag",
    seo: 75,
    geo: 45,
    mentions: 128,
    rank: "#8",
    issue: "Add Product schema",
  },
  {
    sku: "AD-SB-OG",
    name: "Adidas Samba OG White",
    seo: 88,
    geo: 82,
    mentions: 489,
    rank: "#1",
    issue: "Add image alt text",
  },
  {
    sku: "MC-MY-DJ",
    name: "Moncler Maya Down Jacket",
    seo: 61,
    geo: 38,
    mentions: 56,
    rank: "Not ranked",
    issue: "Critical: 4 issues",
  },
  {
    sku: "NB-530-SN",
    name: "New Balance 530 Silver Navy",
    seo: 79,
    geo: 68,
    mentions: 215,
    rank: "#5",
    issue: "Fix duplicate title",
  },
  {
    sku: "PR-RE-TB",
    name: "Prada Re-Edition Tote Bag",
    seo: 58,
    geo: 32,
    mentions: 18,
    rank: "Not ranked",
    issue: "Critical: 5 issues",
  },
]

export interface ContentGapRow {
  id: string
  type: string
  priority: "high" | "medium" | "low"
  current: number
  target: number
  suggestion: string
}

export const contentGapRows: ContentGapRow[] = [
  {
    id: "guides",
    type: "Buying Guides",
    priority: "high",
    current: 2,
    target: 10,
    suggestion: "Best Luxury Sneakers Under $300: 2026 Buying Guide",
  },
  {
    id: "compare",
    type: "Comparison Articles",
    priority: "high",
    current: 0,
    target: 8,
    suggestion: "Nike Air Max 97 vs Adidas Samba OG: Which Should You Buy?",
  },
  {
    id: "faq",
    type: "FAQ Pages",
    priority: "high",
    current: 3,
    target: 15,
    suggestion: "Gucci GG Marmont: Size Guide, Pricing & Authentication FAQ",
  },
  {
    id: "trend",
    type: "Trend Reports",
    priority: "medium",
    current: 1,
    target: 4,
    suggestion: "SS26 Sneaker Trends: What's Hot This Season",
  },
  {
    id: "brand",
    type: "Brand Stories",
    priority: "low",
    current: 5,
    target: 8,
    suggestion: "The History of Nike Air Max: From 1987 to 2026",
  },
]
