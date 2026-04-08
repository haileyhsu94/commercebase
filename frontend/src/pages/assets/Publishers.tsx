import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  Target,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  publisherMetrics,
  networkSegments,
  publishersList,
  type PublisherType,
} from "@/lib/assets-mock"
import { cn } from "@/lib/utils"

const TYPE_COLORS: Record<PublisherType, string> = {
  "Owned Media":  "bg-primary/10 text-primary border-primary/20",
  "Embedded":     "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  "Whitelisted":  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  "Direct Deal":  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
}

const STATUS_COLORS = {
  active:  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
  paused:  "border-border bg-muted text-muted-foreground",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
}

const TABS = ["All", "Owned Media", "Embedded", "Whitelisted", "Direct Deal"] as const
type Tab = typeof TABS[number]

const PAGE_SIZE = 15

export function PublishersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All")
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    return publishersList.filter((p) => {
      const matchesTab = activeTab === "All" || p.type === activeTab
      const q = query.toLowerCase()
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [activeTab, query])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, query])

  return (
    <div className="space-y-6 pb-8">

      {/* ── Stat strip ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap divide-x divide-white/10 rounded-xl bg-foreground">
        {publisherMetrics.map((metric) => {
          const isPositive = metric.trend === "up"
          const TrendIcon = isPositive ? TrendingUp : TrendingDown
          return (
            <div key={metric.title} className="flex min-w-0 flex-1 flex-col gap-1 px-5 py-4">
              <span className="text-[11px] font-medium uppercase tracking-wide text-background/50">
                {metric.title}
              </span>
              <span className="text-2xl font-bold tabular-nums text-background">{metric.value}</span>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  isPositive ? "text-emerald-400" : "text-red-400"
                )}>
                  <TrendIcon className="size-3" />
                  {metric.change}
                </span>
                <span className="text-[10px] text-background/40">{metric.context}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Channel Segments ──────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Supply channels</h2>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" asChild>
            <Link to="/analytics/channels" className="flex items-center gap-1">
              Channel attribution
              <ArrowRight className="size-3 shrink-0" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {networkSegments.map((segment) => {
            const Icon = segment.icon
            return (
              <Card key={segment.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{segment.name}</CardTitle>
                  <div className={cn("flex size-8 items-center justify-center rounded-lg", segment.bg)}>
                    <Icon className={cn("size-4", segment.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{segment.impressions}</div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-xs text-muted-foreground">Impressions</span>
                    <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {segment.roas} ROAS
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── Publisher Directory ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold">Publisher directory</CardTitle>
              <CardDescription>Individual partner performance and connectivity</CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Filter publishers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 w-full bg-muted/30 pl-9 text-xs focus-visible:ring-1"
                />
              </div>
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => toast.info("Add publisher coming soon")}
              >
                <Plus className="size-3.5" />
                Add publisher
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Tab switch — same pattern as Competitors & Gaps */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <div className="px-6">
            <TabsList className="mb-3">
              {TABS.map((tab) => {
                const count = tab === "All"
                  ? publishersList.length
                  : publishersList.filter((p) => p.type === tab).length
                return (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                    <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-muted text-[10px] font-bold leading-none text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[220px] pl-6">Publisher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="text-right">Campaigns</TableHead>
                <TableHead className="pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No publishers match &ldquo;{query}&rdquo;
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((pub) => (
                  <TableRow key={pub.id} className="group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {pub.name}
                        <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-medium", TYPE_COLORS[pub.type])}
                      >
                        {pub.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {pub.impressions}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {pub.cvr}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-bold">
                      {pub.revenue}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {pub.roas !== "—" ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {pub.roas}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {pub.campaigns > 0 ? (
                        <span className="font-medium text-foreground">{pub.campaigns}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-bold uppercase", STATUS_COLORS[pub.status])}
                      >
                        {pub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
        </Tabs>
      </Card>

      {/* ── Growth target ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
            <Target className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Publisher network growth</p>
            <p className="text-xs text-muted-foreground">
              Target: 50+ publisher partners by Q3 2026 — currently at 47
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 text-xs"
          onClick={() => toast.info("Publisher request form coming soon")}
        >
          Request new publisher
          <ArrowRight className="size-3" />
        </Button>
      </div>

    </div>
  )
}
