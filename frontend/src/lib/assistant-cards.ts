/** Structured "generative UI" cards an assistant reply can render (GA4 Ask-Advisor style). */

export type MetricDelta = { value: string; direction: "up" | "down" }

export interface MetricCardData {
  kind: "metric"
  title: string
  subtitle?: string
  label: string
  value: string
  delta?: MetricDelta
  /** Optional deep-link to the full report. */
  action?: { label: string; href: string }
}

export interface ChartCardData {
  kind: "chart"
  title: string
  subtitle?: string
  chartType: "line" | "bar"
  series: { label: string; value: number }[]
  /** Formatting hints for axis/tooltip values. */
  unitPrefix?: string
  unitSuffix?: string
  action?: { label: string; href: string }
}

export type AssistantCard = MetricCardData | ChartCardData
