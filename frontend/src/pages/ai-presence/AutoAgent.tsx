import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  History,
  Image,
  MessageSquare,
  Pencil,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  autoAgentActivityLog,
  autoAgentImpactMetrics,
  autoAgentPendingChanges,
  autoAgentQueueTasks,
  type AutoAgentTaskType,
} from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"

// ── Permission tier config ────────────────────────────────────────────────────

type PermissionTier = "suggest" | "auto-review" | "full-auto"

const TIER_CONFIG: Record<
  PermissionTier,
  {
    label: string
    agentDoes: string
    humanRole: string
    badge: string
    badgeClass: string
    borderClass: string
    warn?: string
  }
> = {
  suggest: {
    label: "Suggest only",
    agentDoes: "Drafts changes — nothing goes live without your approval",
    humanRole: "You review and approve each batch before publishing",
    badge: "Recommended",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    borderClass: "border-emerald-500/30",
  },
  "auto-review": {
    label: "Auto-apply with review window",
    agentDoes: "Applies changes, held for 24 h before going live",
    humanRole: "Daily digest — revert anything within the window",
    badge: "Moderate",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    borderClass: "border-amber-500/30",
  },
  "full-auto": {
    label: "Full auto",
    agentDoes: "Applies and publishes immediately, no hold period",
    humanRole: "Weekly performance report only",
    badge: "Advanced",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    borderClass: "border-red-500/30",
    warn: "AI changes will go live without any review. Recommended only for high-volume catalogs with consistent brand-voice guidelines.",
  },
}

// ── Task type config ──────────────────────────────────────────────────────────

const TASK_TYPE_CONFIG: Record<
  AutoAgentTaskType,
  { label: string; icon: React.ElementType }
> = {
  description: { label: "Description", icon: FileText },
  schema:       { label: "Schema",      icon: Code2 },
  "alt-text":   { label: "Alt text",    icon: Image },
  faq:          { label: "FAQ",         icon: MessageSquare },
  feed:         { label: "Feed sync",   icon: RefreshCw },
}

