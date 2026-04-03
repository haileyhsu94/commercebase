import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { statsCards } from "@/lib/mock-data"
import {
  formatAiPresencePeriodShort,
  formatOverviewVolumePeriodLabel,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import { daysFromAiPresenceTimeRange, scaleStatCardsForHomeRange } from "@/lib/home-range-metrics"

export function HealthScoreCard({ timeRange }: { timeRange: AiPresenceTimeRange }) {
  const days = daysFromAiPresenceTimeRange(timeRange)
  const cards = scaleStatCardsForHomeRange(statsCards, days)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Performance Health</CardTitle>
        <CardDescription>
          {formatOverviewVolumePeriodLabel(timeRange)} · {formatAiPresencePeriodShort(timeRange)} (mock)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {cards.map((stat) => (
            <div
              key={stat.title}
              className="space-y-1.5 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent dark:bg-white/[0.1] dark:ring-border/50"
            >
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.title}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`flex items-center text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
