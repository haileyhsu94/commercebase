import { cn } from "@/lib/utils"
import { SOV_LABEL_WITH_ABBR } from "@/lib/sov"

interface VisibilityScoreGaugeProps {
  /** Share of voice (SoV), 0–100 */
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  /** Overrides default SoV wording for `aria-label` (e.g. SEO/GEO metrics) */
  ariaLabel?: string
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
}

const textClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
}

export function VisibilityScoreGauge({ 
  score, 
  size = "md",
  showLabel = true,
  ariaLabel: ariaLabelOverride,
}: VisibilityScoreGaugeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-blue-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-green-500"
    if (score >= 60) return "stroke-blue-500"
    if (score >= 40) return "stroke-amber-500"
    return "stroke-red-500"
  }

  const ariaLabel =
    ariaLabelOverride ?? `${SOV_LABEL_WITH_ABBR}: ${score} percent`

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={ariaLabel}
    >
      <div className={cn("relative", sizeClasses[size])}>
        <svg className={cn("w-full h-full", sizeClasses[size])} viewBox="0 0 36 36" aria-hidden>
          <circle
            className="text-muted stroke-current"
            strokeWidth="3"
            fill="none"
            cx="18"
            cy="18"
            r="15.9155"
          />
          <circle
            className={cn(getStrokeColor(score))}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            cx="18"
            cy="18"
            r="15.9155"
            strokeDasharray={`${score} 100`}
            transform="rotate(-90 18 18)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", textClasses[size], getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-sm font-medium text-foreground">{SOV_LABEL_WITH_ABBR}</span>
          <span className="text-xs text-muted-foreground">0–100 · higher is stronger presence</span>
        </div>
      )}
    </div>
  )
}
