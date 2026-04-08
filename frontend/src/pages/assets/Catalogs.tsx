import {
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  catalogMetrics,
  productFeeds,
  feedIssues,
  catalogCategoryPerformance,
} from "@/lib/assets-mock"
import { cn } from "@/lib/utils"

const FEED_STATUS_CONFIG = {
  healthy: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
    icon: CheckCircle2,
    label: "Healthy",
  },
  syncing: {
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
    icon: Loader2,
    label: "Syncing",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
    icon: AlertTriangle,
    label: "Warning",
  },
} as const

const IMPACT_CONFIG = {
  High:   { row: "bg-red-50 text-red-600 dark:bg-red-950/20",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  Medium: { row: "bg-amber-50 text-amber-600 dark:bg-amber-950/20", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  Low:    { row: "bg-blue-50 text-blue-600 dark:bg-blue-950/20",  badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
} as const

const totalRevenueAtRisk = "$8.4K"
const totalSuppressed = "257K"

export function CatalogsPage() {
  return (
    <div className="space-y-6 pb-8">

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {catalogMetrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"

          return (
            <Card key={metric.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{metric.value}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-semibold",
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {metric.change}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    vs last sync
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Product Feeds ─────────────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Product feeds</CardTitle>
              <CardDescription>Live sync status across all connected platforms</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <RefreshCw className="size-3.5" />
              Sync all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Feed name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="pl-6">Last sync</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productFeeds.map((feed) => {
                  const config = FEED_STATUS_CONFIG[feed.status as keyof typeof FEED_STATUS_CONFIG]
                  const StatusIcon = config.icon
                  return (
                    <TableRow key={feed.id}>
                      <TableCell className="py-4 pl-6">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{feed.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {feed.source}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1 text-[10px] font-medium capitalize", config.badge)}>
                          <StatusIcon className={cn("size-3", feed.status === "syncing" && "animate-spin")} />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium">
                        {feed.items.toLocaleString()}
                      </TableCell>
                      <TableCell className="pl-6">
                        {feed.status === "syncing" ? (
                          <div className="space-y-1.5 min-w-[140px]">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground italic">Syncing…</span>
                              <span className="font-bold">{feed.syncProgress}%</span>
                            </div>
                            <Progress value={feed.syncProgress} className="h-1.5" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">{feed.lastSync}</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {feed.status === "warning" ? (
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800">
                            <AlertTriangle className="size-3" />
                            View issues
                          </Button>
                        ) : feed.status === "syncing" ? (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>
                            Syncing…
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                            <RefreshCw className="size-3" />
                            Sync now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
          <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
            <p className="text-xs italic text-muted-foreground">Last global check 4 mins ago</p>
            <Button variant="link" size="sm" className="h-auto gap-1 p-0 text-xs">
              View full sync history
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </Card>

        {/* ── Category Performance ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Performance by category</CardTitle>
            <CardDescription>ROI impact of your catalog segments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {catalogCategoryPerformance.map((category) => (
              <div
                key={category.name}
                className="group flex cursor-default items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium transition-colors group-hover:text-primary">
                    {category.name}
                  </p>
                  <p className="tabular-nums text-[10px] uppercase text-muted-foreground">
                    {category.revenue}
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="tabular-nums text-sm font-bold">{category.roas} ROAS</p>
                  <div className="flex items-center justify-end gap-1">
                    {category.trend === "up" ? (
                      <TrendingUp className="size-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3 text-red-500" />
                    )}
                    <span className="tabular-nums text-[11px] font-medium text-muted-foreground">
                      {category.cvr} CVR
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="mt-2 border-t px-6 py-4">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <BarChart3 className="size-3.5" />
              Full category report
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Feed Issues ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Feed issues & optimisation</CardTitle>
            <CardDescription>
              Items blocked or suppressed due to missing attributes
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              482 critical fixes
            </Badge>
          </div>
        </CardHeader>

        {/* AI impact callout */}
        <div className="mx-6 mb-2 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {totalRevenueAtRisk} in suppressed revenue · {totalSuppressed} impressions blocked
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              Fixing these issues restores eligibility across CommerceMax channels and improves AI intent match accuracy.
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
          >
            <Sparkles className="size-3" />
            Fix all with Aeris
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col">
            {feedIssues.map((issue, idx) => {
              const impact = issue.impact as keyof typeof IMPACT_CONFIG
              const cfg = IMPACT_CONFIG[impact]
              return (
                <div
                  key={issue.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-5 transition-colors hover:bg-muted/30",
                    idx !== feedIssues.length - 1 && "border-b",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      cfg.row,
                    )}
                  >
                    <AlertCircle className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold">{issue.title}</h4>
                      <Badge variant="outline" className="py-0.5 text-[10px] font-bold uppercase">
                        {issue.count} items
                      </Badge>
                      <span
                        className={cn(
                          "rounded-sm px-1.5 text-[10px] font-bold uppercase tracking-wider",
                          cfg.badge,
                        )}
                      >
                        {issue.impact} impact
                      </span>
                    </div>
                    <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-3 pt-0.5 text-[11px] text-muted-foreground">
                      <span>
                        <span className="font-semibold text-foreground">{issue.revenueAtRisk}</span>{" "}
                        revenue at risk
                      </span>
                      <span className="text-border">·</span>
                      <span>
                        <span className="font-semibold text-foreground">{issue.suppressedImpressions}</span>{" "}
                        impressions suppressed
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
                      Ignore
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                      <Sparkles className="size-3" />
                      Fix with Aeris
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <div className="flex justify-center border-t p-6">
          <Button
            variant="link"
            className="text-sm font-medium text-muted-foreground underline"
          >
            View all 14 data quality rules
          </Button>
        </div>
      </Card>
    </div>
  )
}
