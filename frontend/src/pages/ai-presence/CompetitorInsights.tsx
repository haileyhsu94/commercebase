import { useState } from "react"
import { useOutletContext, useSearchParams, Link } from "react-router-dom"
import { AlertCircle, Bot, CheckCircle2, Lightbulb, TrendingUp, Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
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
import { cn } from "@/lib/utils"
import { SOV_DESCRIPTION, SOV_LABEL_WITH_ABBR, SOV_SHORT } from "@/lib/sov"
import {
  formatAiPresencePeriodShort,
  type AIPresenceOutletContext,
} from "./ai-presence-time-range"

// ─── Competitors data ────────────────────────────────────────────────────────

const competitors = [
  { name: "Your Brand", score: 64, chatgpt: 78, perplexity: 72, gemini: 65, isYou: true },
  { name: "Gucci", score: 89, chatgpt: 92, perplexity: 88, gemini: 87, isYou: false },
  { name: "Louis Vuitton", score: 85, chatgpt: 88, perplexity: 84, gemini: 82, isYou: false },
  { name: "Prada", score: 72, chatgpt: 75, perplexity: 70, gemini: 71, isYou: false },
  { name: "Balenciaga", score: 68, chatgpt: 72, perplexity: 65, gemini: 67, isYou: false },
]

const queryComparison = [
  { query: "luxury handbags", you: 23, gucci: 45, lv: 38, prada: 28 },
  { query: "designer sneakers", you: 45, gucci: 35, lv: 20, prada: 30 },
  { query: "premium watches", you: 67, gucci: 25, lv: 55, prada: 40 },
  { query: "winter jackets", you: 34, gucci: 15, lv: 25, prada: 45 },
  { query: "leather goods", you: 28, gucci: 52, lv: 48, prada: 35 },
]

function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-amber-100 text-amber-900 ring-1 ring-amber-300/60"
  if (rank === 2) return "bg-slate-200/80 text-slate-800 ring-1 ring-slate-400/40"
  if (rank === 3) return "bg-orange-100 text-orange-900 ring-1 ring-orange-300/50"
  return "bg-muted text-muted-foreground"
}

function ordinalSuffix(n: number): string {
  const j = n % 10
  const k = n % 100
  if (j === 1 && k !== 11) return "st"
  if (j === 2 && k !== 12) return "nd"
  if (j === 3 && k !== 13) return "rd"
  return "th"
}

// ─── Opportunities data ──────────────────────────────────────────────────────

const opportunities = [
  {
    id: 1,
    query: "luxury handbags",
    volume: "12.5K",
    yourVisibility: 23,
    topCompetitor: { name: "Gucci", visibility: 45 },
    recommendation: "Add 'Italian leather' and 'handcrafted' to product descriptions",
    impact: "high" as const,
    status: "new" as const,
  },
  {
    id: 2,
    query: "designer sneakers",
    volume: "8.2K",
    yourVisibility: 45,
    topCompetitor: { name: "Nike", visibility: 52 },
    recommendation: "Include collaborator names and limited edition details",
    impact: "high" as const,
    status: "new" as const,
  },
  {
    id: 3,
    query: "winter jackets premium",
    volume: "5.1K",
    yourVisibility: 34,
    topCompetitor: { name: "Moncler", visibility: 61 },
    recommendation: "Add warmth ratings and material specifications",
    impact: "medium" as const,
    status: "in_progress" as const,
  },
  {
    id: 4,
    query: "sustainable fashion",
    volume: "15.8K",
    yourVisibility: 12,
    topCompetitor: { name: "Stella McCartney", visibility: 78 },
    recommendation: "Highlight eco-friendly materials and certifications",
    impact: "high" as const,
    status: "new" as const,
  },
  {
    id: 5,
    query: "running shoes comfortable",
    volume: "22.3K",
    yourVisibility: 78,
    topCompetitor: { name: "Nike", visibility: 82 },
    recommendation: "Continue current strategy — close to leading",
    impact: "low" as const,
    status: "optimized" as const,
  },
]

