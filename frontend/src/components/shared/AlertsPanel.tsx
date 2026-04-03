import { Link } from "react-router-dom"
import { AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { alerts } from "@/lib/mock-data"
import { formatAiPresencePeriodShort, type AiPresenceTimeRange } from "@/pages/ai-presence/ai-presence-time-range"
import { daysFromAiPresenceTimeRange, sliceAlertsForHomeRange } from "@/lib/home-range-metrics"

const iconMap = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
}

const colorMap = {
  success: "text-green-600 bg-green-50",
  warning: "text-amber-600 bg-amber-50",
  info: "text-blue-600 bg-blue-50",
}

export function AlertsPanel({ timeRange }: { timeRange: AiPresenceTimeRange }) {
  const days = daysFromAiPresenceTimeRange(timeRange)
  const visibleAlerts = sliceAlertsForHomeRange(alerts, days)

  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              {visibleAlerts.length} things need your attention
            </CardTitle>
            <CardDescription>
              Based on {formatAiPresencePeriodShort(timeRange).toLowerCase()} (mock)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {visibleAlerts.map((alert) => {
          const Icon = iconMap[alert.type]
          const colors = colorMap[alert.type]

          return (
            <div
              key={alert.id}
              className="flex items-start gap-2 rounded-md border p-2"
            >
              <div className={`shrink-0 rounded-full p-1 ${colors}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium leading-snug">{alert.title}</p>
                <p className="text-xs leading-snug text-muted-foreground">{alert.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                  {alert.time}
                </span>
                {alert.actionHref && (
                  <Button variant="ghost" size="icon-xs" className="size-7" asChild>
                    <Link to={alert.actionHref}>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
