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
  { name: "Shopping",         description: "AI Search & Price Comparison",  impS: 0.467, clkS: 0.433, convS: 0.417, revS: 0.385, cvr: "1.45%", roas: "872%",  share: 38, model: "CPC + CPS" },
  { name: "Creator",          description: "StylMatch Creator Network",      impS: 0.311, clkS: 0.277, convS: 0.302, revS: 0.254, cvr: "1.64%", roas: "1120%", share: 25, model: "CPS" },
  { name: "Commerce Network", description: "DailyClick & Partner Publishers",impS: 0.356, clkS: 0.290, convS: 0.194, revS: 0.252, cvr: "1.01%", roas: "510%",  share: 25, model: "CPC" },
  { name: "Vertical",         description: "Sneakers123, Flex Dog",          impS: 0.144, clkS: 0.123, convS: 0.086, revS: 0.110, cvr: "1.05%", roas: "410%",  share: 12, model: "CPC + CPS" },
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
