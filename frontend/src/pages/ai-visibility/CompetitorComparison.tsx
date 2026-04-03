import { Lightbulb, Trophy } from "lucide-react"
import { useOutletContext } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "../ai-presence/ai-presence-time-range"

const competitors = [
  { name: "Your Brand", score: 64, chatgpt: 78, perplexity: 72, gemini: 65, isYou: true },
  { name: "Gucci", score: 89, chatgpt: 92, perplexity: 88, gemini: 87, isYou: false },
  { name: "Louis Vuitton", score: 85, chatgpt: 88, perplexity: 84, gemini: 82, isYou: false },
  { name: "Prada", score: 72, chatgpt: 75, perplexity: 70, gemini: 71, isYou: false },
  { name: "Balenciaga", score: 68, chatgpt: 72, perplexity: 65, gemini: 67, isYou: false },
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

const queryComparison = [
  { query: "luxury handbags", you: 23, gucci: 45, lv: 38, prada: 28 },
  { query: "designer sneakers", you: 45, gucci: 35, lv: 20, prada: 30 },
  { query: "premium watches", you: 67, gucci: 25, lv: 55, prada: 40 },
  { query: "winter jackets", you: 34, gucci: 15, lv: 25, prada: 45 },
  { query: "leather goods", you: 28, gucci: 52, lv: 48, prada: 35 },
]

export function CompetitorComparison() {
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const period = formatAiPresencePeriodShort(timeRange)

  const leaderboard = [...competitors].sort((a, b) => b.score - a.score)
  const userScore = competitors.find((c) => c.isYou)?.score ?? 0
  const userRank = leaderboard.findIndex((c) => c.isYou) + 1
  const userIndex = leaderboard.findIndex((c) => c.isYou)
  const maxScore = Math.max(...competitors.map((c) => c.score), 1)
  const leader = leaderboard[0]
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

  return (
    <>
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
                        {userRank}
                        {ordinalSuffix(userRank)} of {leaderboard.length}
                      </span>
                    ) : gapVsYou != null ? (
                      <span className="shrink-0 text-xs tabular-nums">
                        {gapVsYou > 0 ? (
                          <>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              +{gapVsYou}
                            </span>
                            <span className="text-muted-foreground"> vs you</span>
                          </>
                        ) : gapVsYou < 0 ? (
                          <>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {gapVsYou}
                            </span>
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
                  <span className="font-medium text-foreground">+{gapToLeader} pts</span> behind
                  ({period}).
                </p>
                {nextAbove ? (
                  <p>
                    <span className="font-medium text-foreground">Move up one rank: </span>
                    {nextAbove.name} is next above you ({nextAbove.score}%). Close about{" "}
                    <span className="font-medium text-foreground">+{gapToNextRank} SoV pts</span> to pass
                    them.
                  </p>
                ) : null}
                <p>
                  <span className="font-medium text-foreground">Platform to lift: </span>
                  {weakestPlatform.label} is your lowest per-platform score ({weakestPlatform.value}%)
                  — compare with the table below.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Platform comparison</CardTitle>
          <CardDescription className="text-pretty">
            {SOV_SHORT} on each AI platform (same {period} as header) — compare where you win or lag
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Query-level comparison</CardTitle>
          <CardDescription className="text-pretty">
            Estimated share of AI shopping answers that mention each brand for this query ({period}) —
            percentages are not required to sum to 100% (other brands not shown)
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
                    <span className={item.you >= Math.max(item.gucci, item.lv, item.prada) ? "text-green-600 font-semibold" : ""}>
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
    </>
  )
}
