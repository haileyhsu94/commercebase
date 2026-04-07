import { useMemo } from "react"
import { cn } from "@/lib/utils"

export interface FunnelStage {
  id: string
  label: string
  value: number
  /** Percentage (0–100) that drives the trapezoid height */
  pct: number
  /** Optional change indicator string, e.g. "+12%" or "−5.1%" */
  change?: string
  changeTrend?: "up" | "down" | "neutral"
}

export interface FunnelChartProps {
  stages: FunnelStage[]
  className?: string
  /** Height of the SVG funnel area in pixels (default 160) */
  chartHeight?: number
  /**
   * Array of fill colors for each stage. Cycles if fewer colors
   * than stages are provided. Defaults to a purple-toned palette.
   */
  colors?: string[]
  /** Hide the value/label row beneath the chart (default false) */
  hideLabels?: boolean
  /** Custom value formatter (default: toLocaleString) */
  formatValue?: (value: number) => string
  /** Callback when a stage is clicked */
  onStageClick?: (stage: FunnelStage, index: number) => void
}

const DEFAULT_COLORS = [
  "oklch(0.42 0.17 275)",
  "oklch(0.54 0.15 275)",
  "oklch(0.66 0.13 275)",
  "oklch(0.50 0.16 275)",
  "oklch(0.60 0.14 275)",
  "oklch(0.72 0.12 275)",
  "oklch(0.46 0.17 275)",
  "oklch(0.58 0.15 275)",
]

const VIEW_W = 800

export function FunnelChart({
  stages,
  className,
  chartHeight = 160,
  colors = DEFAULT_COLORS,
  hideLabels = false,
  formatValue = (v) => v.toLocaleString(),
  onStageClick,
}: FunnelChartProps) {
  const shapes = useMemo(() => {
    if (stages.length === 0) return []
    const n = stages.length
    const stageW = VIEW_W / n
    const maxH = chartHeight * 0.88
    const bottom = chartHeight

    // Compute the height at each stage boundary (n+1 points)
    const heights: number[] = []
    for (let i = 0; i <= n; i++) {
      const pct = i < n ? stages[i].pct : stages[n - 1].pct
      heights.push((pct / 100) * maxH)
    }

    return stages.map((stage, i) => {
      const x0 = i * stageW
      const x1 = (i + 1) * stageW
      const hL = heights[i]
      const hR = heights[i + 1]
      const yL = bottom - hL
      const yR = bottom - hR
      // Control point offset for smooth bezier curves
      const cpOff = stageW * 0.45

      // Build a closed shape: smooth top curve, flat bottom
      const d = [
        `M ${x0},${yL}`,
        `C ${x0 + cpOff},${yL} ${x1 - cpOff},${yR} ${x1},${yR}`,
        `L ${x1},${bottom}`,
        `L ${x0},${bottom}`,
        "Z",
      ].join(" ")

      return {
        stage,
        index: i,
        fill: colors[i % colors.length],
        d,
      }
    })
  }, [stages, chartHeight, colors])

  if (stages.length === 0) return null

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${chartHeight}`}
        className="w-full"
        preserveAspectRatio="xMidYMax meet"
        role="img"
        aria-label={`Funnel chart with ${stages.length} stages`}
      >
        {shapes.map(({ stage, index, fill, d }) => (
          <path
            key={stage.id}
            d={d}
            fill={fill}
            className={cn(
              "transition-opacity",
              onStageClick && "cursor-pointer hover:opacity-80"
            )}
            onClick={onStageClick ? () => onStageClick(stage, index) : undefined}
          >
            <title>
              {stage.label}: {formatValue(stage.value)} ({stage.pct}%)
            </title>
          </path>
        ))}
      </svg>

      {!hideLabels && (
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}
        >
          {stages.map((stage) => (
            <div key={stage.id} className="pt-3 pr-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-semibold tabular-nums">
                  {formatValue(stage.value)}
                </span>
                <span className="text-xs text-muted-foreground">({stage.pct}%)</span>
                {stage.change && (
                  <span
                    className={cn(
                      "text-xs font-medium italic",
                      stage.changeTrend === "up" && "text-green-600",
                      stage.changeTrend === "down" && "text-red-500"
                    )}
                  >
                    {stage.change}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{stage.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