// ── Activity status config ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  live: {
    label: "Live",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  approved: {
    label: "Approved",
    icon: Check,
    className: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  reverted: {
    label: "Reverted",
    icon: RotateCcw,
    className: "text-red-600 dark:text-red-400",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

/** The current tier comes from Settings — not editable here */
const CURRENT_TIER: PermissionTier = "suggest"

export function AutoAgentPage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({})

  const currentTierCfg = TIER_CONFIG[CURRENT_TIER]
  const pendingVisible = autoAgentPendingChanges.filter((c) => !dismissed.has(c.id))

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
  }

  function updateText(id: string, next: string, original: string) {
    setEditedTexts((prev) => {
      if (next === original) {
        if (!(id in prev)) return prev
        const rest = { ...prev }
        delete rest[id]
        return rest
      }
      return { ...prev, [id]: next }
    })
  }

  function wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  return (
    <div className="space-y-6">

      {/* ── 1. Permission tier (compact) ────────────────────────────────────── */}
      <div className={cn(
        "flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5",
        currentTierCfg.borderClass,
        "bg-primary/[0.02] backdrop-blur-sm"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{currentTierCfg.label} active</span>
            <span className="hidden text-muted-foreground md:inline">— {currentTierCfg.agentDoes}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/settings/ai-permissions" 
            className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Settings className="size-3.5 transition-transform group-hover:rotate-45" />
            Manage permissions
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ── 2. Cumulative impact (hero proof) ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">What the agent has delivered</CardTitle>
              <CardDescription>
                Measured improvements since the agent was first activated — all from approved changes only.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {autoAgentImpactMetrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-border/80 bg-muted/20 px-3 py-3"
              >
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
                  {m.before}
                  <span className="mx-1.5 text-xs">→</span>
                  <span className="font-semibold text-foreground">{m.after}</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {m.deltaLabel}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Pending review ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm font-medium">
                Pending your review
                <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {pendingVisible.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                The agent drafted these changes. Nothing goes live until you approve.
              </CardDescription>
            </div>
            {pendingVisible.length > 0 && (
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={() => pendingVisible.forEach((c) => dismiss(c.id))}
              >
                <Check className="size-3.5" />
                Approve all
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border/60 p-0">
          {pendingVisible.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              All caught up — no changes waiting for review.
            </p>
          )}
          {pendingVisible.map((change, index) => {
            const typeCfg = TASK_TYPE_CONFIG[change.taskType]
            const TypeIcon = typeCfg.icon
            const hasBeenEdited = change.id in editedTexts
            const displayAfter = editedTexts[change.id] ?? change.after

            return (
              <div key={change.id} className="space-y-3 px-6 py-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{change.product}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{change.sku}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <TypeIcon className="size-3 shrink-0" />
                          {typeCfg.label} · {change.field} · {change.draftedAt}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => dismiss(change.id)}
                        >
                          <Check className="size-3" />
                          Approve{hasBeenEdited ? " (edited)" : ""}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => dismiss(change.id)}
                        >
                          <X className="size-3" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Why */}
                    <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                      <Zap className="mt-0.5 size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs leading-relaxed text-foreground/80">{change.reason}</p>
                    </div>

                    {/* Before / after diff */}
                    <div className="overflow-hidden rounded-lg border border-border/60">
                      <div className="border-b-2 border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3 py-2.5">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                          <span className="inline-block size-2 rounded-sm bg-red-400 dark:bg-red-500" />
                          Before
                        </p>
                        <p className="mt-1.5 text-xs text-red-900/80 dark:text-red-200/70 leading-relaxed">
                          {change.before}
                        </p>
                      </div>
                      <div className="bg-emerald-50 px-3 py-2.5 transition-colors focus-within:bg-emerald-50/80 dark:bg-emerald-950/30 dark:focus-within:bg-emerald-950/20">
                        <div className="flex items-center justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                            <span className="inline-block size-2 rounded-sm bg-emerald-500" />
                            {hasBeenEdited ? "After (edited)" : "After (AI draft)"}
                          </p>
                          {hasBeenEdited && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <Pencil className="size-2.5" />
                              Edited
                            </span>
                          )}
                        </div>

                        <textarea
                          aria-label={`Edit AI draft for ${change.product}`}
                          className={cn(
                            "mt-1.5 block w-full resize-none rounded-sm border-0 bg-transparent p-0 text-xs leading-relaxed outline-none ring-0 focus:outline-none focus:ring-0",
                            hasBeenEdited
                              ? "text-emerald-900/90 dark:text-emerald-100/80"
                              : "text-emerald-900/90 dark:text-emerald-100/80"
                          )}
                          value={displayAfter}
                          onChange={(e) => updateText(change.id, e.target.value, change.after)}
                          rows={Math.max(2, displayAfter.split("\n").length + Math.ceil(displayAfter.length / 80))}
                        />

                        <div className="mt-1 flex items-center justify-end">
                          <span className="text-[10px] tabular-nums text-emerald-600/70 dark:text-emerald-400/60">
                            {wordCount(displayAfter)} words · {displayAfter.length} chars
                          </span>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── 4. Drafting pipeline ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Drafting pipeline</CardTitle>
          <CardDescription>
            What the agent is preparing next — all drafts go to "Pending review" before anything is touched.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          {autoAgentQueueTasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-3 px-6 py-3.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge
                    variant={task.priority === "high" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{task.description}</p>
                {task.skipReason && (
                  <p className="text-xs text-muted-foreground/70 italic">
                    Skipped: {task.skipReason}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground tabular-nums">
                {task.status === "running" && task.progressPct != null && (
                  <span className="font-medium text-primary">{task.progressPct}% drafting</span>
                )}
                {task.itemCount != null && (
                  <span>{task.itemCount} items</span>
                )}
                {task.etaMinutes != null && (
                  <span>~{task.etaMinutes} min</span>
                )}
                <Badge
                  variant={task.status === "running" ? "default" : task.status === "skipped" ? "outline" : "secondary"}
                  className="mt-0.5 text-[10px]"
                >
                  {task.status === "running" ? "Drafting" : task.status === "queued" ? "Queued" : "Skipped"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── 5. Activity log ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Activity log</CardTitle>
              <CardDescription>
                Every change the agent has made — approved, live, or reverted. Impact measured after 7 days.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          {autoAgentActivityLog.map((entry) => {
            const statusCfg = STATUS_CONFIG[entry.status]
            const StatusIcon = statusCfg.icon
            return (
              <div key={entry.id} className="flex items-start gap-3 px-6 py-3.5">
                <StatusIcon
                  className={cn("mt-0.5 size-4 shrink-0", statusCfg.className)}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{entry.product}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{entry.sku}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {entry.taskType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{entry.summary}</p>
                  <div className="flex items-center gap-3 pt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      {entry.changedAt}
                    </span>
                    {entry.impact ? (
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          entry.impact.positive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {entry.impact.delta} {entry.impact.metric}
                      </span>
                    ) : entry.status === "live" ? (
                      <span className="text-[10px] text-muted-foreground">Measuring impact…</span>
                    ) : null}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    statusCfg.badgeClass
                  )}
                >
                  {statusCfg.label}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>

    </div>
  )
}
