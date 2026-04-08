import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  catalogMetrics,
  productFeeds,
  feedIssues as initialFeedIssues,
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

const PAGE_SIZE = 15

export function CatalogsPage() {
  const navigate = useNavigate()
  const [feedIssues, setFeedIssues] = useState(initialFeedIssues)
  const [syncingFeeds, setSyncingFeeds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const totalRevenueAtRisk = `$${feedIssues.reduce((sum, i) => {
    const val = i.revenueAtRisk.replace(/[$,K]/g, "")
    const n = parseFloat(val)
    if (isNaN(n)) return sum
    return sum + (i.revenueAtRisk.includes("K") ? n * 1000 : n)
  }, 0).toLocaleString()}`

  const totalSuppressed = `${Math.round(
    feedIssues.reduce((sum, i) => {
      const val = i.suppressedImpressions.replace(/K/g, "")
      const n = parseFloat(val)
      if (isNaN(n)) return sum
      return sum + (i.suppressedImpressions.includes("K") ? n * 1000 : n)
    }, 0) / 1000,
  )}K`

  const totalPages = Math.ceil(feedIssues.length / PAGE_SIZE)
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return feedIssues.slice(start, start + PAGE_SIZE)
  }, [feedIssues, currentPage])

  function handleSyncFeed(feedId: string, feedName: string) {
    if (syncingFeeds.has(feedId)) return
    setSyncingFeeds((s) => new Set([...s, feedId]))
    toast.loading(`Syncing ${feedName}…`, { id: `sync-${feedId}` })
    setTimeout(() => {
      setSyncingFeeds((s) => { const next = new Set(s); next.delete(feedId); return next })
      toast.success(`${feedName} synced successfully`, { id: `sync-${feedId}` })
    }, 2500)
  }

  function handleSyncAll() {
    toast.loading("Syncing all feeds…", { id: "sync-all" })
    setTimeout(() => {
      toast.success("All feeds synced successfully", { id: "sync-all" })
    }, 3000)
  }

  function handleIgnoreIssue(issueId: string, title: string) {
    setFeedIssues((prev) => prev.filter((i) => i.id !== issueId))
    toast.info(`"${title}" dismissed`, {
      action: { label: "Undo", onClick: () => setFeedIssues(initialFeedIssues) },
    })
  }

  function handleFixWithAeris(title: string) {
    toast.promise(
      new Promise<void>((res) => setTimeout(res, 2000)),
      {
        loading: `Aeris is reviewing "${title}"…`,
        success: `Aeris drafted fixes for "${title}"`,
        error: "Something went wrong",
      },
    )
  }

  function handleFixAll() {
    toast.promise(
      new Promise<void>((res) => setTimeout(res, 3000)),
      {
        loading: `Aeris is reviewing all ${feedIssues.reduce((s, i) => s + i.count, 0)} issues…`,
        success: "Aeris has drafted fixes — review in the Inbox",
        error: "Something went wrong",
      },
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ... KPI strip ... */}
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
                  <span className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                  )}>
                    {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
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
        {/* ... Product Feeds ... */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Product feeds</CardTitle>
              <CardDescription>Live sync status across all connected platforms</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSyncAll}>
                <RefreshCw className="size-3.5" />
                Sync all
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => toast.info("Add feed coming soon")}>
                Add feed
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Feed name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Issues</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="pl-6">Sync</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productFeeds.map((feed) => {
                  const isSyncing = syncingFeeds.has(feed.id) || feed.status === "syncing"
                  const effectiveStatus = syncingFeeds.has(feed.id) ? "syncing" : feed.status
                  const config = FEED_STATUS_CONFIG[effectiveStatus as keyof typeof FEED_STATUS_CONFIG]
                  const StatusIcon = config.icon
                  const healthColor =
                    feed.health >= 95 ? "text-emerald-600 dark:text-emerald-400"
                    : feed.health >= 80 ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                  return (
                    <TableRow key={feed.id}>
                      <TableCell className="py-4 pl-6">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{feed.name}</p>
                          <p className="text-[10px] text-muted-foreground">{feed.source}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1 text-[10px] font-medium capitalize", config.badge)}>
                          <StatusIcon className={cn("size-3", isSyncing && "animate-spin")} />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {feed.issues > 0 ? (
                          <span className="tabular-nums text-xs font-semibold text-red-600 dark:text-red-400">
                            {feed.issues}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="tabular-nums text-sm font-medium">{feed.items.toLocaleString()}</p>
                        <p className={cn("tabular-nums text-[10px] font-semibold", healthColor)}>
                          {feed.health}% healthy
                        </p>
                      </TableCell>
                      <TableCell className="pl-6">
                        {isSyncing ? (
                          <div className="min-w-[130px] space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="italic text-muted-foreground">Syncing…</span>
                              <span className="font-bold">{feed.syncProgress}%</span>
                            </div>
                            <Progress value={feed.syncProgress} className="h-1.5" />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">{feed.lastSync}</p>
                            <p className="text-[10px] text-muted-foreground/60">
                              Next: {feed.nextSync}
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {effectiveStatus === "warning" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800"
                            onClick={() => {
                              document.getElementById("feed-issues")?.scrollIntoView({ behavior: "smooth" })
                              toast.info("Showing feed issues below")
                            }}
                          >
                            <AlertTriangle className="size-3" />
                            View issues
                          </Button>
                        ) : isSyncing ? (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>
                            Syncing…
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => handleSyncFeed(feed.id, feed.name)}
                          >
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
            <Button
              variant="link"
              size="sm"
              className="h-auto gap-1 p-0 text-xs"
              onClick={() => toast.info("Sync history coming soon")}
            >
              View full sync history
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </Card>

        {/* ... Category Performance ... */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Performance by category</CardTitle>
            <CardDescription>ROI impact of your catalog segments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 text-[11px]">Category</TableHead>
                  <TableHead className="text-right text-[11px]">Products</TableHead>
                  <TableHead className="text-right text-[11px]">Share</TableHead>
                  <TableHead className="pr-6 text-right text-[11px]">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogCategoryPerformance.map((cat) => (
                  <TableRow key={cat.name} className="group">
                    <TableCell className="py-3 pl-6">
                      <div className="flex items-center gap-1.5">
                        {cat.trend === "up"
                          ? <TrendingUp className="size-3 shrink-0 text-emerald-500" />
                          : <TrendingDown className="size-3 shrink-0 text-red-500" />}
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <p className="pl-4.5 mt-0.5 pl-[18px] text-[10px] tabular-nums text-muted-foreground">{cat.cvr} CVR</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-medium">
                      {cat.productCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                      {cat.share}%
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {cat.roas}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={() => navigate("/analytics/products")}
            >
              <BarChart3 className="size-3.5" />
              Full category report
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Feed Issues ─────────────────────────────────────────────────── */}
      <Card id="feed-issues">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Feed issues & optimisation</CardTitle>
            <CardDescription>Items blocked or suppressed due to missing attributes</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {feedIssues.reduce((s, i) => s + i.count, 0)} critical fixes
          </Badge>
        </CardHeader>

        {feedIssues.length > 0 && (
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
              className="h-8 shrink-0 gap-1.5 border-0 bg-amber-600 text-xs text-white hover:bg-amber-700"
              onClick={handleFixAll}
            >
              <Sparkles className="size-3" />
              Fix all with Aeris
            </Button>
          </div>
        )}

        <CardContent className="p-0">
          <div className="flex flex-col">
            {feedIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="text-sm font-medium">All feed issues resolved</p>
                <p className="text-xs text-muted-foreground">Your catalog is fully optimised for CommerceMax.</p>
              </div>
            ) : (
              paginatedIssues.map((issue, idx) => {
                const impact = issue.impact as keyof typeof IMPACT_CONFIG
                const cfg = IMPACT_CONFIG[impact]
                return (
                  <div
                    key={issue.id}
                    className={cn(
                      "flex items-start gap-4 px-6 py-5 transition-colors hover:bg-muted/30",
                      idx !== paginatedIssues.length - 1 && "border-b",
                    )}
                  >
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", cfg.row)}>
                      <AlertCircle className="size-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold">{issue.title}</h4>
                          <Badge variant="outline" className="py-0.5 text-[10px] font-bold uppercase">
                            {issue.count} items
                          </Badge>
                          <span className={cn("rounded-sm px-1.5 text-[10px] font-bold uppercase tracking-wider", cfg.badge)}>
                            {issue.impact} impact
                          </span>
                        </div>
                        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{issue.description}</p>
                        <div className="flex items-center gap-3 pt-0.5 text-[11px] text-muted-foreground">
                          <span>
                            <span className="font-semibold text-foreground">{issue.revenueAtRisk}</span> revenue at risk
                          </span>
                          <span className="text-border">·</span>
                          <span>
                            <span className="font-semibold text-foreground">{issue.suppressedImpressions}</span> impressions suppressed
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          onClick={() => handleIgnoreIssue(issue.id, issue.title)}
                        >
                          Ignore
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-semibold"
                          onClick={() => handleFixWithAeris(issue.title)}
                        >
                          <Sparkles className="size-3" />
                          Fix with Aeris
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>

        {totalPages > 1 && (
          <div className="border-t bg-muted/10 p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(i + 1)
                      }}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  )
}