const statusConfig = {
  new: { label: "New", icon: AlertCircle, badgeClass: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400" },
  in_progress: { label: "In Progress", icon: TrendingUp, badgeClass: "bg-blue-50 text-blue-700 ring-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400" },
  optimized: { label: "Optimized", icon: CheckCircle2, badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400" },
}

const impactConfig = {
  high: { label: "High impact", badgeClass: "bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-950/30 dark:text-red-400" },
  medium: { label: "Medium impact", badgeClass: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400" },
  low: { label: "Low impact", badgeClass: "bg-muted text-muted-foreground ring-border/60" },
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function CompetitorInsightsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") === "opportunities" ? "opportunities" : "competitors"
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const period = formatAiPresencePeriodShort(timeRange)

  const [filterImpact, setFilterImpact] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const leaderboard = [...competitors].sort((a, b) => b.score - a.score)
  const userScore = competitors.find((c) => c.isYou)?.score ?? 0
  const userRank = leaderboard.findIndex((c) => c.isYou) + 1
  const userIndex = leaderboard.findIndex((c) => c.isYou)
  const maxScore = Math.max(...competitors.map((c) => c.score), 1)
  const leader = leaderboard[0]!
  const gapToLeader = leader.score - userScore
  const nextAbove = userIndex > 0 ? leaderboard[userIndex - 1]! : null
  const gapToNextRank = nextAbove ? nextAbove.score - userScore : 0
  const youRow = competitors.find((c) => c.isYou)!
  const platformScores = [
    { label: "ChatGPT" as const, value: youRow.chatgpt },
    { label: "Perplexity" as const, value: youRow.perplexity },
    { label: "Gemini" as const, value: youRow.gemini },
  ]
  const weakestPlatform = platformScores.reduce((a, b) => (a.value <= b.value ? a : b))

  const newOpportunities = opportunities.filter((o) => o.status === "new").length
  const inProgress = opportunities.filter((o) => o.status === "in_progress").length
  const optimized = opportunities.filter((o) => o.status === "optimized").length

  const filteredOpportunities = opportunities.filter((o) => {
    if (filterImpact !== "all" && o.impact !== filterImpact) return false
    if (filterStatus !== "all" && o.status !== filterStatus) return false
    return true
  })

  const handleTabChange = (value: string) => {
    if (value === "competitors") {
      setSearchParams({})
    } else {
      setSearchParams({ tab: value })
    }
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="competitors">Competitors</TabsTrigger>
        <TabsTrigger value="opportunities">
          Opportunities
          {newOpportunities > 0 && (
            <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground tabular-nums">
              {newOpportunities}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* ── Competitors tab ──────────────────────────────────────────────── */}
      <TabsContent value="competitors">
        {/* SoV leaderboard */}
        <Card className="mb-6 overflow-hidden py-0">
          <CardHeader className="bg-muted/40 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium">{SOV_LABEL_WITH_ABBR} leaderboard</CardTitle>
                <CardDescription className="text-xs text-pretty">
                  Higher {SOV_SHORT} ranks first · {period} (header filter)
                </CardDescription>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-border/80 bg-background px-2 py-1 text-xs text-muted-foreground">
                <Trophy className="size-3.5 shrink-0 text-amber-600" aria-hidden />
                <span>
                  You{" "}
                  <span className="font-semibold text-foreground">{userRank}</span>
                  <span className="text-muted-foreground">/{leaderboard.length}</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/80">
              {leaderboard.map((comp, index) => {
                const rank = index + 1
                const gapVsYou = comp.isYou ? null : comp.score - userScore
                return (
                  <div
                    key={comp.name}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 sm:gap-3 sm:py-2",
                      comp.isYou && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                        rankBadgeClass(rank)
                      )}
                      aria-label={`Rank ${rank}`}
                    >
                      {rank}
                    </div>
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <span
                        className={cn(
                          "min-w-0 truncate text-sm font-medium",
                          comp.isYou ? "text-primary" : "text-foreground"
                        )}
                        title={comp.name}
                      >
                        {comp.name}
                      </span>
                      {comp.isYou ? (
                        <span className="shrink-0 rounded bg-primary/15 px-1 py-0.5 text-[10px] font-semibold uppercase leading-none text-primary">
                          You
                        </span>
                      ) : null}
                      {comp.isYou ? (
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                          {userRank}{ordinalSuffix(userRank)} of {leaderboard.length}
                        </span>
                      ) : gapVsYou != null ? (
                        <span className="shrink-0 text-xs tabular-nums">
                          {gapVsYou > 0 ? (
                            <>
                              <span className="font-semibold text-amber-600 dark:text-amber-400">+{gapVsYou}</span>
                              <span className="text-muted-foreground"> vs you</span>
                            </>
                          ) : gapVsYou < 0 ? (
                            <>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{gapVsYou}</span>
                              <span className="text-muted-foreground"> vs you</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Tied vs you</span>
                          )}
                        </span>
                      ) : null}
                      <div className="mx-1 hidden min-h-px min-w-[48px] flex-1 md:block">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-[width]",
                              comp.isYou ? "bg-primary" : "bg-foreground/30"
                            )}
                            style={{ width: `${(comp.score / maxScore) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-0.5 tabular-nums">
                      <span className="text-base font-semibold leading-none sm:text-lg">{comp.score}</span>
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="space-y-3 border-t border-border/80 bg-muted/35 px-3 py-3 text-xs leading-relaxed">
              <div>
                <p className="font-medium text-foreground">What {SOV_SHORT} means here</p>
                <p className="mt-1 text-muted-foreground">{SOV_DESCRIPTION}</p>
              </div>
              <div className="flex gap-2 rounded-md border border-border/80 bg-background p-2.5">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                <div className="space-y-1.5 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Benchmark: </span>
                    {leader.name} leads at {leader.score}% — you&apos;re{" "}
                    <span className="font-medium text-foreground">+{gapToLeader} pts</span> behind ({period}).
                  </p>
                  {nextAbove ? (
                    <p>
                      <span className="font-medium text-foreground">Move up one rank: </span>
                      {nextAbove.name} is next above you ({nextAbove.score}%). Close about{" "}
                      <span className="font-medium text-foreground">+{gapToNextRank} SoV pts</span> to pass them.
                    </p>
                  ) : null}
                  <p>
                    <span className="font-medium text-foreground">Platform to lift: </span>
                    {weakestPlatform.label} is your lowest per-platform score ({weakestPlatform.value}%) — compare with the table below.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform comparison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Platform comparison</CardTitle>
            <CardDescription className="text-pretty">
              {SOV_SHORT} on each AI platform ({period}) — compare where you win or lag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-center">{SOV_SHORT}</TableHead>
                  <TableHead className="text-center">ChatGPT</TableHead>
                  <TableHead className="text-center">Perplexity</TableHead>
                  <TableHead className="text-center">Gemini</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((comp) => (
                  <TableRow key={comp.name} className={comp.isYou ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      {comp.name}
                      {comp.isYou && <span className="ml-2 text-xs text-primary">(You)</span>}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{comp.score}%</TableCell>
                    <TableCell className="text-center">{comp.chatgpt}%</TableCell>
                    <TableCell className="text-center">{comp.perplexity}%</TableCell>
                    <TableCell className="text-center">{comp.gemini}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Query-level comparison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Query-level comparison</CardTitle>
            <CardDescription className="text-pretty">
              Estimated share of AI shopping answers that mention each brand for this query ({period}) —
              percentages are not required to sum to 100%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-center">You</TableHead>
                  <TableHead className="text-center">Gucci</TableHead>
                  <TableHead className="text-center">Louis Vuitton</TableHead>
                  <TableHead className="text-center">Prada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryComparison.map((item) => (
                  <TableRow key={item.query}>
                    <TableCell className="font-medium">{item.query}</TableCell>
                    <TableCell className="text-center">
                      <span className={item.you >= Math.max(item.gucci, item.lv, item.prada) ? "font-semibold text-emerald-600" : ""}>
                        {item.you}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{item.gucci}%</TableCell>
                    <TableCell className="text-center">{item.lv}%</TableCell>
                    <TableCell className="text-center">{item.prada}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CTA to Opportunities */}
        {newOpportunities > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Lightbulb className="size-4 shrink-0 text-amber-600" aria-hidden />
              <span>
                <span className="font-medium">{newOpportunities} new gap{newOpportunities !== 1 ? "s" : ""} identified</span>
                <span className="text-muted-foreground"> based on the query data above</span>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabChange("opportunities")}
            >
              View opportunities →
            </Button>
          </div>
        )}
      </TabsContent>

      {/* ── Opportunities tab ────────────────────────────────────────────── */}
      <TabsContent value="opportunities">
        {/* KPI summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="py-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <AlertCircle className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums leading-none">{newOpportunities}</p>
                  <p className="mt-1 text-sm text-muted-foreground">New opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <TrendingUp className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums leading-none">{inProgress}</p>
                  <p className="mt-1 text-sm text-muted-foreground">In progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums leading-none">{optimized}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Optimized</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Select value={filterImpact} onValueChange={(value) => setFilterImpact(value ?? "all")}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="All impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All impact</SelectItem>
              <SelectItem value="high">High impact</SelectItem>
              <SelectItem value="medium">Medium impact</SelectItem>
              <SelectItem value="low">Low impact</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value ?? "all")}>
            <SelectTrigger className="h-8 w-[148px] text-xs">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="optimized">Optimized</SelectItem>
            </SelectContent>
          </Select>
          {(filterImpact !== "all" || filterStatus !== "all") && (
            <span className="text-xs text-muted-foreground">
              {filteredOpportunities.length} result{filteredOpportunities.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Opportunity list — accordion: collapsed row is scannable, expand for detail */}
        {filteredOpportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card py-12 text-center">
            <p className="text-sm font-medium text-foreground">No opportunities match</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting the filters above</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => { setFilterImpact("all"); setFilterStatus("all") }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
        <Accordion
          type="single"
          collapsible
          className="rounded-lg border border-border/60 bg-card"
        >
          {filteredOpportunities.map((opp, i) => {
            const status = statusConfig[opp.status]
            const impact = impactConfig[opp.impact]
            const StatusIcon = status.icon
            const gap = opp.topCompetitor.visibility - opp.yourVisibility
            return (
              <AccordionItem key={opp.id} value={String(opp.id)}>
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/40">
                  {/* Rank */}
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>

                  {/* Query + volume */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      "{opp.query}"
                    </span>
                    <span className="text-xs text-muted-foreground">{opp.volume}/wk</span>
                  </span>

                  {/* Gap summary */}
                  <span className="hidden shrink-0 items-center gap-1 tabular-nums sm:flex">
                    <span className="text-xs font-semibold text-primary">{opp.yourVisibility}%</span>
                    <span className="text-xs text-muted-foreground">you</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs font-semibold text-red-500">{opp.topCompetitor.visibility}%</span>
                    <span className="text-xs text-muted-foreground">{opp.topCompetitor.name}</span>
                    {gap > 0 && (
                      <span className="ml-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-200/60 dark:bg-red-950/30 dark:text-red-400">
                        −{gap} pts
                      </span>
                    )}
                  </span>

                  {/* Badges */}
                  <span className="ml-2 hidden shrink-0 items-center gap-1.5 sm:flex">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", impact.badgeClass)}>
                      {impact.label}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", status.badgeClass)}>
                      <StatusIcon className="size-2.5 shrink-0" aria-hidden />
                      {status.label}
                    </span>
                  </span>
                </AccordionTrigger>

                <AccordionContent className="px-4">
                  {/* Mobile-only badges */}
                  <div className="mb-3 flex flex-wrap items-center gap-1.5 sm:hidden">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", impact.badgeClass)}>
                      {impact.label}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1", status.badgeClass)}>
                      <StatusIcon className="size-3 shrink-0" aria-hidden />
                      {status.label}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* SoV bars */}
                    <div className="space-y-2.5">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Your SoV</p>
                          <span className="text-xs font-semibold tabular-nums text-primary">{opp.yourVisibility}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${opp.yourVisibility}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{opp.topCompetitor.name}</p>
                          <span className="text-xs font-semibold tabular-nums text-red-500">{opp.topCompetitor.visibility}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-red-400 transition-[width]" style={{ width: `${opp.topCompetitor.visibility}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background p-3">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden />
                      <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
                        {opp.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  {opp.status === "new" && (
                    <div className="mt-3">
                      <Button size="sm" asChild>
                        <Link to="/ai-presence/auto-agent" className="inline-flex items-center gap-1.5">
                          <Bot className="size-3.5 shrink-0" aria-hidden />
                          Check in Auto Agent
                        </Link>
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
        )}

      </TabsContent>
    </Tabs>
  )
}
