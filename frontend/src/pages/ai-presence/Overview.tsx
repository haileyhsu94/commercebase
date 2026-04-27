import { useEffect, useMemo, useRef } from "react"
import { Link, useOutletContext, useSearchParams } from "react-router-dom"
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ArrowRight,
  ArrowUpRight,
  Target,
  Eye,
  Zap,
} from "lucide-react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PlatformLogo } from "@/components/shared/PlatformLogo"
import { aiVisibilityData } from "@/lib/mock-data"
import { SOV_SHORT } from "@/lib/sov"
import { adjustAiVisibilityForHomeRange, daysFromAiPresenceTimeRange } from "@/lib/home-range-metrics"
import {
  formatOverviewTrendVsPriorLabel,
  type AIPresenceOutletContext,
} from "./ai-presence-time-range"

const sovTrendData = [
  { week: "W1", sov: 52 },
  { week: "W2", sov: 55 },
  { week: "W3", sov: 53 },
  { week: "W4", sov: 58 },
  { week: "W5", sov: 56 },
  { week: "W6", sov: 61 },
  { week: "W7", sov: 59 },
  { week: "W8", sov: 64 },
  { week: "W9", sov: 66 },
  { week: "W10", sov: 63 },
  { week: "W11", sov: 68 },
  { week: "W12", sov: 74 },
]

const sovChartConfig = {
  sov: { label: "SoV", color: "var(--color-chart-1)" },
} satisfies ChartConfig

const topQueries = [
  { query: "luxury handbags", you: 23, leader: 68, trend: "down" as const, volume: "12.5K" },
  { query: "designer sneakers", you: 45, leader: 52, trend: "up" as const, volume: "8.2K" },
  { query: "premium watches", you: 67, leader: 72, trend: "up" as const, volume: "6.8K" },
  { query: "winter jackets", you: 34, leader: 61, trend: "down" as const, volume: "5.1K" },
  { query: "running shoes", you: 78, leader: 82, trend: "up" as const, volume: "22.3K" },
]

const recommendations = [
  {
    title: "Add 'Italian leather' to product descriptions",
    impact: "High" as const,
    description: "Products with this keyword rank 2x higher in AI recommendations",
    lift: "+12%",
  },
  {
    title: "Include customer reviews in feed",
    impact: "High" as const,
    description: "Products with 4.5+ stars get 3x more AI mentions",
    lift: "+18%",
  },
  {
    title: "Optimize price positioning",
    impact: "Medium" as const,
    description: "Your luxury items are above the 'best value' threshold",
    lift: "+6%",
  },
]

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-blue-600 dark:text-blue-400"
  if (score >= 40) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function getScoreStroke(score: number) {
  if (score >= 80) return "stroke-emerald-500"
  if (score >= 60) return "stroke-blue-500"
  if (score >= 40) return "stroke-amber-500"
  return "stroke-red-500"
}

