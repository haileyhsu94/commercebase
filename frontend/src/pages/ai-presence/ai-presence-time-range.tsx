import { useState, type Dispatch, type SetStateAction } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const AI_PRESENCE_TIME_PRESETS = ["7d", "14d", "28d"] as const
export type AiPresenceTimePreset = (typeof AI_PRESENCE_TIME_PRESETS)[number]

export type AiPresenceTimeRange =
  | { kind: "preset"; preset: AiPresenceTimePreset }
  | { kind: "custom"; from: string; to: string }

export type AIPresenceOutletContext = {
  timeRange: AiPresenceTimeRange
  setTimeRange: Dispatch<SetStateAction<AiPresenceTimeRange>>
}

export function defaultAiPresenceTimeRange(): AiPresenceTimeRange {
  return { kind: "preset", preset: "28d" }
}

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function defaultCustomRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 28)
  return { from: toYmd(from), to: toYmd(to) }
}

type AiPresenceTimeRangeControlProps = {
  value: AiPresenceTimeRange
  onChange: (next: AiPresenceTimeRange) => void
}

export function AiPresenceTimeRangeControl({ value, onChange }: AiPresenceTimeRangeControlProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState("")
  const [draftTo, setDraftTo] = useState("")

  function openCustomDialog() {
    if (value.kind === "custom") {
      setDraftFrom(value.from)
      setDraftTo(value.to)
    } else {
      const d = defaultCustomRange()
      setDraftFrom(d.from)
      setDraftTo(d.to)
    }
    setCustomOpen(true)
  }

  function applyCustom() {
    if (!draftFrom || !draftTo) return
    if (draftFrom > draftTo) return
    onChange({ kind: "custom", from: draftFrom, to: draftTo })
    setCustomOpen(false)
  }

  return (
    <>
      <div
        className="inline-flex flex-wrap items-center gap-1.5 rounded-md border border-border p-0.5 text-xs"
        role="group"
        aria-label="Time range"
      >
        <div className="inline-flex rounded-sm p-0.5">
          {AI_PRESENCE_TIME_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ kind: "preset", preset })}
              className={cn(
                "rounded px-2 py-1 font-medium transition-colors",
                value.kind === "preset" && value.preset === preset
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <span className="text-muted-foreground/50 px-0.5" aria-hidden>
          |
        </span>
        <button
          type="button"
          onClick={openCustomDialog}
          className={cn(
            "rounded px-2 py-1 font-medium transition-colors",
            value.kind === "custom"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Custom
        </button>
      </div>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom date range</DialogTitle>
            <DialogDescription>
              Choose start and end dates for this overview.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="ai-presence-range-from">
                From
              </label>
              <Input
                id="ai-presence-range-from"
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="ai-presence-range-to">
                To
              </label>
              <Input
                id="ai-presence-range-to"
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={applyCustom}
              disabled={!draftFrom || !draftTo || draftFrom > draftTo}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function formatAiPresenceTimeRangeLabel(range: AiPresenceTimeRange): string {
  if (range.kind === "preset") {
    const n = range.preset.replace("d", "")
    return `the last ${n} days`
  }
  return `${range.from} – ${range.to}`
}

/** Short label for badges / “Period: …” (sentence case) */
export function formatAiPresencePeriodShort(range: AiPresenceTimeRange): string {
  if (range.kind === "preset") {
    const n = range.preset.replace("d", "")
    return `Last ${n} days`
  }
  return `${range.from} → ${range.to}`
}

/** Subtitle for KPI totals so they match the header range (replaces static “per week”). */
export function formatOverviewVolumePeriodLabel(range: AiPresenceTimeRange): string {
  if (range.kind === "preset") {
    const n = range.preset.replace("d", "")
    return `Total · last ${n} days`
  }
  return "Total · selected range"
}

/** Trend line under query rows — same window as “prior” comparison length. */
export function formatOverviewTrendVsPriorLabel(range: AiPresenceTimeRange): string {
  if (range.kind === "preset") {
    const n = range.preset.replace("d", "")
    return `vs prior ${n} days`
  }
  return "vs prior period"
}
