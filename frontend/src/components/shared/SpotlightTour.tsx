import { useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowLeft, ArrowRight, X } from "lucide-react"

export interface TourStep {
  /** data-tour id of the element to spotlight. Omit for a centered step. */
  target?: string
  title: string
  body: string
  /** When set, navigate here as the step opens (e.g. switch a tab via a query
   * param) so the target element is on screen. Requires `onNavigate`. */
  navigateTo?: string
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const SPOT_PAD = 8
const TIP_WIDTH = 320
const GAP = 14
/** Estimated tooltip height, used to keep it clamped on-screen. */
const TIP_EST_H = 200

/**
 * Lightweight in-house spotlight tour: dims the page, highlights the element
 * referenced by each step's `data-tour` id, and shows a tooltip with
 * Back/Next/Skip. No dependencies — uses a box-shadow cutout + portal.
 */
export function SpotlightTour({
  steps,
  onClose,
  onNavigate,
}: {
  steps: TourStep[]
  onClose: () => void
  /** Called when a step with `navigateTo` opens, so the host can change route. */
  onNavigate?: (to: string) => void
}) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const step = steps[index]
  const isLast = index === steps.length - 1

  useLayoutEffect(() => {
    if (!step) return
    const measure = () => {
      if (!step.target) {
        setRect(null)
        return
      }
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    const scrollIntoView = () => {
      if (!step.target) return
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (!el) return
      // Tall targets (taller than most of the viewport) get top-aligned so
      // their top + the tooltip stay visible; shorter ones center.
      const tall = el.getBoundingClientRect().height > window.innerHeight * 0.6
      el.scrollIntoView({ block: tall ? "start" : "center", behavior: "smooth" })
    }
    // Switch route/tab if the step asks for it, then wait for the target to
    // mount before scrolling/measuring.
    if (step.navigateTo) onNavigate?.(step.navigateTo)
    const settle = step.navigateTo ? 300 : 0
    const t = setTimeout(() => {
      scrollIntoView()
      requestAnimationFrame(() => {
        measure()
        requestAnimationFrame(measure)
      })
    }, settle)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [index, step, onNavigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(steps.length - 1, i + 1))
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [steps.length, onClose])

  if (!step) return null

  const tipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 1002,
    width: TIP_WIDTH,
    maxWidth: "calc(100vw - 24px)",
  }
  if (rect) {
    const vh = window.innerHeight
    let left = Math.min(rect.left, window.innerWidth - TIP_WIDTH - 12)
    left = Math.max(12, left)
    tipStyle.left = left
    // Prefer below the target, else above; for targets taller than the viewport
    // (where neither fits) pin near the visible top edge. Always clamp on-screen.
    const below = rect.top + rect.height + GAP
    let top: number
    if (below + TIP_EST_H <= vh - 12) top = below
    else if (rect.top - GAP - TIP_EST_H >= 12) top = rect.top - GAP - TIP_EST_H
    else top = rect.top + 16
    tipStyle.top = Math.max(12, Math.min(top, vh - TIP_EST_H - 12))
  } else {
    tipStyle.top = "50%"
    tipStyle.left = "50%"
    tipStyle.transform = "translate(-50%, -50%)"
  }

  return createPortal(
    <>
      {/* click-blocker */}
      <div
        aria-hidden
        onClick={(e) => e.stopPropagation()}
        style={{ position: "fixed", inset: 0, zIndex: 1000 }}
      />
      {/* dim + spotlight cutout */}
      {rect ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
            borderRadius: 12,
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.55)",
            outline: "2px solid rgba(255,255,255,0.9)",
            outlineOffset: 2,
            zIndex: 1001,
            pointerEvents: "none",
            transition: "top 150ms ease, left 150ms ease, width 150ms ease, height 150ms ease",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1001 }}
        />
      )}
      {/* tooltip */}
      <div role="dialog" aria-label={step.title} style={tipStyle} className="rounded-xl border bg-card p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold">{step.title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tour"
            className="-mr-1.5 -mt-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Step {index + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-1.5">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}
              className="inline-flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
