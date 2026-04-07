import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { statsCards } from "@/lib/mock-data"
import {
  formatAiPresencePeriodShort,
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
          {formatAiPresencePeriodShort(timeRange)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {cards.map((stat) => (
            <div
              key={stat.title}
              className="space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent dark:bg-white/[0.1] dark:ring-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{stat.title}</span>
                </div>
                <Badge
                  variant={stat.trend === "up" ? "outline" : "destructive"}
                  className={
                    stat.trend === "up"
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
                      : ""
                  }
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <span className="block text-2xl font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
