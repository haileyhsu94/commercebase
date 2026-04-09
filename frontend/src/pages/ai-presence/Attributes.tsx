import { useEffect, useMemo, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Gauge,
  ListChecks,
  Sparkles,
  TriangleAlert,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { attributeCoverage } from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"

const impactConfig = {
  high: {
    dot: "bg-red-500",
    pill: "bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300",
    label: "High AI impact",
  },
  medium: {
    dot: "bg-amber-500",
    pill: "bg-amber-400/10 border-amber-400/25 text-amber-700 dark:text-amber-300",
    label: "Medium AI impact",
  },
  low: {
    dot: "bg-muted-foreground",
    pill: "bg-muted border-border text-muted-foreground",
    label: "Low AI impact",
  },
} as const

function barColor(pct: number, gap: boolean) {
  if (!gap) return "bg-emerald-500"
  if (pct >= 70) return "bg-amber-500"
  return "bg-red-500"
}

/** Inline mini coverage bar used inside dialog tables */
function CoverageBar({ pct, gap }: { pct: number; gap: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", barColor(pct, gap))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums text-xs font-medium">{pct}%</span>
    </div>
  )
}

export function AttributesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const shouldHighlight = searchParams.get("highlight") === "coverage"

  useEffect(() => {
    if (shouldHighlight && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      const timeout = setTimeout(() => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev)
            next.delete("highlight")
            return next
          },
          { replace: true }
        )
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [shouldHighlight, setSearchParams])

  const { gapRows, healthyRows, stats, allSorted, highImpactGapRows, affectedRows } = useMemo(() => {
    const gap = attributeCoverage
      .filter((r) => r.gap)
      .sort((a, b) => {
        if (a.aiImpact !== b.aiImpact) return a.aiImpact === "high" ? -1 : 1
        return a.coveragePct - b.coveragePct
      })
    const healthy = attributeCoverage
      .filter((r) => !r.gap)
      .sort((a, b) => b.coveragePct - a.coveragePct)

    const total = attributeCoverage.length
    const avg = Math.round(
      attributeCoverage.reduce((s, r) => s + r.coveragePct, 0) / total
    )
    const totalMissing = gap.reduce((s, r) => s + r.missingSKUs, 0)
    const highImpactGaps = gap.filter((r) => r.aiImpact === "high").length

    // Dialog-specific row sets
    const allSorted = [...attributeCoverage].sort((a, b) => a.coveragePct - b.coveragePct)
    const highImpactGapRows = gap.filter((r) => r.aiImpact === "high")
    const affectedRows = [...gap].sort((a, b) => b.missingSKUs - a.missingSKUs)

    return {
      gapRows: gap,
      healthyRows: healthy,
      stats: { avg, totalMissing, highImpactGaps },
      allSorted,
      highImpactGapRows,
      affectedRows,
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* ── Summary KPIs (each card opens a dialog) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Coverage health</CardTitle>
          <CardDescription>
            Gaps in structured data reduce how often AI engines recommend your products. Fix high-impact
            attributes first for the fastest visibility lift.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">

            {/* ── KPI 1: Catalog completeness ── */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent transition-all hover:bg-muted hover:ring-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Gauge className="size-3.5 shrink-0" />
                      Catalog completeness
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{stats.avg}%</p>
                  <Badge
                    variant="outline"
                    className={
                      stats.avg >= 80
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    }
                  >
                    {stats.avg >= 80 ? "Good" : "Needs work"}
                  </Badge>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Catalog completeness — all attributes</DialogTitle>
                  <DialogDescription>
                    Every attribute your catalog is tracked on, sorted from lowest to highest coverage.
                  </DialogDescription>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attribute</TableHead>
                      <TableHead>AI impact</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead className="text-right">Missing SKUs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSorted.map((row) => (
                      <TableRow key={row.attribute}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            {row.gap
                              ? <TriangleAlert className="size-3.5 shrink-0 text-amber-500" />
                              : <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                            }
                            {row.attribute}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.aiImpact === "high" ? "default" : "secondary"} className="text-[10px]">
                            {row.aiImpact}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <CoverageBar pct={row.coveragePct} gap={row.gap} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {row.missingSKUs > 0 ? row.missingSKUs.toLocaleString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>

            {/* ── KPI 2: High-impact gaps ── */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent transition-all hover:bg-muted hover:ring-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Zap className="size-3.5 shrink-0 text-destructive" />
                      High-impact gaps
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-destructive">{stats.highImpactGaps}</p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    attributes directly hurting AI citations
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>High-impact gaps</DialogTitle>
                  <DialogDescription>
                    These attributes have both a coverage gap and a high direct influence on AI engine
                    recommendations. Fix them first.
                  </DialogDescription>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attribute</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead className="text-right">Missing SKUs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highImpactGapRows.map((row) => (
                      <TableRow key={row.attribute}>
                        <TableCell>
                          <p className="font-medium">{row.attribute}</p>
                          {row.whyItMatters && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{row.whyItMatters}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <CoverageBar pct={row.coveragePct} gap={row.gap} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-destructive">
                          {row.missingSKUs.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>

            {/* ── KPI 3: Products affected ── */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent transition-all hover:bg-muted hover:ring-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ListChecks className="size-3.5 shrink-0" />
                      Products affected
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{stats.totalMissing.toLocaleString()}</p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    SKUs with at least one gap
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>SKUs missing attribute data</DialogTitle>
                  <DialogDescription>
                    Breakdown by attribute — sorted by the number of affected SKUs. Click "View SKUs" to
                    see exactly which products are missing each attribute.
                  </DialogDescription>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attribute</TableHead>
                      <TableHead>AI impact</TableHead>
                      <TableHead className="text-right">Missing SKUs</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affectedRows.map((row) => (
                      <TableRow key={row.attribute}>
                        <TableCell className="font-medium">{row.attribute}</TableCell>
                        <TableCell>
                          <Badge variant={row.aiImpact === "high" ? "default" : "secondary"} className="text-[10px]">
                            {row.aiImpact}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {row.missingSKUs.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <CoverageBar pct={row.coveragePct} gap={row.gap} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            render={
                              <Link
                                to={`/products?missing=${encodeURIComponent(row.attribute)}`}
                              />
                            }
                          >
                            View SKUs
                            <ArrowRight className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>

          </div>
        </CardContent>
      </Card>

      {/* ── Context orientation ── */}
      <p className="text-xs text-muted-foreground">
        Each bar shows what share of your active SKUs have this attribute filled in. Gaps mean AI engines
        may skip or misrepresent your products.
      </p>

      {/* ── Needs attention ── */}
      <Card
        ref={cardRef}
        className={cn(
          "transition-all duration-700",
          shouldHighlight && "animate-pulse ring-2 ring-primary/50"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                Needs attention
                <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {gapRows.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Sorted by impact — fix the top items first to see the fastest improvement in AI
                recommendations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border/60 p-0">
          {gapRows.map((row, index) => {
            const cfg = impactConfig[row.aiImpact as keyof typeof impactConfig] ?? impactConfig.low
            return (
              <div key={row.attribute} className="space-y-3 px-6 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{row.attribute}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            cfg.pill
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full", cfg.dot)} aria-hidden />
                          {cfg.label}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        render={<Link to="/products" />}
                      >
                        Enrich {row.missingSKUs} SKUs
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            barColor(row.coveragePct, row.gap)
                          )}
                          style={{ width: `${row.coveragePct}%` }}
                        />
                      </div>
                      <span className="w-24 shrink-0 text-right text-xs tabular-nums">
                        <span className="font-semibold">{row.coveragePct}%</span>
                        <span className="text-muted-foreground"> covered</span>
                      </span>
                    </div>

                    {row.whyItMatters && (
                      <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        <Sparkles className="mt-0.5 size-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                        <p className="text-xs leading-relaxed text-foreground/80">{row.whyItMatters}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── Looking good ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                Looking good
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {healthyRows.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                These attributes are well-covered — AI engines can reliably use them when recommending
                your products.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          {healthyRows.map((row) => (
            <div key={row.attribute} className="flex items-center gap-3 px-6 py-3.5">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-sm font-medium">{row.attribute}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {row.aiImpact} AI impact
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${row.coveragePct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                    {row.coveragePct}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
