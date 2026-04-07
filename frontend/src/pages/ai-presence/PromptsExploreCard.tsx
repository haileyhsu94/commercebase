import { Fragment, useEffect, useState } from "react"
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
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import {
  loadExploreVisibleCols,
  loadFilterPresets,
  PICKABLE_COLS,
  saveExploreVisibleCols,
  saveFilterPresets,
  type ExploreColId,
  type PromptFilterPreset,
} from "@/lib/prompts-explore-prefs"
import type {
  PromptImpact,
  PromptInsightRow,
  PromptPlacement,
} from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 25

function escapeCsvCell(value: string | number): string {
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportPromptsToCsv(rows: PromptInsightRow[]) {
  const headers = [
    "Prompt",
    "Category",
    "Intent",
    "Volume",
    "VolWoW",
    "YourSoV",
    "SoVWoW",
    "Leader",
    "LeaderSoV",
    "Gap",
    "Opportunity",
    "Impact",
    "RecommendedFix",
  ]
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.prompt,
        row.category,
        row.intent,
        row.volume,
        row.volumeTrendPctWoW,
        row.visibility,
        row.visibilityDeltaWoW,
        row.leader,
        row.leaderVisibility,
        row.gapVsLeader,
        row.opportunityScore,
        row.impact,
        row.recommendedFix,
      ]
        .map(escapeCsvCell)
        .join(",")
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `prompts-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type SortKey = "volume" | "visibility" | "gap" | "opportunity" | "leader"
type SortDir = "asc" | "desc"

const PLACEMENT_LABEL: Record<PromptPlacement, string> = {
  top3: "Often in top 3 answers",
  lower: "Mostly lower in answers",
  mixed: "Mixed placement",
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up")
    return (
      <span className="inline-flex items-center gap-0">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
        <span className="sr-only">Up</span>
      </span>
    )
  if (trend === "down")
    return (
      <span className="inline-flex items-center gap-0">
        <TrendingDown className="h-3.5 w-3.5 text-red-600" aria-hidden />
        <span className="sr-only">Down</span>
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0">
      <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span className="sr-only">Flat</span>
    </span>
  )
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

type PromptsExploreCardProps = {
  filtered: PromptInsightRow[]
  sortKey: SortKey
  sortDir: SortDir
  onToggleSort: (key: SortKey) => void
  expandedId: string | null
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>
  category: string
  intent: string
  trendFilter: string
  minVolumeK: string
  behindLeaderOnly: boolean
  onApplyPreset: (p: PromptFilterPreset) => void
}

export function PromptsExploreCard({
  filtered,
  sortKey,
  sortDir,
  onToggleSort,
  expandedId,
  setExpandedId,
  category,
  intent,
  trendFilter,
  minVolumeK,
  behindLeaderOnly,
  onApplyPreset,
}: PromptsExploreCardProps) {
  const { openPanelWithComposerText } = useAIAssistant()
  const [visibleCols, setVisibleCols] = useState(() => loadExploreVisibleCols())
  const [page, setPage] = useState(1)
  const [presets, setPresets] = useState<PromptFilterPreset[]>(() => loadFilterPresets())
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [activePreset, setActivePreset] = useState<string>("__none__")

  useEffect(() => {
    saveExploreVisibleCols(visibleCols)
  }, [visibleCols])

  useEffect(() => {
    setPage(1)
  }, [filtered.length, category, intent, trendFilter, minVolumeK, behindLeaderOnly, sortKey, sortDir])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)
  const colSpan = visibleCols.size

  const toggleCol = (id: ExploreColId) => {
    if (id === "detail") return
    setVisibleCols((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      const dataCols = [...n].filter((c) => c !== "detail")
      if (dataCols.length === 0) return prev
      n.add("detail")
      return n
    })
  }

  const handleSavePreset = () => {
    const name = saveName.trim()
    if (!name) return
    const p: PromptFilterPreset = {
      id: crypto.randomUUID(),
      name,
      category,
      intent,
      trendFilter,
      minVolumeK,
      behindLeaderOnly,
    }
    const next = [...presets, p]
    setPresets(next)
    saveFilterPresets(next)
    setSaveName("")
    setSaveOpen(false)
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
          onClick={() => onToggleSort(k)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 font-medium hover:text-foreground",
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

  const showingFrom = total === 0 ? 0 : start + 1
  const showingTo = Math.min(start + PAGE_SIZE, total)

  return (
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
      <CardContent className="min-w-0 space-y-3 overflow-x-auto overscroll-x-contain">
        <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-3 py-2.5 dark:border-indigo-800/60 dark:bg-indigo-950/35">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-indigo-950 dark:text-indigo-100">
              Aeris found 3 high-impact fixes — review suggestions in chat.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-indigo-300/80 dark:border-indigo-700"
              onClick={() =>
                openPanelWithComposerText(
                  "Review high-impact prompt fixes for my catalog and suggest next steps."
                )
              }
            >
              Review suggestions
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <Button type="button" variant="outline" size="sm">
                  Columns
                </Button>
              }
            />
            <PopoverContent className="w-56" align="start">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Show columns</p>
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {PICKABLE_COLS.map((col) => (
                  <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border border-input accent-primary"
                      checked={visibleCols.has(col.id)}
                      onChange={() => toggleCol(col.id)}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button type="button" variant="outline" size="sm" onClick={() => setSaveOpen(true)}>
            Save filters
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportPromptsToCsv(filtered)}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>

          <Select
            value={activePreset}
            onValueChange={(v) => {
              setActivePreset(v ?? "__none__")
              if (!v || v === "__none__") return
              const p = presets.find((x) => x.id === v)
              if (p) onApplyPreset(p)
            }}
          >
            <SelectTrigger className="w-[200px]" size="sm">
              <SelectValue placeholder="Saved presets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Preset…</SelectItem>
              {presets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground tabular-nums sm:ml-auto">
            Showing {showingFrom}–{showingTo} of {total} prompts
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Save filter preset</DialogTitle>
              <DialogDescription>Name this filter combination to reuse later.</DialogDescription>
            </DialogHeader>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. High gap sneakers"
              autoComplete="off"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSavePreset} disabled={!saveName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-xs text-muted-foreground">Scroll horizontally to see all columns →</p>

        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              {visibleCols.has("prompt") ? (
                <TableHead className="min-w-[200px]">Prompt</TableHead>
              ) : null}
              {visibleCols.has("category") ? <TableHead>Category</TableHead> : null}
              {visibleCols.has("intent") ? <TableHead>Intent</TableHead> : null}
              {visibleCols.has("volume") ? (
                <SortHead k="volume" label="Volume" className="text-right" alignEnd />
              ) : null}
              {visibleCols.has("volWow") ? (
                <TableHead className="text-right">Vol Δ WoW</TableHead>
              ) : null}
              {visibleCols.has("vis") ? (
                <SortHead k="visibility" label="Your SoV" className="text-right" alignEnd />
              ) : null}
              {visibleCols.has("visWow") ? (
                <TableHead className="text-right">SoV Δ WoW</TableHead>
              ) : null}
              {visibleCols.has("leader") ? (
                <SortHead k="leader" label="Leader" className="text-right" alignEnd />
              ) : null}
              {visibleCols.has("gap") ? (
                <SortHead k="gap" label="Gap" className="text-right" alignEnd />
              ) : null}
              {visibleCols.has("opp") ? (
                <SortHead k="opportunity" label="Opp." className="text-right" alignEnd />
              ) : null}
              {visibleCols.has("impact") ? <TableHead>Impact</TableHead> : null}
              {visibleCols.has("detail") ? <TableHead className="w-[48px]" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <Fragment key={row.id}>
                <TableRow className={cn(expandedId === row.id && "border-b-0")}>
                  {visibleCols.has("prompt") ? (
                    <TableCell className="max-w-[240px] align-top font-medium">{row.prompt}</TableCell>
                  ) : null}
                  {visibleCols.has("category") ? (
                    <TableCell className="align-top text-muted-foreground">{row.category}</TableCell>
                  ) : null}
                  {visibleCols.has("intent") ? (
                    <TableCell className="align-top capitalize text-muted-foreground">{row.intent}</TableCell>
                  ) : null}
                  {visibleCols.has("volume") ? (
                    <TableCell className="align-top text-right tabular-nums text-muted-foreground">
                      {row.volume}
                    </TableCell>
                  ) : null}
                  {visibleCols.has("volWow") ? (
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
                  ) : null}
                  {visibleCols.has("vis") ? (
                    <TableCell className="align-top text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 font-medium tabular-nums">
                        {row.visibility}%
                        <span title="Visibility direction (WoW)">
                          <TrendIcon trend={row.trend} />
                        </span>
                      </span>
                    </TableCell>
                  ) : null}
                  {visibleCols.has("visWow") ? (
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
                  ) : null}
                  {visibleCols.has("leader") ? (
                    <TableCell className="align-top text-right text-sm">
                      <span className="text-muted-foreground">{row.leader}</span>
                      <span className="ml-1 tabular-nums text-foreground">{row.leaderVisibility}%</span>
                    </TableCell>
                  ) : null}
                  {visibleCols.has("gap") ? (
                    <TableCell className="align-top text-right tabular-nums text-amber-700 dark:text-amber-300">
                      {row.gapVsLeader} pts
                    </TableCell>
                  ) : null}
                  {visibleCols.has("opp") ? (
                    <TableCell className="align-top text-right font-medium tabular-nums">
                      {row.opportunityScore.toLocaleString()}
                    </TableCell>
                  ) : null}
                  {visibleCols.has("impact") ? (
                    <TableCell className="align-top">{impactBadge(row.impact)}</TableCell>
                  ) : null}
                  {visibleCols.has("detail") ? (
                    <TableCell className="align-top text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 min-h-11 min-w-11"
                        aria-expanded={expandedId === row.id}
                        aria-label={expandedId === row.id ? "Collapse details" : "Expand details"}
                        onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                      >
                        <ChevronDown
                          className={cn("size-4 transition-transform", expandedId === row.id && "rotate-180")}
                        />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
                {expandedId === row.id ? (
                  <TableRow key={`${row.id}-detail`} className="border-t-0 bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={colSpan} className="p-4">
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
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() =>
                                  openPanelWithComposerText(
                                    `Explain this prompt and fix: "${row.prompt}". Recommended fix: ${row.recommendedFix}`
                                  )
                                }
                              >
                                Ask Aeris about this prompt
                              </Button>
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
                            <Link
                              to="/products"
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-1")}
                            >
                              View products
                              <ChevronRight className="size-3.5" />
                            </Link>
                            <Link
                              to="/ai-presence/optimize"
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-1")}
                            >
                              Open SEO / GEO
                              <ExternalLink className="size-3.5" />
                            </Link>
                            <Link
                              to="/ai-presence/auto-agent"
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                            >
                              Queue in agent
                            </Link>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No prompts match these filters.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
