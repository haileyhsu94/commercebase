import { useState } from "react"
import { Link } from "react-router-dom"
import {
  TrendingDown,
  TrendingUp,
  ExternalLink,
  Search,
  ArrowRight,
} from "lucide-react"
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
import {
  publisherMetrics,
  networkSegments,
  publishersList,
} from "@/lib/assets-mock"
import { cn } from "@/lib/utils"

const TYPE_COLORS: Record<string, string> = {
  Owned:       "bg-primary/10 text-primary border-primary/20",
  Programmatic:"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  Partner:     "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
  Vertical:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  Aggregator:  "bg-muted text-muted-foreground border-border",
}

export function PublishersPage() {
  const [query, setQuery] = useState("")

  const filtered = publishersList.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.type.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-6 pb-8">

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {publisherMetrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"
          const TrendIcon = isPositive ? TrendingUp : TrendingDown

          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{metric.value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-bold",
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    <TrendIcon className="size-3" />
                    {metric.change}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    vs last 30d
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Channel Segments ──────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Supply channels</h2>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" asChild>
            <Link to="/analytics/channels">
              Channel attribution
              <ArrowRight className="size-3" />
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
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold">Publisher directory</CardTitle>
            <CardDescription>Individual partner performance and connectivity</CardDescription>
          </div>
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
        </CardHeader>
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No publishers match &ldquo;{query}&rdquo;
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((pub) => (
                  <TableRow key={pub.id} className="group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        {pub.name}
                        <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          TYPE_COLORS[pub.type] ?? TYPE_COLORS["Aggregator"],
                        )}
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
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {pub.roas}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                      {pub.campaigns > 0 ? (
                        <span className="font-medium text-foreground">{pub.campaigns}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase",
                          pub.status === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
                        )}
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
        <div className="flex items-center justify-center border-t bg-muted/10 p-4">
          <Button variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground">
            Load 40 more active partners
          </Button>
        </div>
      </Card>
    </div>
  )
}
