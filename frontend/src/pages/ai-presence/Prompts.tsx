import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { promptInsights, type PromptInsightRow, type PromptIntent } from "@/lib/ai-presence-mock"
import type { PromptFilterPreset } from "@/lib/prompts-explore-prefs"
import { PromptsExploreCard } from "@/pages/ai-presence/PromptsExploreCard"
import { cn } from "@/lib/utils"

type SortKey = "volume" | "visibility" | "gap" | "opportunity" | "leader"
type SortDir = "asc" | "desc"

const CATEGORIES = ["Sneakers", "Bags", "Outerwear"] as const
const INTENTS: PromptIntent[] = ["commercial", "comparison", "navigational", "informational"]

function sortValue(row: PromptInsightRow, key: SortKey): number {
  switch (key) {
    case "volume":
      return row.volumeKPerWeek
    case "visibility":
      return row.visibility
    case "gap":
      return row.gapVsLeader
    case "opportunity":
      return row.opportunityScore
    case "leader":
      return row.leaderVisibility
  }
}

export function PromptsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const actionsRef = useRef<HTMLDivElement>(null)
  const shouldHighlight = searchParams.get("highlight") === "actions"

  useEffect(() => {
    if (shouldHighlight && actionsRef.current) {
      actionsRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
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

  const [category, setCategory] = useState<string>("all")
  const [intent, setIntent] = useState<string>("all")
  const [trendFilter, setTrendFilter] = useState<string>("all")
  const [minVolumeK, setMinVolumeK] = useState<string>("all")
  const [behindLeaderOnly, setBehindLeaderOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("opportunity")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const actionQueueRows = useMemo(
    () =>
      [...promptInsights]
        .sort((a, b) => b.opportunityScore - a.opportunityScore)
        .slice(0, 10),
    []
  )

  const filtered = useMemo(() => {
    let rows = [...promptInsights]
    if (category !== "all") rows = rows.filter((r) => r.category === category)
    if (intent !== "all") rows = rows.filter((r) => r.intent === intent)
    if (trendFilter !== "all") rows = rows.filter((r) => r.trend === trendFilter)
    if (minVolumeK !== "all") {
      const min = Number.parseInt(minVolumeK, 10)
      rows = rows.filter((r) => r.volumeKPerWeek >= min)
    }
    if (behindLeaderOnly) rows = rows.filter((r) => r.gapVsLeader >= 15)
    rows.sort((a, b) => {
      const va = sortValue(a, sortKey)
      const vb = sortValue(b, sortKey)
      const cmp = va === vb ? a.prompt.localeCompare(b.prompt) : va < vb ? -1 : 1
      return sortDir === "asc" ? cmp : -cmp
    })
    return rows
  }, [category, intent, trendFilter, minVolumeK, behindLeaderOnly, sortKey, sortDir])

  const summary = useMemo(() => {
    if (filtered.length === 0) {
      return { count: 0, avgVisibility: 0, totalK: 0, maxOpp: 0 }
    }
    const sumVis = filtered.reduce((s, r) => s + r.visibility, 0)
    const totalK = filtered.reduce((s, r) => s + r.volumeKPerWeek, 0)
    const maxOpp = Math.max(...filtered.map((r) => r.opportunityScore))
    return {
      count: filtered.length,
      avgVisibility: Math.round((sumVis / filtered.length) * 10) / 10,
      totalK,
      maxOpp,
    }
  }, [filtered])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const applyFilterPreset = (p: PromptFilterPreset) => {
    setCategory(p.category)
    setIntent(p.intent)
    setTrendFilter(p.trendFilter)
    setMinVolumeK(p.minVolumeK)
    setBehindLeaderOnly(p.behindLeaderOnly)
  }

  return (
    <div className="min-w-0 max-w-full space-y-6">
      {/* Action queue */}
      <Card
        ref={actionsRef}
        className={cn("min-w-0 transition-all duration-700", shouldHighlight && "animate-pulse ring-2 ring-primary/50")}
      >
        <CardHeader>
          <CardTitle className="text-base">Action queue</CardTitle>
          <CardDescription>
            Top {actionQueueRows.length} prompts by opportunity score — one recommended fix per row.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Prompt</TableHead>
                <TableHead className="min-w-[220px]">Recommended fix</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionQueueRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-[280px] align-top font-medium">{row.prompt}</TableCell>
                  <TableCell className="align-top text-sm text-muted-foreground">{row.recommendedFix}</TableCell>
                  <TableCell className="align-top text-right">
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                      <Link
                        to="/ai-presence/auto-agent"
                        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                      >
                        Fix with Auto Agent
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setExpandedId(row.id)}
                      >
                        View detail
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Explore */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">Explore</CardTitle>
          <CardDescription>
            High-intent shopping prompts with SoV, competitive gap, engine mix, and recommended fixes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
                <SelectTrigger className="w-[140px]" size="sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Intent</span>
              <Select value={intent} onValueChange={(v) => setIntent(v ?? "all")}>
                <SelectTrigger className="w-[160px]" size="sm">
                  <SelectValue placeholder="Intent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All intents</SelectItem>
                  {INTENTS.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Visibility trend</span>
              <Select value={trendFilter} onValueChange={(v) => setTrendFilter(v ?? "all")}>
                <SelectTrigger className="w-[140px]" size="sm">
                  <SelectValue placeholder="Trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All trends</SelectItem>
                  <SelectItem value="up">Up</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Min volume</span>
              <Select value={minVolumeK} onValueChange={(v) => setMinVolumeK(v ?? "all")}>
                <SelectTrigger className="w-[130px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="10">10K+ /wk</SelectItem>
                  <SelectItem value="15">15K+ /wk</SelectItem>
                  <SelectItem value="25">25K+ /wk</SelectItem>
                  <SelectItem value="40">40K+ /wk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant={behindLeaderOnly ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setBehindLeaderOnly((v) => !v)}
            >
              Gap ≥15 pts
            </Button>
          </div>

          {/* Summary KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Prompts (filtered)</p>
              <p className="text-lg font-semibold tabular-nums">{summary.count}</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Avg your SoV</p>
              <p className="text-lg font-semibold tabular-nums">{summary.avgVisibility}%</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Est. weekly volume (sum)</p>
              <p className="text-lg font-semibold tabular-nums">~{summary.totalK}K /wk</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Max opportunity score</p>
              <p className="text-lg font-semibold tabular-nums">{summary.maxOpp.toLocaleString()}</p>
            </div>
          </div>

          <PromptsExploreCard
            filtered={filtered}
            sortKey={sortKey}
            sortDir={sortDir}
            onToggleSort={toggleSort}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            category={category}
            intent={intent}
            trendFilter={trendFilter}
            minVolumeK={minVolumeK}
            behindLeaderOnly={behindLeaderOnly}
            onApplyPreset={applyFilterPreset}
          />
        </CardContent>
      </Card>
    </div>
  )
}
