/**
 * Analytics mock data functions — all parameterised by AiPresenceTimeRange so
 * every chart and table updates when the date-range picker changes.
 */
import type { AiPresenceTimeRange } from "@/pages/ai-presence/ai-presence-time-range"
import type { FunnelStage } from "@/components/shared/FunnelChart"

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAnalyticsDays(range: AiPresenceTimeRange): number {
  if (range.kind === "preset") {
    if (range.preset === "7d") return 7
    if (range.preset === "14d") return 14
    return 28
  }
  const ms = new Date(range.to).getTime() - new Date(range.from).getTime()
  return Math.max(1, Math.round(ms / 86400000))
}

/** Deterministic wave — no Math.random(), same output for same i + seed. */
function wave(i: number, seed = 0): number {
  return Math.sin(i * 1.2 + seed) * 0.26 + Math.sin(i * 3.3 + seed * 1.7) * 0.08
}

function dateLabels(days: number): string[] {
  const today = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${n}`
}

// Daily baselines derived from the 28-day static data
const DAILY = {
  revenue: 2_707,   // $75,800 / 28
  spend: 395,
  orders: 32.2,     // 902 / 28
  impressions: 160_714,
  clicks: 2_343,
  carts: 150,
}

// ─── Performance Overview ──────────────────────────────────────────────────────

export interface AnalyticsStat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
}

export function getAnalyticsStats(range: AiPresenceTimeRange): AnalyticsStat[] {
  const days = getAnalyticsDays(range)
  const revenue = Math.round(DAILY.revenue * days)
  const orders = Math.round(DAILY.orders * days)
  // Rates change only slightly across periods
  const aov = Math.round(84 * (1 + (28 - days) * 0.001))
  const roas = Math.round(682 + (28 - days) * 1.5)

  return [
    { title: "Total Revenue", value: fmtCurrency(revenue), change: "+15%", trend: "up" },
    { title: "Total Orders", value: orders.toLocaleString(), change: "+12%", trend: "up" },
    { title: "Avg Order Value", value: `$${aov}`, change: "+2.1%", trend: "up" },
    { title: "ROAS", value: `${roas}%`, change: "-3%", trend: "down" },
  ]
}

/** Deterministic sparkline — varies per stat index and period so charts update on range change. */
export function getSparkline(trend: "up" | "down", statIndex: number, days: number) {
  const points = Math.min(days, 14)
  const seed = statIndex * 5.3 + days * 0.17
  return Array.from({ length: points }, (_, i) => ({
    date: `Day ${i + 1}`,
    value:
      trend === "up"
        ? Math.round(20 + (i / points) * 60 + wave(i, seed) * 25)
        : Math.round(80 - (i / points) * 50 + wave(i, seed) * 25),
  }))
}

export interface RevenueChartRow {
  date: string
  revenue: number
}

export function getRevenueChartData(range: AiPresenceTimeRange): RevenueChartRow[] {
  const days = getAnalyticsDays(range)
  const labels = dateLabels(days)
  return labels.map((date, i) => ({
    date,
    revenue: Math.round(DAILY.revenue * (1 + wave(i, 0))),
  }))
}

export function getPerformanceFunnelStages(range: AiPresenceTimeRange): FunnelStage[] {
  const days = getAnalyticsDays(range)
  const s = days / 28
  return [
    { id: "impressions", label: "Impressions", value: Math.round(4_500_000 * s), pct: 100, change: "+12%", changeTrend: "up" },
    { id: "clicks", label: "Clicks", value: Math.round(65_600 * s), pct: 1.45, change: "+5%", changeTrend: "up" },
    { id: "carts", label: "Add to Cart", value: Math.round(4_200 * s), pct: 6.4, change: "-2%", changeTrend: "down" },
    { id: "orders", label: "Orders", value: Math.round(902 * s), pct: 21.4, change: "+0.3%", changeTrend: "up" },
  ]
}

// ─── Channels ─────────────────────────────────────────────────────────────────

export interface ChannelRow {
  name: string
  description: string
  impressions: string
  clicks: string
  conversions: number
  revenueRaw: number
  revenue: string
  cvr: string
  roas: string
  share: number
  model: string
}

const CHANNEL_BASE = [
  { name: "Shopping",         description: "AI Search & Price Comparison",  impS: 0.15, clkS: 0.15, convS: 0.15, revS: 0.15, cvr: "1.45%", roas: "872%",  share: 15, model: "CPC + CPS" },
  { name: "Creator",          description: "StylMatch Creator Network",      impS: 0.10, clkS: 0.10, convS: 0.10, revS: 0.10, cvr: "1.64%", roas: "1120%", share: 10, model: "CPS" },
  { name: "Commerce Network", description: "DailyClick & Partner Publishers",impS: 0.10, clkS: 0.10, convS: 0.10, revS: 0.10, cvr: "1.01%", roas: "510%",  share: 10, model: "CPC" },
  { name: "VerticalSearch",   description: "Sneakers123, Flex Dog",          impS: 0.05, clkS: 0.05, convS: 0.05, revS: 0.05, cvr: "1.05%", roas: "410%",  share: 5, model: "CPC + CPS" },
  { name: "Meta Video",       description: "Instagram Reels & FB Video",     impS: 0.12, clkS: 0.12, convS: 0.12, revS: 0.12, cvr: "1.12%", roas: "620%",  share: 12, model: "CPM" },
  { name: "TikTok Spark",     description: "In-feed Shoppable Ads",          impS: 0.15, clkS: 0.15, convS: 0.15, revS: 0.15, cvr: "2.84%", roas: "980%",  share: 15, model: "CPC" },
  { name: "Google Search",    description: "Traditional Search Keywords",    impS: 0.08, clkS: 0.08, convS: 0.08, revS: 0.08, cvr: "4.21%", roas: "540%",  share: 8, model: "CPC" },
  { name: "Pinterest Shop",   description: "Visual Discovery Ads",           impS: 0.06, clkS: 0.06, convS: 0.06, revS: 0.06, cvr: "0.92%", roas: "480%",  share: 6, model: "CPC" },
  { name: "Email Marketing",  description: "Retention & Win-back",           impS: 0.04, clkS: 0.04, convS: 0.04, revS: 0.04, cvr: "12.4%", roas: "1850%", share: 4, model: "Owned" },
  { name: "Affiliate Plus",   description: "Premium Partner Inventory",      impS: 0.05, clkS: 0.05, convS: 0.05, revS: 0.05, cvr: "1.85%", roas: "720%",  share: 5, model: "CPA" },
  { name: "Display Look",     description: "Programmatic Retargeting",       impS: 0.10, clkS: 0.10, convS: 0.10, revS: 0.10, cvr: "0.45%", roas: "320%",  share: 10, model: "CPM" },
  { name: "Snap Ads",         description: "AR Lenses & Story Ads",          impS: 0.04, clkS: 0.04, convS: 0.04, revS: 0.04, cvr: "1.20%", roas: "520%",  share: 4, model: "CPM" },
  { name: "Reddit Promoted",  description: "Niche Community Targeting",      impS: 0.03, clkS: 0.03, convS: 0.03, revS: 0.03, cvr: "0.80%", roas: "280%",  share: 3, model: "CPC" },
  { name: "Podcast Audio",    description: "Dynamic Ad Insertion",           impS: 0.02, clkS: 0.02, convS: 0.02, revS: 0.02, cvr: "0.50%", roas: "150%",  share: 2, model: "CPM" },
  { name: "SMS Alerts",       description: "Direct Customer Push",           impS: 0.01, clkS: 0.01, convS: 0.01, revS: 0.01, cvr: "15.2%", roas: "2400%", share: 1, model: "Owned" },
  { name: "Twitter Takeover", description: "Trend & First View Ads",          impS: 0.02, clkS: 0.02, convS: 0.02, revS: 0.02, cvr: "0.65%", roas: "310%",  share: 2, model: "CPM" },
]

// 28-day totals: impressions 4.5M, clicks 65.6K, conversions 987, revenue $85.2K
const CHANNEL_TOTALS_28 = { imp: 4_500_000, clk: 65_600, conv: 987, rev: 85_200 }

export function getChannelData(range: AiPresenceTimeRange): ChannelRow[] {
  const s = getAnalyticsDays(range) / 28
  return CHANNEL_BASE.map((ch) => {
    const imp   = Math.round(CHANNEL_TOTALS_28.imp  * s * ch.impS)
    const clk   = Math.round(CHANNEL_TOTALS_28.clk  * s * ch.clkS)
    const conv  = Math.round(CHANNEL_TOTALS_28.conv * s * ch.convS)
    const rev   = Math.round(CHANNEL_TOTALS_28.rev  * s * ch.revS)
    return {
      name: ch.name, description: ch.description,
      impressions: fmtCompact(imp), clicks: fmtCompact(clk),
      conversions: conv, revenueRaw: rev, revenue: fmtCurrency(rev),
      cvr: ch.cvr, roas: ch.roas, share: ch.share, model: ch.model,
    }
  })
}

export function getChannelPieData(range: AiPresenceTimeRange) {
  return getChannelData(range).map((c, i) => ({
    name: c.name,
    value: c.share,
    fill: ["var(--color-primary)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"][i] ?? "var(--color-primary)",
  }))
}

export function getChannelBarData(range: AiPresenceTimeRange) {
  return getChannelData(range).map((c) => ({ name: c.name, revenue: c.revenueRaw }))
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductRow {
  id: string
  name: string
  category: string
  sales: number
  cvr: string
  revenue: string
}

const PRODUCT_BASE = [
  { id: "1", name: "Nike Air Max 97 Silver Bullet", category: "Sneakers", sales28: 142, rev28: 18_500, cvr: "3.2%" },
  { id: "2", name: "Gucci GG Marmont Mini Bag",     category: "Luxury",   sales28: 87,  rev28: 15_700, cvr: "2.1%" },
  { id: "3", name: "Adidas Samba OG White",          category: "Sneakers", sales28: 198, rev28: 13_900, cvr: "4.8%" },
  { id: "4", name: "Moncler Maya Down Jacket",       category: "Luxury",   sales28: 34,  rev28: 11_600, cvr: "1.4%" },
  { id: "5", name: "New Balance 530 Silver Navy",    category: "Sneakers", sales28: 156, rev28: 10_900, cvr: "3.6%" },
  { id: "6", name: "Prada Re-Edition 2005 Shoulder Bag", category: "Luxury", sales28: 52, rev28: 9_800, cvr: "1.8%" },
  { id: "7", name: "Jordan 1 Retro High OG Chicago", category: "Sneakers", sales28: 64, rev28: 12_400, cvr: "2.4%" },
  { id: "8", name: "Stone Island Patch T-Shirt", category: "Apparel", sales28: 245, rev28: 8_200, cvr: "5.1%" },
  { id: "9", name: "Off-White Vulcanized Low", category: "Sneakers", sales28: 82, rev28: 7_100, cvr: "3.2%" },
  { id: "10", name: "Balenciaga Track Sneaker", category: "Luxury", sales28: 28, rev28: 14_200, cvr: "0.9%" },
  { id: "11", name: "Yeezy Boost 350 V2 Bone", category: "Sneakers", sales28: 112, rev28: 9_400, cvr: "3.8%" },
  { id: "12", name: "C.P. Company Goggle Hoodie", category: "Apparel", sales28: 76, rev28: 6_800, cvr: "2.9%" },
  { id: "13", name: "Louis Vuitton Neverfull MM", category: "Luxury", sales28: 41, rev28: 18_200, cvr: "1.2%" },
  { id: "14", name: "Nike Dunk Low Panda", category: "Sneakers", sales28: 450, rev28: 11_200, cvr: "8.4%" },
  { id: "15", name: "Jacquemus Le Bambino", category: "Luxury", sales28: 68, rev28: 7_400, cvr: "2.5%" },
  { id: "16", name: "Asics Gel-Kayano 14 Silver", category: "Sneakers", sales28: 134, rev28: 8_900, cvr: "4.1%" },
  { id: "17", name: "Fear of God Essentials Hoodie", category: "Apparel", sales28: 560, rev28: 15_800, cvr: "12.4%" },
  { id: "18", name: "Bottega Veneta Cassette Bag", category: "Luxury", sales28: 24, rev28: 12_600, cvr: "0.7%" },
  { id: "19", name: "Salomon XT-6 Black Phantom", category: "Sneakers", sales28: 182, rev28: 10_200, cvr: "4.5%" },
  { id: "20", name: "Rick Owens Ramones Low", category: "Luxury", sales28: 19, rev28: 9_100, cvr: "0.5%" },
  { id: "21", name: "Supreme Box Logo Hoodie", category: "Apparel", sales28: 145, rev28: 11_400, cvr: "2.1%" },
  { id: "22", name: "Stussy 8 Ball Fleece", category: "Apparel", sales28: 210, rev28: 7_600, cvr: "6.4%" },
]

export function getProductData(range: AiPresenceTimeRange): ProductRow[] {
  const s = getAnalyticsDays(range) / 28
  return PRODUCT_BASE.map((p) => ({
    id: p.id, name: p.name, category: p.category, cvr: p.cvr,
    sales: Math.round(p.sales28 * s),
    revenue: fmtCurrency(Math.round(p.rev28 * s)),
  }))
}

export function getProductBarData(range: AiPresenceTimeRange) {
  const s = getAnalyticsDays(range) / 28
  return PRODUCT_BASE.map((p) => ({
    name: p.name.split(" ").slice(0, 2).join(" "),
    revenue: Math.round(p.rev28 * s),
  }))
}

// ─── Regions ──────────────────────────────────────────────────────────────────

export interface RegionRow {
  name: string
  revenue: string
  revenueRaw: number
  change: string
  trend: "up" | "down"
}

const REGION_BASE = [
  { name: "United Kingdom", rev28: 28_800, change: "+12%", trend: "up"   as const },
  { name: "United States",  rev28: 22_600, change: "+8%",  trend: "up"   as const },
  { name: "Germany",        rev28:  9_100, change: "+22%", trend: "up"   as const },
  { name: "France",         rev28:  7_600, change: "-3%",  trend: "down" as const },
  { name: "Japan",          rev28:  6_400, change: "+15%", trend: "up"   as const },
  { name: "South Korea",    rev28:  5_800, change: "+18%", trend: "up"   as const },
  { name: "Canada",         rev28:  4_200, change: "+5%",  trend: "up"   as const },
  { name: "Australia",      rev28:  3_900, change: "+4%",  trend: "up"   as const },
  { name: "Italy",          rev28:  3_400, change: "-2%",  trend: "down" as const },
  { name: "Spain",          rev28:  2_800, change: "+10%", trend: "up"   as const },
  { name: "Netherlands",    rev28:  2_400, change: "+6%",  trend: "up"   as const },
  { name: "China",          rev28: 14_200, change: "+35%", trend: "up"   as const },
  { name: "Brazil",         rev28:  3_100, change: "+12%", trend: "up"   as const },
  { name: "Mexico",         rev28:  2_900, change: "+8%",  trend: "up"   as const },
  { name: "India",          rev28:  4_800, change: "+24%", trend: "up"   as const },
  { name: "Switzerland",    rev28:  5_200, change: "+4%",  trend: "up"   as const },
  { name: "Sweden",         rev28:  3_600, change: "+7%",  trend: "up"   as const },
  { name: "Belgium",        rev28:  2_100, change: "-1%",  trend: "down" as const },
  { name: "UAE",            rev28:  6_700, change: "+40%", trend: "up"   as const },
  { name: "Singapore",      rev28:  5_400, change: "+14%", trend: "up"   as const },
  { name: "Others",         rev28:  7_700, change: "+5%",  trend: "up"   as const },
]

export function getRegionData(range: AiPresenceTimeRange): RegionRow[] {
  const s = getAnalyticsDays(range) / 28
  return REGION_BASE.map((r) => {
    const raw = Math.round(r.rev28 * s)
    return { name: r.name, revenue: fmtCurrency(raw), revenueRaw: raw, change: r.change, trend: r.trend }
  })
}

export function getRegionBarData(range: AiPresenceTimeRange) {
  return getRegionData(range).map((r) => ({ name: r.name.split(" ")[0], revenue: r.revenueRaw }))
}

// ─── Audiences ────────────────────────────────────────────────────────────────

export interface AudienceKpi {
  title: string
  value: string
  description: string
}

export function getAudienceKpis(range: AiPresenceTimeRange): AudienceKpi[] {
  const days = getAnalyticsDays(range)
  const s = days / 28
  return [
    { title: "Total Shoppers",   value: "2.4M",                   description: "All identified profiles" },
    { title: `Active (${days}D)`,value: fmtCompact(Math.round(850_000 * Math.min(1, s * 1.1))), description: `Visited in last ${days} days` },
    { title: "High-Intent Pool", value: fmtCompact(Math.round(128_000 * s)), description: "Ready-to-purchase score >80" },
    { title: "Retarget Pool",    value: fmtCompact(Math.round(45_000 * s)),  description: "Cart abandoned or recent view" },
  ]
}

export function getAudienceFunnelStages(range: AiPresenceTimeRange): FunnelStage[] {
  const s = getAnalyticsDays(range) / 28
  return [
    { id: "new-visitors",   label: "New visitors",   value: Math.round(28_400 * s), pct: 100  },
    { id: "engaged",        label: "Engaged",         value: Math.round(8_400  * s), pct: 29.6 },
    { id: "intent-signal",  label: "Intent signal",   value: Math.round(3_200  * s), pct: 11.3 },
    { id: "first-purchase", label: "First purchase",  value: Math.round(764    * s), pct: 2.69 },
  ]
}
