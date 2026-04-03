import { useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { PlatformLogo } from "@/components/shared/PlatformLogo"
import { VisibilityScoreGauge } from "@/components/shared/VisibilityScoreGauge"
import { cn } from "@/lib/utils"
import { seoGeoRows } from "@/lib/ai-presence-mock"
import {
  contentGapRows,
  geoEngineRows,
  optimizationScores,
  optimizeKpis,
  optimizeProductRows,
  scoreTrendData,
  technicalAuditItems,
  trendingTopics,
  type AuditSeverity,
} from "@/lib/optimize-mock"

const trendChartConfig = {
  seo: { label: "SEO", color: "var(--color-chart-1)" },
  geo: { label: "GEO", color: "var(--color-chart-2)" },
} satisfies ChartConfig

function severityStyles(s: AuditSeverity) {
  switch (s) {
    case "fail":
      return "border-destructive/30 bg-destructive/5"
    case "warn":
      return "border-amber-500/40 bg-amber-500/5"
    default:
      return "border-emerald-500/30 bg-emerald-500/5"
  }
}

function toneStyles(tone: (typeof trendingTopics)[number]["tone"]) {
  switch (tone) {
    case "hot":
      return "border-orange-500/30 bg-orange-500/5"
    case "risk":
      return "border-red-500/30 bg-red-500/5"
    default:
      return "border-amber-500/25 bg-amber-500/5"
  }
}

function geoPercentNumber(s: string) {
  const n = Number.parseFloat(s.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function geoCitationRateClass(rate: string) {
  const n = geoPercentNumber(rate)
  if (n >= 15) return "font-semibold text-emerald-600 dark:text-emerald-400"
  if (n >= 8) return "font-medium text-foreground"
  return "text-amber-700 dark:text-amber-300"
}

function geoTrendClass(trend: string) {
  const t = trend.trim()
  if (t.startsWith("+")) return "font-semibold text-emerald-600 dark:text-emerald-400"
  if (t.startsWith("−") || t.startsWith("-")) return "font-semibold text-red-600 dark:text-red-400"
  return "text-muted-foreground"
}

type ProductSortKey = "seo" | "geo" | "mentions" | "rank"

function parseRankForSort(rank: string): number | null {
  const m = /^#(\d+)$/.exec(rank.trim())
  if (m) return Number.parseInt(m[1], 10)
  return null
}

function compareOptimizeProducts(
  a: (typeof optimizeProductRows)[number],
  b: (typeof optimizeProductRows)[number],
  key: ProductSortKey,
  dir: "asc" | "desc"
): number {
  const mult = dir === "asc" ? 1 : -1
  if (key === "rank") {
    const ra = parseRankForSort(a.rank)
    const rb = parseRankForSort(b.rank)
    if (ra === null && rb === null) return a.sku.localeCompare(b.sku)
    if (ra === null) return 1
    if (rb === null) return -1
    if (ra !== rb) return mult * (ra - rb)
    return a.sku.localeCompare(b.sku)
  }
  const va = a[key]
  const vb = b[key]
  if (va !== vb) return mult * (va < vb ? -1 : 1)
  return a.sku.localeCompare(b.sku)
}

function ProductTableSortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: "asc" | "desc"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex w-full items-center justify-end gap-1 rounded-md px-1 py-0.5 -mr-1 font-medium hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex size-4 shrink-0 items-center justify-center">
          {!active ? (
            <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
          ) : dir === "asc" ? (
            <ArrowUp className="size-3.5" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5" aria-hidden />
          )}
        </span>
      </span>
    </button>
  )
}

type AuditTab = "all" | AuditSeverity
type AuditCategoryScope = "all" | "seo" | "geo"

function matchesCategoryScope(
  category: (typeof technicalAuditItems)[number]["category"],
  scope: AuditCategoryScope
) {
  if (scope === "all") return true
  if (scope === "seo") return category === "SEO" || category === "SEO + GEO"
  return category === "GEO" || category === "SEO + GEO"
}

export function OptimizePage() {
  const [auditFilter, setAuditFilter] = useState<AuditTab>("all")
  const [auditCategoryScope, setAuditCategoryScope] = useState<AuditCategoryScope>("all")
  const auditSectionRef = useRef<HTMLDivElement>(null)

  const filteredAudit = useMemo(() => {
    return technicalAuditItems.filter((a) => {
      const severityOk = auditFilter === "all" || a.severity === auditFilter
      const categoryOk = matchesCategoryScope(a.category, auditCategoryScope)
      return severityOk && categoryOk
    })
  }, [auditFilter, auditCategoryScope])

  const auditCounts = useMemo(() => {
    const fail = technicalAuditItems.filter((a) => a.severity === "fail").length
    const warn = technicalAuditItems.filter((a) => a.severity === "warn").length
    const pass = technicalAuditItems.filter((a) => a.severity === "pass").length
    return { fail, warn, pass, total: technicalAuditItems.length }
  }, [])

  const auditCategoryCounts = useMemo(() => {
    const seo = technicalAuditItems.filter((a) => matchesCategoryScope(a.category, "seo")).length
    const geo = technicalAuditItems.filter((a) => matchesCategoryScope(a.category, "geo")).length
    return { seo, geo }
  }, [])

  const [productSort, setProductSort] = useState<{
    key: ProductSortKey
    dir: "asc" | "desc"
  }>({ key: "seo", dir: "desc" })

  const sortedProductRows = useMemo(() => {
    const rows = [...optimizeProductRows]
    rows.sort((a, b) => compareOptimizeProducts(a, b, productSort.key, productSort.dir))
    return rows
  }, [productSort])

  function toggleProductSort(key: ProductSortKey) {
    setProductSort((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      }
      return { key, dir: key === "rank" ? "asc" : "desc" }
    })
  }

  function goToAuditFilter(severity: Exclude<AuditTab, "all">) {
    setAuditFilter(severity)
    queueMicrotask(() => {
      auditSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
      <Card className="min-w-0 h-full">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Optimization snapshot</CardTitle>
            <CardDescription className="max-w-2xl">
              Combined SEO and GEO scores reflect overall health. The check counts below are from the{" "}
              <span className="font-medium text-foreground">same technical audit</span> — how many rules
              passed, need attention, or failed in that run (mock).
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2">
            <RefreshCw className="size-4" />
            Re-scan
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border border-border/80 bg-muted/30 px-3 py-4">
              <p className="text-xs font-medium text-muted-foreground">{optimizationScores.combinedLabel}</p>
              <div className="py-1">
                <VisibilityScoreGauge
                  score={optimizationScores.combined}
                  size="md"
                  showLabel={false}
                  ariaLabel={`Combined optimization score: ${optimizationScores.combined} out of 100`}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">of 100</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">Overall health</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border/80 bg-muted/30 px-3 py-4">
              <p className="text-xs font-medium text-muted-foreground">{optimizationScores.seoLabel}</p>
              <div className="py-1">
                <VisibilityScoreGauge
                  score={optimizationScores.seo}
                  size="md"
                  showLabel={false}
                  ariaLabel={`SEO score: ${optimizationScores.seo} out of 100`}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">of 100</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">{optimizationScores.seoSub}</p>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border/80 bg-muted/30 px-3 py-4">
              <p className="text-xs font-medium text-muted-foreground">{optimizationScores.geoLabel}</p>
              <div className="py-1">
                <VisibilityScoreGauge
                  score={optimizationScores.geo}
                  size="md"
                  showLabel={false}
                  ariaLabel={`GEO score: ${optimizationScores.geo} out of 100`}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">of 100</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">{optimizationScores.geoSub}</p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Same audit — technical check results
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Select a category to jump to the technical audit and filter the list.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => goToAuditFilter("pass")}
                aria-pressed={auditFilter === "pass"}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  auditFilter === "pass" && "ring-2 ring-emerald-500/50"
                )}
              >
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{auditCounts.pass}</p>
                  <p className="text-xs text-muted-foreground">Passing checks</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => goToAuditFilter("warn")}
                aria-pressed={auditFilter === "warn"}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  "border-amber-500/35 bg-amber-500/5 hover:bg-amber-500/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  auditFilter === "warn" && "ring-2 ring-amber-500/50"
                )}
              >
                <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{auditCounts.warn}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => goToAuditFilter("fail")}
                aria-pressed={auditFilter === "fail"}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  "border-red-500/30 bg-red-500/5 hover:bg-red-500/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  auditFilter === "fail" && "ring-2 ring-red-500/50"
                )}
              >
                <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{auditCounts.fail}</p>
                  <p className="text-xs text-muted-foreground">Failing checks</p>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-0 min-w-0 h-full flex-col">
        <CardHeader>
          <CardTitle className="text-base">Score trend</CardTitle>
          <CardDescription>SEO vs GEO over the last several weeks (mock)</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <ChartContainer config={trendChartConfig} className="aspect-auto h-[240px] min-h-[220px] w-full flex-1">
            <LineChart data={scoreTrendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis
                domain={[40, 100]}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v) => `${v}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="seo"
                stroke="var(--color-seo)"
                strokeWidth={2}
                dot={false}
                name="SEO"
              />
              <Line
                type="monotone"
                dataKey="geo"
                stroke="var(--color-geo)"
                strokeWidth={2}
                dot={false}
                name="GEO"
              />
            </LineChart>
          </ChartContainer>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--color-chart-1)]" />
              SEO
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--color-chart-2)]" />
              GEO
            </span>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {optimizeKpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardDescription>{k.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{k.value}</CardTitle>
              <p className="text-xs text-muted-foreground">{k.delta}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">Trending in AI Search</CardTitle>
              <CardDescription>
                What shoppers are talking about on Reddit, review sites, and AI engines right now — and how it
                affects your visibility.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit shrink-0">
              Live from Reddit + industry data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((t) => (
            <div
              key={t.rank}
              className={cn("rounded-lg border p-4", toneStyles(t.tone))}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium text-muted-foreground tabular-nums">{t.rank}.</span>
                <span className="text-lg" aria-hidden>
                  {t.tone === "hot" ? "🔥" : t.tone === "risk" ? "🔴" : "🟡"}
                </span>
                <h3 className="min-w-0 flex-1 font-semibold leading-snug">{t.title}</h3>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {t.badge}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.sourceUrl ? (
                  <a
                    href={t.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {t.source}
                  </a>
                ) : (
                  t.source
                )}
              </p>
              <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-foreground/90">
                {t.quote}
              </blockquote>
              <p className="mt-3 text-sm text-muted-foreground">
                <Sparkles className="mr-1 inline size-3.5 text-primary" />
                {t.action}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">GEO: AI engine citation status</CardTitle>
          <CardDescription>
            How many of your products are indexed and cited by each AI engine (Generative Engine Optimization).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>AI engine</TableHead>
                <TableHead className="text-right">Products indexed</TableHead>
                <TableHead className="text-right">Products cited</TableHead>
                <TableHead className="text-right">Citation rate</TableHead>
                <TableHead className="text-right">Trend</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {geoEngineRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <PlatformLogo
                        name={row.name}
                        shortName={row.short}
                        iconSlug={row.iconSlug}
                        color={row.logoFallbackColor}
                        size="sm"
                      />
                      {row.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{row.indexed}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-foreground">{row.cited}</TableCell>
                  <TableCell className={cn("text-right tabular-nums", geoCitationRateClass(row.rate))}>
                    {row.rate}
                  </TableCell>
                  <TableCell className={cn("text-right tabular-nums", geoTrendClass(row.trend))}>
                    {row.trend}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
                      <Link to="/ai-presence/prompts">
                        Details
                        <ChevronRight className="size-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product-level optimization</CardTitle>
          <CardDescription>SEO and GEO scores for individual products — top products by revenue (mock)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead
                  className="text-right"
                  aria-sort={
                    productSort.key === "seo"
                      ? productSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <ProductTableSortButton
                    label="SEO"
                    active={productSort.key === "seo"}
                    dir={productSort.dir}
                    onClick={() => toggleProductSort("seo")}
                  />
                </TableHead>
                <TableHead
                  className="text-right"
                  aria-sort={
                    productSort.key === "geo"
                      ? productSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <ProductTableSortButton
                    label="GEO"
                    active={productSort.key === "geo"}
                    dir={productSort.dir}
                    onClick={() => toggleProductSort("geo")}
                  />
                </TableHead>
                <TableHead
                  className="text-right"
                  aria-sort={
                    productSort.key === "mentions"
                      ? productSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <ProductTableSortButton
                    label="AI mentions"
                    active={productSort.key === "mentions"}
                    dir={productSort.dir}
                    onClick={() => toggleProductSort("mentions")}
                  />
                </TableHead>
                <TableHead
                  className="text-right"
                  aria-sort={
                    productSort.key === "rank"
                      ? productSort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <ProductTableSortButton
                    label="Search rank"
                    active={productSort.key === "rank"}
                    dir={productSort.dir}
                    onClick={() => toggleProductSort("rank")}
                  />
                </TableHead>
                <TableHead>Top issue</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProductRows.map((p) => (
                <TableRow key={p.sku}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.seo}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.geo}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.mentions}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{p.rank}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.issue}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
                      <Link to="/products">
                        Fix
                        <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content gap analysis</CardTitle>
          <CardDescription>
            Content types that boost both SEO rankings and AI citations — prioritize high-impact GEO opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentGapRows.map((row) => (
            <div key={row.id} className="flex flex-col rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium leading-snug">{row.type}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px] capitalize",
                    row.priority === "high" && "border-amber-500/50 text-amber-700 dark:text-amber-300"
                  )}
                >
                  {row.priority} impact
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {row.current}
                <span className="text-muted-foreground"> / {row.target}</span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">AI suggestion:</span> “{row.suggestion}”
              </p>
              <Button type="button" variant="secondary" size="sm" className="mt-4 w-full">
                Generate with AI
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibility by region</CardTitle>
          <CardDescription>AI shopping visibility index vs classic SERP visibility (mock)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">AI visibility</TableHead>
                <TableHead className="text-right">Classic SERP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoGeoRows.map((row) => (
                <TableRow key={row.code}>
                  <TableCell className="font-medium">
                    {row.region}{" "}
                    <span className="text-muted-foreground">({row.code})</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.aiVisibility}%</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.classicSerp}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div ref={auditSectionRef} id="technical-audit" className="scroll-mt-6">
        <Card>
          <CardHeader className="space-y-4">
            <CardTitle className="text-base">Technical audit</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[240px]">
                <label htmlFor="audit-result-filter" className="text-xs font-medium text-muted-foreground">
                  Result
                </label>
                <Select
                  value={auditFilter}
                  onValueChange={(v) => setAuditFilter((v ?? "all") as AuditTab)}
                >
                  <SelectTrigger id="audit-result-filter" size="sm" className="w-full">
                    <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({auditCounts.total})</SelectItem>
                    <SelectItem value="fail">Fail ({auditCounts.fail})</SelectItem>
                    <SelectItem value="warn">Warn ({auditCounts.warn})</SelectItem>
                    <SelectItem value="pass">Pass ({auditCounts.pass})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[240px]">
                <label htmlFor="audit-focus-filter" className="text-xs font-medium text-muted-foreground">
                  Focus
                </label>
                <Select
                  value={auditCategoryScope}
                  onValueChange={(v) => setAuditCategoryScope((v ?? "all") as AuditCategoryScope)}
                >
                  <SelectTrigger id="audit-focus-filter" size="sm" className="w-full">
                    <SelectValue placeholder="Focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({auditCounts.total})</SelectItem>
                    <SelectItem value="seo">SEO ({auditCategoryCounts.seo})</SelectItem>
                    <SelectItem value="geo">GEO ({auditCategoryCounts.geo})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredAudit.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No checks match these filters. Try another result or focus.
              </p>
            ) : null}
            {filteredAudit.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
                  severityStyles(item.severity)
                )}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {item.impact}
                    </Badge>
                  </div>
                  {item.affected && (
                    <p className="text-xs text-muted-foreground">{item.affected}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
                  <Link to="/products">
                    Review
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
