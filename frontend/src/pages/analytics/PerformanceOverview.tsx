import { Link, useOutletContext } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, Area, AreaChart } from "recharts"
import { statsCards, revenueChartData, topProducts } from "@/lib/mock-data"
import { FunnelChart, type FunnelStage } from "@/components/shared/FunnelChart"
import { cn } from "@/lib/utils"
import { ArrowRight, TrendingUp } from "lucide-react"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"
import { useMemo } from "react"
import {
  daysFromAiPresenceTimeRange,
  scaleStatCardsForHomeRange,
} from "@/lib/home-range-metrics"
import { getMergedCampaigns } from "@/lib/campaign-storage"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

function parseDollar(s: string): number {
  const m = /\$?([\d.]+)\s*(K|M)?/i.exec(s.replace(/,/g, ""))
  if (!m) return 0
  const n = Number.parseFloat(m[1])
  if (m[2]?.toUpperCase() === "K") return n * 1000
  if (m[2]?.toUpperCase() === "M") return n * 1_000_000
  return n
}

export function PerformanceOverview() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const days = daysFromAiPresenceTimeRange(timeRange)

  const activeStats = useMemo(() => scaleStatCardsForHomeRange(statsCards, days), [days])

  const activeRevenueData = useMemo(() => {
    const sliceCount = Math.min(revenueChartData.length, days)
    const data = revenueChartData.slice(-sliceCount)
    // Add some jitter based on days to make it feel dynamic
    return data.map((d, i) => ({
      ...d,
      revenue: Math.round(d.revenue * (0.9 + ((days + i) % 15) / 100)),
      // Some mock data might not have spend, handle gracefully
      spend: Math.round(((d as any).spend || d.revenue * 0.4) * (0.85 + ((days + i) % 20) / 100)),
    }))
  }, [days, revenueChartData])

  const activeFunnelStages = useMemo(() => {
    const factor = 0.5 + days / 50
    return funnelStages.map((s) => ({
      ...s,
      value: Math.round(s.value * factor),
    }))
  }, [days])

  const topCampaigns = useMemo(() => {
    const factor = 0.6 + days / 45
    return getMergedCampaigns()
      .sort((a, b) => parseDollar(b.revenue) - parseDollar(a.revenue))
      .slice(0, 5)
      .map((c) => ({
        ...c,
        revenue: `$${(parseDollar(c.revenue) * factor / 1000).toFixed(1)}K`,
        spent: `$${(parseDollar(c.spent) * factor / 1000).toFixed(1)}K`,
      }))
  }, [days])

  const activeTopProducts = useMemo(() => {
    const factor = 0.7 + days / 40
    return [...topProducts]
      .sort((a, b) => {
        const revA = typeof a.revenue === "string" ? parseFloat(a.revenue.replace(/[$,K]/g, "")) : a.revenue
        const revB = typeof b.revenue === "string" ? parseFloat(b.revenue.replace(/[$,K]/g, "")) : b.revenue
        return revB - revA
      })
      .slice(0, 5)
      .map((p) => {
        const baseRev = typeof p.revenue === "string" ? parseFloat(p.revenue.replace(/[$,K]/g, "")) : p.revenue
        return {
          ...p,
          revenue: `$${(baseRev * factor).toFixed(1)}K`,
          sales: Math.round(parseInt(String(p.sales).replace(/,/g, "")) * factor).toLocaleString(),
        }
      })
  }, [days, topProducts])

  return (
    <>

      {/* KPI Cards with large Charts (Campaigns style) */}
      <div className="@container mb-6">
        <div className="grid gap-4 @sm:grid-cols-2 @3xl:grid-cols-4">
          {activeStats.map((stat, i) => {
            const isUp = stat.trend === "up"
            const sparklineData = generateSparkline(stat.trend)
            const colorVal = isUp ? "#10b981" : "#f43f5e"

            // Re-use chart config pattern for consistency
            const cardChartConfig = {
              value: { label: stat.title, color: colorVal },
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
                      <ChartTooltip
                        cursor={{ strokeDasharray: "4 4" }}
                        content={<ChartTooltipContent hideLabel />}
                      />
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
              <CardDescription>Daily performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <AreaChart data={activeRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} tickMargin={10} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    fontSize={12}
                    width={50}
                  />
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
                <FunnelChart stages={activeFunnelStages} chartHeight={250} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="@container mb-6">
        <div className="grid gap-6 @3xl:grid-cols-2">
          {/* Top Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Top Performing Campaigns</CardTitle>
                  <CardDescription>By revenue generated</CardDescription>
                </div>
                <Link to="/campaigns" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCampaigns.map((c) => {
                    const spent = parseDollar(c.spent)
                    const budget = parseDollar(c.budget || "0")
                    const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="font-medium">{c.name}</div>
                          <Badge variant="outline" className="mt-1 text-[10px] h-4">
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">{c.spent}</div>
                          <Progress value={pct} className="h-1 mt-1" />
                        </TableCell>
                        <TableCell className="text-right font-medium">{c.revenue}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {c.roas}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Top Converting Products</CardTitle>
                  <CardDescription>Highest sales volume</CardDescription>
                </div>
                <Link to="/analytics/products" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTopProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          {p.sales}
                          <TrendingUp className="size-3 text-emerald-500" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{p.revenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ href, label, description }) => (
          <Link key={href} to={href} className="group block">
            <Card className="h-full transition-colors group-hover:bg-secondary group-hover:border-border">
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
