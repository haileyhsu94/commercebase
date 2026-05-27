import { useEffect, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { PlayCircle, X } from "lucide-react"
import { toast } from "sonner"
import {
  TUTORIAL_UPDATED_EVENT,
  dismissTutorial,
  getDismissedTutorials,
  getSeenTours,
  markTourSeen,
} from "@/lib/tutorial-storage"
import { SpotlightTour, type TourStep } from "@/components/shared/SpotlightTour"
import { TUTORIALS, type TutorialVisual } from "@/components/shared/tutorials"

export function PageTutorial() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [dismissed, setDismissed] = useState<string[]>(() => getDismissedTutorials())
  const [activeTour, setActiveTour] = useState<{ key: string; steps: TourStep[] } | null>(null)

  useEffect(() => {
    const refresh = () => setDismissed(getDismissedTutorials())
    window.addEventListener(TUTORIAL_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(TUTORIAL_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const entry = TUTORIALS.find((t) => t.match(pathname))

  // Auto-start the tour once, the first time a page with a tour is opened.
  useEffect(() => {
    if (!entry?.steps || getSeenTours().includes(entry.id)) return
    const { id, steps } = entry
    // Mark seen inside the timeout (not before) so a discarded StrictMode pass
    // doesn't consume the one-time auto-start.
    const t = setTimeout(() => {
      markTourSeen(id)
      setActiveTour({ key: id, steps })
    }, 400)
    return () => clearTimeout(t)
  }, [entry])

  // Replay a tour requested from the Help Center via `?tour=1`.
  useEffect(() => {
    if (searchParams.get("tour") !== "1" || !entry?.steps) return
    const { id, steps } = entry
    const t = setTimeout(() => {
      setActiveTour({ key: id, steps })
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete("tour")
          return next
        },
        { replace: true },
      )
    }, 400)
    return () => clearTimeout(t)
  }, [searchParams, entry, setSearchParams])

  function handleDismiss(id: string) {
    dismissTutorial(id)
    toast("Tutorial hidden", {
      description:
        "Replay tutorials anytime from the Help Center — find it in your profile menu (bottom-left).",
      action: { label: "Help Center", onClick: () => navigate("/help") },
      duration: 8000,
    })
  }

  return (
    <>
      {entry && !dismissed.includes(entry.id) && (
        <div
          className="mt-4 rounded-xl p-0.5 shadow-sm"
          style={{
            background:
              "linear-gradient(110deg, rgba(251,146,60,0.35) 0%, rgba(244,114,182,0.22) 50%, rgba(45,212,191,0.35) 100%)",
          }}
        >
          <div className="relative flex items-stretch gap-4 rounded-[0.7rem] bg-card p-4">
            <Artwork variant={entry.visual ?? "list"} />
            <div className="min-w-0 flex-1 pr-6">
              <p className="text-base font-semibold">{entry.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{entry.body}</p>
              {entry.steps && (
                <button
                  type="button"
                  onClick={() => setActiveTour({ key: entry.id, steps: entry.steps! })}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Watch it again
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(entry.id)}
              aria-label="Dismiss tutorial"
              className="absolute right-3 top-3 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {activeTour && entry && activeTour.key === entry.id && (
        <SpotlightTour
          steps={activeTour.steps}
          onClose={() => setActiveTour(null)}
          onNavigate={navigate}
        />
      )}
    </>
  )
}

/** Mini faux-UI illustration shown on the left of the tutorial card. */
function Artwork({ variant }: { variant: TutorialVisual }) {
  return (
    <div className="hidden w-[176px] shrink-0 overflow-hidden rounded-lg border bg-muted/30 p-3 sm:block">
      {variant === "gauge" ? <GaugeMini /> : variant === "metrics" ? <MetricsMini /> : <ListMini />}
    </div>
  )
}

function GaugeMini() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div
        className="grid size-16 place-items-center rounded-full"
        style={{ background: "conic-gradient(var(--primary) 0% 72%, var(--border) 72% 100%)" }}
      >
        <div className="grid size-11 place-items-center rounded-full bg-card text-sm font-semibold">
          74
        </div>
      </div>
      <div className="w-full space-y-1">
        <div className="h-1.5 w-3/4 rounded-full bg-foreground/20" />
        <div className="h-1.5 w-1/2 rounded-full bg-foreground/10" />
      </div>
    </div>
  )
}

function MetricsMini() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-md border bg-card p-1.5">
            <div className="h-1 w-6 rounded bg-foreground/15" />
            <div className="mt-1 h-2 w-9 rounded bg-foreground/40" />
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 rounded-md border bg-card p-2">
        {[8, 11, 9, 14, 12, 16].map((h, i) => (
          <div key={i} className="w-1.5 rounded-sm bg-foreground/30" style={{ height: h }} />
        ))}
      </div>
    </div>
  )
}

function ListMini() {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 rounded-md border bg-card px-1.5 py-1">
          <div className="size-2 shrink-0 rounded-full bg-foreground/30" />
          <div className="h-1.5 rounded bg-foreground/15" style={{ width: `${72 - i * 12}%` }} />
        </div>
      ))}
    </div>
  )
}
