import { Loader2, Pause, Play, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  autoAgentCurrentRun,
  autoAgentImpactMetrics,
  autoAgentQueueTasks,
  autoAgentSummary,
  type AutoAgentPriority,
  type AutoAgentQueueStatus,
} from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"

function priorityBadge(p: AutoAgentPriority) {
  switch (p) {
    case "high":
      return <Badge variant="destructive">high</Badge>
    case "medium":
      return <Badge variant="secondary">medium</Badge>
    default:
      return <Badge variant="outline">low</Badge>
  }
}

function statusLabel(s: AutoAgentQueueStatus): string {
  switch (s) {
    case "running":
      return "Running"
    case "queued":
      return "Queued"
    case "skipped":
      return "Skipped"
  }
}

export function AutoAgentPage() {
  const s = autoAgentSummary

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">AI Optimization Agent</CardTitle>
              <Badge className="font-normal">{s.stateLabel}</Badge>
            </div>
            <CardDescription className="max-w-2xl text-pretty">{s.subtitle}</CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Pause className="size-4" />
              Pause agent
            </Button>
            <Button type="button" size="sm" className="gap-2">
              <Play className="size-4" />
              Run now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <p className="text-xs font-medium text-muted-foreground">Actions today</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{s.actionsToday}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{s.actionsDeltaVsYesterday} vs yesterday</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <p className="text-xs font-medium text-muted-foreground">SEO improvement</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">+{s.seoImprovementPtsVsWeek} pts</p>
              <p className="text-xs text-muted-foreground">vs last week</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <p className="text-xs font-medium text-muted-foreground">GEO improvement</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">+{s.geoImprovementPtsVsWeek} pts</p>
              <p className="text-xs text-muted-foreground">vs last week</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <p className="text-xs font-medium text-muted-foreground">Queue</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{s.queueItems.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">~{s.queueEtaMinutes} min remaining</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Next auto-run: <span className="font-medium text-foreground">{s.nextRunLabel}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Now running</CardTitle>
          <CardDescription>
            {autoAgentCurrentRun.taskTitle} — {autoAgentCurrentRun.productName}{" "}
            <span className="text-muted-foreground">({autoAgentCurrentRun.sku})</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {autoAgentCurrentRun.current} of {autoAgentCurrentRun.total} items
            </span>
            <span className="font-semibold tabular-nums">{autoAgentCurrentRun.progressPct}%</span>
          </div>
          <Progress value={autoAgentCurrentRun.progressPct} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cumulative impact</CardTitle>
          <CardDescription>Score and coverage changes since the agent was activated (illustrative)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {autoAgentImpactMetrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-border/80 bg-muted/20 px-3 py-3 text-sm"
              >
                <p className="font-medium text-foreground">{m.label}</p>
                <p className="mt-2 tabular-nums text-muted-foreground">
                  <span>{m.before}</span>
                  <span className="mx-1.5 text-xs">→</span>
                  <span className="font-semibold text-foreground">{m.after}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">{m.deltaLabel}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task queue</CardTitle>
          <CardDescription>Prioritized work derived from SEO / GEO signals (mock)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {autoAgentQueueTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between",
                task.status === "running" && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    task.status === "running" ? "bg-primary/10 text-primary" : "bg-muted"
                  )}
                >
                  {task.status === "running" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : task.status === "skipped" ? (
                    <Sparkles className="size-4 text-muted-foreground" />
                  ) : (
                    <Sparkles className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{task.title}</p>
                    {task.progressPct != null && (
                      <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                        {task.progressPct}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                  {task.status === "running" && task.totalItems != null && task.itemCount != null && (
                    <div className="pt-2">
                      <Progress value={task.progressPct ?? 0} className="h-1.5" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {task.itemCount} / {task.totalItems} items
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                {priorityBadge(task.priority)}
                <Badge variant={task.status === "running" ? "default" : "outline"}>
                  {statusLabel(task.status)}
                </Badge>
                {task.status === "queued" && task.itemCount != null && (
                  <span className="text-xs text-muted-foreground tabular-nums">{task.itemCount} items</span>
                )}
                {task.status === "queued" && task.etaMinutes != null && (
                  <span className="text-xs text-muted-foreground">~{task.etaMinutes} min</span>
                )}
                {task.status === "skipped" && (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
