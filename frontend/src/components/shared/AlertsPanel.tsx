import { useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle2, Info, ArrowRight, Bell, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { alerts } from "@/lib/mock-data"
import { formatAiPresencePeriodShort, type AiPresenceTimeRange } from "@/pages/ai-presence/ai-presence-time-range"
import { daysFromAiPresenceTimeRange, sliceAlertsForHomeRange } from "@/lib/home-range-metrics"

const iconMap = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
}

const colorMap = {
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
}

const dotMap = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
}

export function AlertsPanel({ timeRange }: { timeRange: AiPresenceTimeRange }) {
  const navigate = useNavigate()
  const { openPanelWithComposerText } = useAIAssistant()
  const days = daysFromAiPresenceTimeRange(timeRange)
  const visibleAlerts = sliceAlertsForHomeRange(alerts, days)

  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                Needs attention
                <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {visibleAlerts.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                {formatAiPresencePeriodShort(timeRange)}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {visibleAlerts.map((alert) => {
          const Icon = iconMap[alert.type]
          const color = colorMap[alert.type]
          const dot = dotMap[alert.type]

          return (
            <div
              key={alert.id}
              className="group/alert-row relative flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => {
                if (alert.actionHref) navigate(alert.actionHref)
              }}
              role={alert.actionHref ? "link" : undefined}
            >
              <div className="relative mt-0.5">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${dot} ring-2 ring-background`} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium leading-snug">{alert.title}</p>
                <p className="text-xs leading-snug text-muted-foreground">{alert.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover/alert-row:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    openPanelWithComposerText(
                      `Help me with this alert: ${alert.title}. ${alert.description}`
                    )
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  Ask Aeris
                </button>
                <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                  {alert.time}
                </span>
                {alert.actionHref && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover/alert-row:translate-x-0.5" />
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
