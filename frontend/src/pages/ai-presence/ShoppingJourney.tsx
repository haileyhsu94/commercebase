import { useMemo } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { AlertCircle, ArrowRight, Info, Sparkles, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FunnelChart, type FunnelStage } from "@/components/shared/FunnelChart"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import {
  getShoppingJourneySteps,
  getShoppingJourneyInsights,
  type ShoppingJourneyInsight,
} from "@/lib/ai-presence-mock"
import {
  formatAiPresencePeriodShort,
  type AIPresenceOutletContext,
} from "./ai-presence-time-range"

const iconMap: Record<ShoppingJourneyInsight["severity"], typeof AlertCircle> = {
  critical: AlertCircle,
  warning: AlertCircle,
  info: Info,
}

const colorMap: Record<ShoppingJourneyInsight["severity"], string> = {
  critical: "text-amber-600 dark:text-amber-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
}

const dotMap: Record<ShoppingJourneyInsight["severity"], string> = {
  critical: "bg-amber-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
}

export function ShoppingJourneyPage() {
  const navigate = useNavigate()
  const { openPanelWithComposerText } = useAIAssistant()
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const period = formatAiPresencePeriodShort(timeRange)

  const steps = useMemo(() => getShoppingJourneySteps(timeRange), [timeRange])
  const insights = useMemo(() => getShoppingJourneyInsights(steps), [steps])

  const funnelStages: FunnelStage[] = useMemo(
    () =>
      steps.map((step) => ({
        id: step.id,
        label: step.label,
        value: step.volume ?? 0,
        pct: step.ratePct,
        change: step.change,
        changeTrend: step.changeTrend,
      })),
    [steps]
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI shopping journey</CardTitle>
          <CardDescription>
            Conversion funnel from AI discovery to checkout
            <span className="ml-1 text-xs text-muted-foreground">· {period}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart stages={funnelStages} />
        </CardContent>
      </Card>

      <Card size="sm" className="mt-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  Where shoppers drop off
                  <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    {insights.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {period}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {insights.map((insight) => {
            const Icon = iconMap[insight.severity]
            const color = colorMap[insight.severity]
            const dot = dotMap[insight.severity]

            return (
              <div
                key={insight.stageId}
                className="group/alert-row relative flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(insight.actionHref)}
                role="link"
              >
                <div className="relative mt-0.5">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${dot} ring-2 ring-background`} />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-snug">{insight.headline}</p>
                  <p className="text-xs leading-snug text-muted-foreground">{insight.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover/alert-row:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      openPanelWithComposerText(
                        `Help me with this drop-off: ${insight.headline}. ${insight.detail}`
                      )
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                    Ask Aeris
                  </button>
                  <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                    {insight.actionLabel}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover/alert-row:translate-x-0.5" />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}