export function AIPresenceOverview() {
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const days = daysFromAiPresenceTimeRange(timeRange)
  const data = adjustAiVisibilityForHomeRange(aiVisibilityData, days)
  const { overallScore, shoppingQueries, missedOpportunities, platforms } = data
  const [searchParams, setSearchParams] = useSearchParams()
  const recsRef = useRef<HTMLDivElement>(null)
  const shouldHighlight = searchParams.get("highlight") === "recommendations"

  useEffect(() => {
    if (shouldHighlight && recsRef.current) {
      recsRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      const timeout = setTimeout(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete("highlight")
          return next
        }, { replace: true })
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [shouldHighlight, setSearchParams])

  const trendVsPriorLabel = formatOverviewTrendVsPriorLabel(timeRange)

  const mentions = Math.round(shoppingQueries * (overallScore / 100))

  const sortedPlatforms = useMemo(
    () => [...platforms].sort((a, b) => b.score - a.score),
    [platforms]
  )

  return (
    <div className="space-y-6">
      {/* ── Hero: SoV score + trend chart ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall {SOV_SHORT}
            </p>
            <div className="relative mt-4 flex items-center justify-center">
              <svg className="h-36 w-36" viewBox="0 0 36 36" aria-hidden>
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="2.5"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="15.9155"
                />
                <circle
                  className={getScoreStroke(overallScore)}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="15.9155"
                  strokeDasharray={`${overallScore} 100`}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold tabular-nums ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-[10px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              +15.6% {trendVsPriorLabel}
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground max-w-[200px]">
              Your brand captures <span className="font-semibold text-foreground">{overallScore}%</span> share
              of voice in AI shopping answers.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">{SOV_SHORT} Trend</CardTitle>
                <CardDescription>Weekly share of voice performance</CardDescription>
              </div>
              <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold">
                +22 pts (12 wks)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sovChartConfig} className="h-[200px] w-full">
              <AreaChart data={sovTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="sovGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={8}
                />
                <YAxis
                  domain={[40, 85]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={4}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="sov"
                  type="monotone"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#sovGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/ai-presence/shopping-journey" className="group/card block">
          <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Eye className="size-4.5" />
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover/card:opacity-100 group-hover/card:translate-x-0" />
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums">{shoppingQueries.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Shopping Queries</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3" />
                +12% <span className="font-normal text-muted-foreground">{trendVsPriorLabel}</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ai-presence/merchants" className="group/card block">
          <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                  <Target className="size-4.5" />
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover/card:opacity-100 group-hover/card:translate-x-0" />
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums">{mentions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Your Mentions</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3" />
                +8% <span className="font-normal text-muted-foreground">{trendVsPriorLabel}</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ai-presence/competitors?tab=opportunities" className="group/card block">
          <Card className="h-full border-amber-200/60 transition-all hover:bg-muted/50 hover:shadow-sm dark:border-amber-800/40">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Zap className="size-4.5" />
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover/card:opacity-100 group-hover/card:translate-x-0" />
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{missedOpportunities}</p>
              <p className="text-xs text-muted-foreground">Missed Opportunities</p>
              <p className="mt-2 text-xs text-muted-foreground">High-value queries with low visibility</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Platform performance grid ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Platform Performance</CardTitle>
              <CardDescription>{SOV_SHORT} by AI platform — where you win or lag</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {platforms.length} platforms
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPlatforms.map((platform, idx) => {
              const isTop = idx === 0
              return (
                <div
                  key={platform.name}
                  className="group relative flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
                >
                  <PlatformLogo
                    name={platform.name}
                    shortName={platform.shortName}
                    iconSlug={platform.iconSlug}
                    color={platform.color}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{platform.name}</p>
                      <div className="flex items-center gap-1.5">
                        {isTop && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Best
                          </span>
                        )}
                        <span className={`text-sm font-bold tabular-nums ${getScoreColor(platform.score)}`}>
                          {platform.score}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${platform.color}`}
                        style={{ width: `${platform.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom row: Queries + Recommendations ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Top queries */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Top Shopping Queries</CardTitle>
                <CardDescription>Your {SOV_SHORT} vs category leader</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link to="/ai-presence/competitors?tab=opportunities" />}>
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topQueries.map((item) => (
                <div key={item.query} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.query}</p>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{item.volume}/wk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.trend === "up" ? (
                        <TrendingUp className="size-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="size-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${item.you}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-semibold tabular-nums">{item.you}%</span>
                        <span className="text-[10px] text-muted-foreground">You</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-muted-foreground/30 transition-all"
                            style={{ width: `${item.leader}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{item.leader}%</span>
                        <span className="text-[10px] text-muted-foreground">Leader</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card
          ref={recsRef}
          className={`lg:col-span-2 ${
            shouldHighlight
              ? "animate-pulse ring-2 ring-primary/50 transition-all duration-700"
              : "transition-all duration-700"
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Quick Wins</CardTitle>
                <CardDescription>Top actions to boost visibility</CardDescription>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb className="size-3.5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="group flex gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <ArrowUpRight className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{rec.title}</p>
                      <Badge
                        variant={rec.impact === "High" ? "default" : "secondary"}
                        className="shrink-0 text-[10px]"
                      >
                        {rec.impact}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                    <p className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Est. {rec.lift} {SOV_SHORT} lift
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
