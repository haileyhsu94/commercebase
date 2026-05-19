import { Info } from "lucide-react"

/**
 * Right-rail estimated performance card.
 * Deterministic ranges derived from budget + goal. No per-channel breakdown
 * (we hide channel allocation from users).
 */
export function EstimatedPerformancePanel({
  budget,
  budgetType,
  objective,
  currencySymbol,
}: {
  budget: string
  budgetType: string
  objective?: string
  currencySymbol: string
}) {
  const amount = Number(budget) || 0
  const monthlyBudget =
    budgetType === "daily"
      ? amount * 30
      : budgetType === "weekly"
        ? amount * 4
        : amount

  // Objective-tuned coefficients (mockup-grade)
  const coeff = (() => {
    switch (objective) {
      case "awareness_consideration":
        return { displaysPer$: 320, clicksPer$: 2.5, visitsPer$: 0.42 }
      case "leads":
        return { displaysPer$: 210, clicksPer$: 1.8, visitsPer$: 0.6 }
      case "sales":
      default:
        return { displaysPer$: 140, clicksPer$: 1.3, visitsPer$: 0.55 }
    }
  })()

  const displays = monthlyBudget * coeff.displaysPer$
  const clicks = monthlyBudget * coeff.clicksPer$
  const visits = monthlyBudget * coeff.visitsPer$

  const fmt = (n: number) => Math.round(n).toLocaleString()
  const range = (n: number) =>
    `${fmt(n * 0.55)} – ${fmt(n * 1.1)}`

  return (
    <aside className="sticky top-4 w-full max-w-sm rounded-xl border bg-card p-4 text-sm">
      <h3 className="text-sm font-semibold">Estimated performance</h3>

      <Stat label="Displays" value={amount ? range(displays) : "—"} />
      <Stat label="Clicks" value={amount ? range(clicks) : "—"} />
      <Stat label="Visits" value={amount ? range(visits) : "—"} />

      <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <div className="font-medium text-foreground">Data accuracy</div>
          <p className="mt-0.5">
            Estimates for the next 4 weeks. Based on post-click 30-day attribution. Updates as you
            adjust budget and {currencySymbol}targets.
          </p>
        </div>
      </div>
    </aside>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  )
}
