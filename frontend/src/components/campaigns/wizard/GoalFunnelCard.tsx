import { Eye, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type GoalValue = "awareness_consideration" | "leads" | "sales"

export interface GoalOption {
  value: GoalValue
  label: string
  description: string
  funnelLevel: 1 | 2 | 3
  icon: typeof Eye
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    value: "awareness_consideration",
    label: "Drive discovery",
    description: "Get people to discover your brand and browse your site.",
    funnelLevel: 1,
    icon: Eye,
  },
  {
    value: "leads",
    label: "Acquire new customers",
    description: "Trigger first-time conversions by targeting high-value customers for your brand.",
    funnelLevel: 2,
    icon: Target,
  },
  {
    value: "sales",
    label: "Maximize conversion",
    description: "Drive more value from new and returning customers.",
    funnelLevel: 3,
    icon: TrendingUp,
  },
]

export function GoalFunnelCard({
  option,
  selected,
  onClick,
}: {
  option: GoalOption
  selected: boolean
  onClick: () => void
}) {
  const Icon = option.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-all",
        selected
          ? "border-foreground shadow-sm ring-2 ring-foreground/10"
          : "border-border hover:border-foreground/30 hover:bg-accent/30",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-foreground bg-foreground" : "border-muted-foreground",
        )}
      >
        {selected && <span className="size-2 rounded-full bg-background" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-base font-semibold">{option.label}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
      </div>
      <FunnelGraphic level={option.funnelLevel} />
    </button>
  )
}

function FunnelGraphic({ level }: { level: 1 | 2 | 3 }) {
  // A classic 3-layer marketing funnel: top trapezoid (widest), mid
  // trapezoid (narrower), bottom V (narrowest). The selected layer is
  // filled solid blue; the others fade back.
  const ACTIVE = "currentColor"
  const INACTIVE = "currentColor"
  return (
    <svg
      viewBox="0 0 48 48"
      width={48}
      height={48}
      className="shrink-0 text-blue-500"
      aria-hidden
    >
      {/* Top layer — widest, like the rim of the funnel */}
      <path
        d="M2 6 H46 L40 18 H8 Z"
        fill={ACTIVE}
        opacity={level === 1 ? 1 : 0.18}
      />
      {/* Middle layer — narrower trapezoid */}
      <path
        d="M9 20 H39 L32 32 H16 Z"
        fill={ACTIVE}
        opacity={level === 2 ? 1 : 0.18}
      />
      {/* Bottom layer — the spout: small triangle/trapezoid */}
      <path
        d="M17 34 H31 L26 46 H22 Z"
        fill={INACTIVE}
        opacity={level === 3 ? 1 : 0.18}
      />
    </svg>
  )
}
