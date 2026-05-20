import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { memoriesForHost } from "@/lib/onboarding-mock-memories"
import { siteHostname, type BrandMemories } from "@/lib/company-profile"

type MemoryStatus = "idle" | "writing" | "ready"

type MemoryKey = keyof Pick<BrandMemories, "companyOverview" | "icp" | "messagingPositioning">

interface MemoryCard {
  key: MemoryKey
  label: string
}

const CARDS: MemoryCard[] = [
  { key: "companyOverview", label: "Company Overview" },
  { key: "icp", label: "Ideal Customer Profile" },
  { key: "messagingPositioning", label: "Messaging & Positioning" },
]

export interface BrandMemoriesPanelHandle {
  /** Imperative reset (e.g. user changes URL — re-stream from scratch). */
  reset: () => void
}

interface Props {
  /** Website URL (raw, may be without scheme). When set, streaming starts. */
  websiteUrl: string
  /** Fires once all 3 memories are "ready". Passes the final memories object. */
  onComplete: (memories: BrandMemories) => void
}

export function BrandMemoriesPanel({ websiteUrl, onComplete }: Props) {
  const [statuses, setStatuses] = useState<Record<MemoryKey, MemoryStatus>>({
    companyOverview: "idle",
    icp: "idle",
    messagingPositioning: "idle",
  })
  const [content, setContent] = useState<Partial<BrandMemories>>({})
  const [expanded, setExpanded] = useState<MemoryKey | null>("companyOverview")
  const [visitState, setVisitState] = useState<"idle" | "visiting" | "done">("idle")
  const timersRef = useRef<number[]>([])

  // Reset everything when URL changes
  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []

    if (!websiteUrl.trim()) {
      setStatuses({ companyOverview: "idle", icp: "idle", messagingPositioning: "idle" })
      setContent({})
      setVisitState("idle")
      return
    }

    const host = siteHostname(websiteUrl)
    const memories = memoriesForHost(host)

    setStatuses({ companyOverview: "writing", icp: "writing", messagingPositioning: "writing" })
    setVisitState("visiting")
    setContent({})

    // Schedule the timed reveals
    const schedule = [
      { at: 500, fn: () => setVisitState("done") },
      {
        at: 1200,
        fn: () => {
          setContent((c) => ({ ...c, companyOverview: memories.companyOverview }))
          setStatuses((s) => ({ ...s, companyOverview: "ready" }))
        },
      },
      {
        at: 2400,
        fn: () => {
          setContent((c) => ({ ...c, icp: memories.icp }))
          setStatuses((s) => ({ ...s, icp: "ready" }))
        },
      },
      {
        at: 3500,
        fn: () => {
          setContent((c) => ({ ...c, messagingPositioning: memories.messagingPositioning }))
          setStatuses((s) => ({ ...s, messagingPositioning: "ready" }))
          onComplete({
            ...memories,
            generatedAt: new Date().toISOString(),
          })
        },
      },
    ]
    timersRef.current = schedule.map(({ at, fn }) => window.setTimeout(fn, at))

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t))
      timersRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrl])

  const completedCount = Object.values(statuses).filter((s) => s === "ready").length
  const total = CARDS.length

  return (
    <aside className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-muted/20 p-6">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Building your brand knowledge</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Distilling your company overview, ICP, and messaging & positioning into long-term
            memories your AI agent will reference on every campaign.
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            completedCount === total
              ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
          )}
        >
          {completedCount} of {total} {completedCount === total ? "complete" : ""}
        </span>
      </header>

      {CARDS.map((card) => {
        const status = statuses[card.key]
        const body = content[card.key]
        const isOpen = expanded === card.key
        return (
          <div
            key={card.key}
            className={cn(
              "rounded-xl border bg-card transition-shadow",
              status === "ready" && isOpen && "ring-2 ring-foreground/10",
            )}
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : card.key)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {status === "ready" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {card.label}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    status === "ready"
                      ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
                  )}
                >
                  {status === "ready" ? "Ready" : "Writing…"}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {isOpen && (
              <div className="border-t px-3 py-3 text-sm">
                {status === "writing" && card.key === "companyOverview" && (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Researching the brand…
                    </div>
                    {visitState !== "idle" && (
                      <div className="flex items-center gap-2">
                        {visitState === "done" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        Visiting {siteHostname(websiteUrl)}/, /about +3
                      </div>
                    )}
                  </div>
                )}
                {status === "writing" && card.key !== "companyOverview" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Synthesizing…
                  </div>
                )}
                {status === "ready" && body && (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                    {body}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
