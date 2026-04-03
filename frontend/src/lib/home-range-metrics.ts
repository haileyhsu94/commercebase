import type { AiPresenceTimeRange } from "@/pages/ai-presence/ai-presence-time-range"
import type {
  AIVisibilityData,
  Alert,
  Campaign,
  EfficiencyChartRow,
  EfficiencyMetricSummary,
  StatCard,
} from "@/lib/mock-data"
import { efficiencyMetricSummaries } from "@/lib/mock-data"

export function daysFromAiPresenceTimeRange(range: AiPresenceTimeRange): number {
  if (range.kind === "preset") {
    return Number.parseInt(range.preset.replace("d", ""), 10)
  }
  const from = new Date(`${range.from}T12:00:00`)
  const to = new Date(`${range.to}T12:00:00`)
  const ms = to.getTime() - from.getTime()
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  return Math.max(1, days + 1)
}

export function sliceEfficiencyChartForRange(
  rows: EfficiencyChartRow[],
  days: number
): EfficiencyChartRow[] {
  const n = Math.min(Math.max(1, days), rows.length)
  return rows.slice(-n)
}

function pctChange(first: number, last: number): number {
  if (first === 0) return 0
  return ((last - first) / first) * 100
}

export function deriveEfficiencySummariesFromSlice(
  rows: EfficiencyChartRow[]
): EfficiencyMetricSummary[] {
  if (rows.length < 2) {
    return efficiencyMetricSummaries.map((m) => ({ ...m }))
  }
  const first = rows[0]
  const last = rows[rows.length - 1]

  const cpcPct = pctChange(first.cpc, last.cpc)
  const cpsPct = pctChange(first.cps, last.cps)
  const ctrPct = pctChange(first.ctr, last.ctr)
  const cvrPct = pctChange(first.cvr, last.cvr)

  const ctrPp = (last.ctr - first.ctr) * 100
  const cvrPp = (last.cvr - first.cvr) * 100

  return [
    {
      key: "cpc",
      label: "CPC",
      value: `$${last.cpc.toFixed(2)}`,
      change: `${cpcPct >= 0 ? "+" : ""}${cpcPct.toFixed(1)}%`,
      trend: cpcPct <= 0 ? "down" : "up",
    },
    {
      key: "cps",
      label: "CPS",
      value: `$${last.cps.toFixed(2)}`,
      change: `${cpsPct >= 0 ? "+" : ""}${cpsPct.toFixed(1)}%`,
      trend: cpsPct <= 0 ? "down" : "up",
    },
    {
      key: "ctr",
      label: "CTR",
      value: `${(last.ctr * 100).toFixed(2)}%`,
      change: `${ctrPp >= 0 ? "+" : ""}${ctrPp.toFixed(1)}pp`,
      trend: ctrPct >= 0 ? "up" : "down",
    },
    {
      key: "cvr",
      label: "Conv. rate",
      value: `${(last.cvr * 100).toFixed(2)}%`,
      change: `${cvrPp >= 0 ? "+" : ""}${cvrPp.toFixed(1)}pp`,
      trend: cvrPct >= 0 ? "up" : "down",
    },
  ]
}

function scaleStatDisplayValue(value: string, factor: number): string {
  if (value.endsWith("%")) {
    const n = Number.parseFloat(value.replace(/%/g, ""))
    if (!Number.isFinite(n)) return value
    return `${Math.round(n * factor)}%`
  }
  if (value.startsWith("$")) {
    const n = Number.parseFloat(value.replace(/[$,]/g, ""))
    if (!Number.isFinite(n)) return value
    return `$${Math.round(n * factor).toLocaleString()}`
  }
  const n = Number.parseFloat(value.replace(/,/g, ""))
  if (!Number.isFinite(n)) return value
  return Math.round(n * factor).toLocaleString()
}

function tweakChangeString(change: string, days: number): string {
  const m = change.match(/^([+-])([\d.]+)(%|pp)?$/)
  if (!m) return change
  const sign = m[1]
  const base = Number.parseFloat(m[2])
  const suffix = m[3] ?? ""
  const jitter = ((days * 3) % 7) / 10
  const next = Math.max(0.1, base + jitter)
  if (suffix === "pp") return `${sign}${next.toFixed(1)}pp`
  return `${sign}${next.toFixed(1)}${suffix}`
}

export function scaleStatCardsForHomeRange(stats: StatCard[], days: number): StatCard[] {
  const factor = 0.9 + (days % 28) / 200
  return stats.map((s) => ({
    ...s,
    value: scaleStatDisplayValue(s.value, factor),
    change: tweakChangeString(s.change, days),
  }))
}

export function adjustAiVisibilityForHomeRange(data: AIVisibilityData, days: number): AIVisibilityData {
  const f = 0.92 + (days % 36) / 120
  const qf = 0.9 + (days % 21) / 150
  return {
    ...data,
    overallScore: Math.min(100, Math.max(0, Math.round(data.overallScore * f))),
    shoppingQueries: Math.round(data.shoppingQueries * qf),
    missedOpportunities: Math.max(0, Math.min(20, data.missedOpportunities + (days % 5) - 2)),
    platforms: data.platforms.map((p, i) => ({
      ...p,
      score: Math.min(
        100,
        Math.max(0, Math.round(p.score * (0.94 + ((days + i) % 9) / 150)))
      ),
    })),
  }
}

export function sliceAlertsForHomeRange(list: Alert[], days: number): Alert[] {
  const count = Math.min(list.length, Math.max(1, 1 + (days % list.length)))
  return list.slice(0, count)
}

function scaleMoneyK(s: string, factor: number): string {
  const m = s.match(/^\$([\d.]+)K$/)
  if (!m) return s
  const num = Number.parseFloat(m[1])
  if (!Number.isFinite(num)) return s
  return `$${(num * factor).toFixed(1)}K`
}

export function scaleCampaignRowForHomeRange(c: Campaign, days: number): Campaign {
  const f = 0.92 + (days % 17) / 100
  const idSum = c.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const rowF = f + (idSum % 7) / 200
  return {
    ...c,
    spent: scaleMoneyK(c.spent, rowF),
    revenue: scaleMoneyK(c.revenue, rowF),
  }
}
