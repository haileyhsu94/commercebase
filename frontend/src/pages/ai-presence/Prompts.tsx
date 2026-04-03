import { Fragment, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  promptInsights,
  type PromptImpact,
  type PromptInsightRow,
  type PromptIntent,
  type PromptPlacement,
} from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"

type SortKey = "volume" | "visibility" | "gap" | "opportunity" | "leader"
type SortDir = "asc" | "desc"

const CATEGORIES = ["Sneakers", "Bags", "Outerwear"] as const
const INTENTS: PromptIntent[] = ["commercial", "comparison", "navigational", "informational"]
const PLACEMENT_LABEL: Record<PromptPlacement, string> = {
  top3: "Often in top 3 answers",
  lower: "Mostly lower in answers",
  mixed: "Mixed placement",
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-600" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

function impactBadge(impact: PromptImpact) {
  switch (impact) {
    case "high":
      return <Badge variant="destructive">High</Badge>
    case "medium":
      return <Badge variant="secondary">Medium</Badge>
    default:
      return <Badge variant="outline">Low</Badge>
  }
}

function journeyLabel(s: PromptInsightRow["shoppingJourneyStage"]) {
  switch (s) {
    case "awareness":
      return "Awareness"
    case "consideration":
      return "Consideration"
    default:
      return "Decision"
  }
}

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
  const [category, setCategory] = useState<string>("all")
  const [intent, setIntent] = useState<string>("all")
  const [trendFilter, setTrendFilter] = useState<string>("all")
  const [minVolumeK, setMinVolumeK] = useState<string>("all")
  const [behindLeaderOnly, setBehindLeaderOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("opportunity")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  function SortHead({
    label,
    k,
    className,
    alignEnd,
  }: {
    label: string
    k: SortKey
    className?: string
    alignEnd?: boolean
  }) {
    const active = sortKey === k
    return (
      <TableHead className={className}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={cn(
            "inline-flex items-center gap-1 font-medium hover:text-foreground",
            alignEnd && "w-full justify-end",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
          {active ? (
            sortDir === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : (
              <ArrowDown className="size-3.5" />
            )
          ) : (
            <ArrowUpDown className="size-3.5 opacity-40" />
          )}
        </button>
      </TableHead>
    )
  }

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">Prompt intelligence</CardTitle>
          <CardDescription>
            High-intent shopping prompts with SoV, competitive gap, engine mix, and recommended fixes (mock).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
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
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
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
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Prompts &amp; results</CardTitle>
          <CardDescription>
            Leader % and gap use the same SoV scale as{" "}
            <Link to="/ai-presence/competitors" className="font-medium text-foreground underline-offset-2 hover:underline">
              Competitors
            </Link>{" "}
            and{" "}
            <Link to="/ai-presence/opportunities" className="font-medium text-foreground underline-offset-2 hover:underline">
              Opportunities
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto overscroll-x-contain">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Prompt</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Intent</TableHead>
                <SortHead k="volume" label="Volume" className="text-right" alignEnd />
                <TableHead className="text-right">Vol Δ WoW</TableHead>
                <SortHead k="visibility" label="Your SoV" className="text-right" alignEnd />
                <TableHead className="text-right">SoV Δ WoW</TableHead>
                <SortHead k="leader" label="Leader" className="text-right" alignEnd />
                <SortHead k="gap" label="Gap" className="text-right" alignEnd />
                <SortHead k="opportunity" label="Opp." className="text-right" alignEnd />
                <TableHead>Impact</TableHead>
                <TableHead className="w-[48px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <TableRow className={cn(expandedId === row.id && "border-b-0")}>
                    <TableCell className="max-w-[240px] align-top font-medium">{row.prompt}</TableCell>
                    <TableCell className="align-top text-muted-foreground">{row.category}</TableCell>
                    <TableCell className="align-top capitalize text-muted-foreground">{row.intent}</TableCell>
                    <TableCell className="align-top text-right tabular-nums text-muted-foreground">
                      {row.volume}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "align-top text-right text-xs tabular-nums",
                        row.volumeTrendPctWoW > 0
                          ? "text-emerald-600"
                          : row.volumeTrendPctWoW < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                      )}
                    >
                      {row.volumeTrendPctWoW > 0 ? "+" : ""}
                      {row.volumeTrendPctWoW}%
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 font-medium tabular-nums">
                        {row.visibility}%
                        <span title="Visibility direction (WoW)">
                          <TrendIcon trend={row.trend} />
                        </span>
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "align-top text-right text-xs tabular-nums",
                        row.visibilityDeltaWoW > 0
                          ? "text-emerald-600"
                          : row.visibilityDeltaWoW < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                      )}
                    >
                      {row.visibilityDeltaWoW > 0 ? "+" : ""}
                      {row.visibilityDeltaWoW} pts
                    </TableCell>
                    <TableCell className="align-top text-right text-sm">
                      <span className="text-muted-foreground">{row.leader}</span>
                      <span className="ml-1 tabular-nums text-foreground">{row.leaderVisibility}%</span>
                    </TableCell>
                    <TableCell className="align-top text-right tabular-nums text-amber-700 dark:text-amber-300">
                      {row.gapVsLeader} pts
                    </TableCell>
                    <TableCell className="align-top text-right font-medium tabular-nums">
                      {row.opportunityScore.toLocaleString()}
                    </TableCell>
                    <TableCell className="align-top">{impactBadge(row.impact)}</TableCell>
                    <TableCell className="align-top text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-expanded={expandedId === row.id}
                        aria-label={expandedId === row.id ? "Collapse details" : "Expand details"}
                        onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                      >
                        <ChevronDown
                          className={cn("size-4 transition-transform", expandedId === row.id && "rotate-180")}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === row.id && (
                    <TableRow key={`${row.id}-detail`} className="border-t-0 bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={12} className="p-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                SoV by engine
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                <span>
                                  ChatGPT <strong className="tabular-nums">{row.sovChatgpt}%</strong>
                                </span>
                                <span>
                                  Perplexity <strong className="tabular-nums">{row.sovPerplexity}%</strong>
                                </span>
                                <span>
                                  Google AI <strong className="tabular-nums">{row.sovGoogleAi}%</strong>
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Answer placement
                              </p>
                              <p className="mt-1 text-sm">{PLACEMENT_LABEL[row.placement]}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Shopping journey
                              </p>
                              <p className="mt-1 text-sm">{journeyLabel(row.shoppingJourneyStage)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Sample answer (illustrative)
                              </p>
                              <blockquote className="mt-1 border-l-2 border-primary/30 pl-3 text-sm italic text-foreground/90">
                                {row.sampleAnswerLine}
                              </blockquote>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Recommended fix
                              </p>
                              <p className="mt-1 text-sm">{row.recommendedFix}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Affected catalog (est.)
                              </p>
                              <p className="mt-1 text-sm">
                                {row.affectedSkusApprox > 0
                                  ? `~${row.affectedSkusApprox} SKUs`
                                  : "Primarily content / help — not SKU-specific"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Data as of
                              </p>
                              <p className="mt-1 text-sm tabular-nums">{row.lastUpdated}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/products">
                                  View products
                                  <ChevronRight className="size-3.5" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/ai-presence/optimize">
                                  Open SEO / GEO
                                  <ExternalLink className="size-3.5" />
                                </Link>
                              </Button>
                              <Button variant="secondary" size="sm" asChild>
                                <Link to="/ai-presence/auto-agent">Queue in agent</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No prompts match these filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
