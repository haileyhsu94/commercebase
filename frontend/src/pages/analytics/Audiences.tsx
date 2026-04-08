import { useOutletContext } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"
import { useMemo } from "react"
import { daysFromAiPresenceTimeRange } from "@/lib/home-range-metrics"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, Target, Activity, RefreshCcw, TrendingUp, Zap } from "lucide-react"
import { FunnelChart } from "@/components/shared/FunnelChart"
import { cn } from "@/lib/utils"
import { getAudienceKpis, getAudienceFunnelStages } from "@/lib/analytics-mock"

// ─── Static data (not scaled by time — qualitative / structural) ──────────────

const mockSegments = [
  { name: "High-intent shoppers",    size: "128K", cvr: "4.2%", avgOrder: "$145", ltv: "$420", growth: "+12%", channel: "Search",      color: "bg-blue-500" },
  { name: "Luxury fashion interest", size: "89K",  cvr: "2.8%", avgOrder: "$310", ltv: "$890", growth: "+5%",  channel: "Paid Social", color: "bg-purple-500" },
  { name: "Returning visitors (90d)",size: "34K",  cvr: "6.1%", avgOrder: "$110", ltv: "$350", growth: "-2%",  channel: "Direct",      color: "bg-emerald-500" },
  { name: "Cart Abandoners (7d)",    size: "12K",  cvr: "8.5%", avgOrder: "$165", ltv: "$480", growth: "+18%", channel: "Email",       color: "bg-amber-500" },
]

const categoryAffinity = [
  { name: "Luxury Fashion", index: 182, progress: 90 },
  { name: "Sneakers",       index: 145, progress: 75 },
  { name: "Activewear",     index: 110, progress: 55 },
  { name: "Outerwear",      index: 85,  progress: 40 },
]

const intentSignals = [
  { signal: "Price comparison viewed",   shoppers: "18.2K", cvrLift: "+34%", strength: "Very high" },
  { signal: "Size guide opened",         shoppers: "12.1K", cvrLift: "+28%", strength: "High" },
  { signal: "Product page 3+ visits",   shoppers: "9.4K",  cvrLift: "+22%", strength: "High" },
  { signal: "Wishlist add",             shoppers: "7.8K",  cvrLift: "+19%", strength: "Medium" },
  { signal: "Cart add (no checkout)",   shoppers: "6.2K",  cvrLift: "+41%", strength: "Very high" },
  { signal: "Return visit within 48h",  shoppers: "4.1K",  cvrLift: "+15%", strength: "Medium" },
  { signal: "Review page scroll",       shoppers: "2.9K",  cvrLift: "+11%", strength: "Low" },
]

const retargetingPools = [
  { name: "Cart abandoners (7d)",       size: "12K",  estCvr: "8.5%",  suggestedBid: "$1.20", channel: "Email" },
  { name: "High-intent, no purchase",   size: "9.4K", estCvr: "6.2%",  suggestedBid: "$0.95", channel: "Paid Social" },
  { name: "Lapsed buyers (90d+)",       size: "22K",  estCvr: "3.1%",  suggestedBid: "$0.60", channel: "Display" },
  { name: "Wishlist, no purchase",      size: "7.8K", estCvr: "5.4%",  suggestedBid: "$0.85", channel: "Email" },
  { name: "Price-drop eligible",        size: "4.3K", estCvr: "11.2%", suggestedBid: "$1.50", channel: "Push" },
]

const KPIS_ICONS = [Users, Activity, Target, RefreshCcw]

const strengthConfig: Record<string, string> = {
  "Very high": "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400",
  "High":      "bg-blue-50 text-blue-700 ring-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400",
  "Medium":    "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400",
  "Low":       "bg-muted text-muted-foreground ring-border/60",
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AudiencesPage() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const days = daysFromAiPresenceTimeRange(timeRange)

  const kpis         = useMemo(() => getAudienceKpis(timeRange),        [timeRange])
  const funnelStages = useMemo(() => getAudienceFunnelStages(timeRange), [timeRange])

  const activeSegments = useMemo(() => {
    const factor = 0.7 + days / 50
    return mockSegments.map((s) => ({
      ...s,
      size: `${Math.round(parseInt(s.size.replace("K", "")) * factor)}K`,
    }))
  }, [days])

  const activeIntentSignals = useMemo(() => {
    const factor = 0.75 + days / 65
    return intentSignals.map((s) => ({
      ...s,
      shoppers: `${(parseFloat(s.shoppers.replace("K", "")) * factor).toFixed(1)}K`,
    }))
  }, [days])

  const activeRetargetingPools = useMemo(() => {
    const factor = 0.8 + days / 70
    return retargetingPools.map((p) => ({
      ...p,
      size: `${Math.round(parseInt(p.size.replace("K", "")) * factor)}K`,
    }))
  }, [days])

  return (
    <>
      {/* KPI cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((card, i) => {
          const Icon = KPIS_ICONS[i] ?? Users
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{card.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* New customer funnel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">New customer funnel</CardTitle>
          <CardDescription>First-time buyer journey for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart stages={funnelStages} chartHeight={180} />
        </CardContent>
      </Card>

      {/* Segments + Category Affinity */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Audience segments</CardTitle>
            <CardDescription>High-value pools available for immediate targeting</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">CVR</TableHead>
                  <TableHead className="text-right">LTV</TableHead>
                  <TableHead>Best Channel</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSegments.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", row.color)} />
                        {row.name}
                        {row.growth.startsWith("+") && (
                          <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            {row.growth}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.size}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.cvr}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.ltv}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{row.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Target</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Category affinity</CardTitle>
            <CardDescription>Purchase likelihood vs. market baseline (100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {categoryAffinity.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className="tabular-nums text-xs font-medium text-muted-foreground">{cat.index}x</span>
                  </div>
                  <Progress value={cat.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase intent signals + Retargeting pools */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" aria-hidden />
              <CardTitle className="text-sm font-medium">Purchase intent signals</CardTitle>
            </div>
            <CardDescription>Behavioral patterns correlated with conversion</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signal</TableHead>
                  <TableHead className="text-right">Shoppers</TableHead>
                  <TableHead className="text-right">CVR lift</TableHead>
                  <TableHead>Strength</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeIntentSignals.map((row) => (
                  <TableRow key={row.signal}>
                    <TableCell className="font-medium text-sm">{row.signal}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{row.shoppers}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {row.cvrLift}
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", strengthConfig[row.strength])}>
                        {row.strength}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" aria-hidden />
              <CardTitle className="text-sm font-medium">Retargeting pools</CardTitle>
            </div>
            <CardDescription>Activation-ready audiences with estimated performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {activeRetargetingPools.map((pool) => (
                <div key={pool.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{pool.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {pool.size} shoppers · est. {pool.estCvr} CVR
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="font-normal">{pool.channel}</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Activate</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
