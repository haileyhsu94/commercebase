import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  efficiencyChartData,
  type EfficiencyChartRow,
  type EfficiencyMetricKey,
} from "@/lib/mock-data"
import {
  formatAiPresencePeriodShort,
  formatOverviewTrendVsPriorLabel,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import {
  daysFromAiPresenceTimeRange,
  deriveEfficiencySummariesFromSlice,
  sliceEfficiencyChartForRange,
} from "@/lib/home-range-metrics"

/** Use full color token — `--primary` is `oklch(...)`, not HSL components, so `hsl(var(--primary))` was invalid and hid the line. */
const sparklineConfig = {
  value: {
    label: "Value",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function formatYTick(key: EfficiencyMetricKey, v: number): string {
  switch (key) {
    case "cpc":
      return `$${v.toFixed(2)}`
    case "cps":
      return `$${v.toFixed(0)}`
    case "ctr":
    case "cvr":
      return `${(v * 100).toFixed(1)}%`
  }
}

function formatTooltipValue(key: EfficiencyMetricKey, v: number): string {
  switch (key) {
    case "cpc":
      return `$${v.toFixed(2)}`
    case "cps":
      return `$${v.toFixed(2)}`
    case "ctr":
    case "cvr":
      return `${(v * 100).toFixed(2)}%`
  }
}

function MetricSparkline({
  metricKey,
  metricLabel,
  rows,
}: {
  metricKey: EfficiencyMetricKey
  metricLabel: string
  rows: EfficiencyChartRow[]
}) {
  const data = rows.map((row) => ({
    date: row.date,
    value: row[metricKey],
  }))

  return (
    <ChartContainer
      config={sparklineConfig}
      className="aspect-auto h-44 w-full min-h-44"
    >
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border/60"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          interval={2}
          tickMargin={8}
        />
        <YAxis
          width={44}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => formatYTick(metricKey, Number(v))}
          tickMargin={4}
        />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => String(label)}
              formatter={(value) => (
                <span className="tabular-nums">
                  {formatTooltipValue(metricKey, Number(value))}
                </span>
              )}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          name={metricLabel}
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function EfficiencyMetricsCard({ timeRange }: { timeRange: AiPresenceTimeRange }) {
  const days = daysFromAiPresenceTimeRange(timeRange)
  const chartRows = sliceEfficiencyChartForRange(efficiencyChartData, days)
  const efficiencyMetricSummaries = deriveEfficiencySummariesFromSlice(chartRows)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Efficiency metrics</CardTitle>
        <CardDescription>
          {formatAiPresencePeriodShort(timeRange)} · {formatOverviewTrendVsPriorLabel(timeRange)} (mock)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {efficiencyMetricSummaries.map((metric) => {
            const lowerIsBetter = metric.key === "cpc" || metric.key === "cps"
            const trendPositive = lowerIsBetter ? metric.trend === "down" : metric.trend === "up"
            return (
            <div key={metric.key} className="space-y-2">
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold tabular-nums">{metric.value}</span>
                  <span
                    className={`flex items-center text-xs ${
                      trendPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {metric.change}
                  </span>
                </div>
              </div>
              <MetricSparkline metricKey={metric.key} metricLabel={metric.label} rows={chartRows} />
            </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
