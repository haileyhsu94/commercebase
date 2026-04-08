import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, Area, AreaChart } from "recharts"
import { statsCards, revenueChartData } from "@/lib/mock-data"
import { FunnelChart, type FunnelStage } from "@/components/shared/FunnelChart"
import {
  AiPresenceTimeRangeControl,
  defaultAiPresenceTimeRange,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
  spend: {
    label: "Spend",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

// Mock data for the static sparklines
const generateSparkline = (trend: "up" | "down") => {
  return Array.from({ length: 14 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: trend === "up" ? 20 + i * 5 + Math.random() * 20 : 80 - i * 4 + Math.random() * 20,
  }))
}

// Mock Funnel Data for the Performance Overview
const funnelStages: FunnelStage[] = [
  { id: "impressions", label: "Impressions", value: 4500000, pct: 100, change: "+12%", changeTrend: "up" },
  { id: "clicks", label: "Clicks", value: 65600, pct: 1.45, change: "+5%", changeTrend: "up" },
  { id: "carts", label: "Add to Cart", value: 4200, pct: 6.4, change: "-2%", changeTrend: "down" },
  { id: "orders", label: "Orders", value: 902, pct: 21.4, change: "+0.3%", changeTrend: "up" },
]

const quickLinks = [
  { href: "/analytics/channels", label: "Channels", description: "Attribution by distribution channel" },
  { href: "/analytics/products", label: "Products", description: "Revenue and performance by product" },
  { href: "/analytics/audiences", label: "Audiences", description: "Segment behavior and demographics" },
  { href: "/analytics/regions", label: "Regions", description: "Revenue density by geography" },
]

export function PerformanceOverview() {
  const [timeRange, setTimeRange] = useState<AiPresenceTimeRange>(defaultAiPresenceTimeRange)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance overview and insights.
          </p>
        </div>
        <div className="flex shrink-0">
          <AiPresenceTimeRangeControl value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* KPI Cards with large Charts (Campaigns style) */}
      <div className="@container mb-6">
        <div className="grid gap-4 @sm:grid-cols-2 @3xl:grid-cols-4">
        {statsCards.map((stat, i) => {
          const isUp = stat.trend === "up"
          const sparklineData = generateSparkline(stat.trend)
          const colorVal = isUp ? "#10b981" : "#f43f5e"

          // Re-use chart config pattern for consistency
          const cardChartConfig = {
            value: { label: stat.title, color: colorVal }
          } satisfies ChartConfig

          return (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.title}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold tabular-nums">{stat.value}</span>
                  <span
                    className={cn(
                      "text-sm",
                      isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
                <ChartContainer config={cardChartConfig} className="aspect-auto h-[140px] w-full">
                  <AreaChart data={sparklineData} margin={{ top: 10, left: -20, right: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`fill-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorVal} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colorVal} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      tickFormatter={(v) => (v > 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
                    />
                    <ChartTooltip cursor={{ strokeDasharray: "4 4" }} content={<ChartTooltipContent hideLabel />} />
                    <Area
                      type="natural"
                      dataKey="value"
                      stroke={colorVal}
                      strokeWidth={2}
                      fill={`url(#fill-${i})`}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </div>

      <div className="@container mb-6">
        <div className="grid gap-6 @3xl:grid-cols-2">
          {/* Main Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue & Spend</CardTitle>
            <CardDescription>Daily performance over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} fontSize={12} width={50} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Conversion Funnel</CardTitle>
            <CardDescription>From impression to purchase</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] flex items-center justify-center pt-0">
             <div className="w-full">
               <FunnelChart stages={funnelStages} chartHeight={250} />
             </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ href, label, description }) => (
          <Card key={href} className="group hover:bg-muted/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
                <Link
                  to={href}
                  aria-label={`Go to ${label}`}
                  className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
