import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { aiVisibilityData } from "@/lib/mock-data"
import { SOV_LABEL_WITH_ABBR } from "@/lib/sov"
import { PlatformLogo } from "@/components/shared/PlatformLogo"
import {
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import { adjustAiVisibilityForHomeRange, daysFromAiPresenceTimeRange } from "@/lib/home-range-metrics"

export function AIVisibilityScoreCard({ timeRange }: { timeRange: AiPresenceTimeRange }) {
  const days = daysFromAiPresenceTimeRange(timeRange)
  const { overallScore, platforms, shoppingQueries, missedOpportunities } = adjustAiVisibilityForHomeRange(
    aiVisibilityData,
    days
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{SOV_LABEL_WITH_ABBR}</CardTitle>
            <CardDescription className="mt-1">
              {formatAiPresencePeriodShort(timeRange)} (mock)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/ai-presence">
              Explore <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20" viewBox="0 0 36 36">
              <circle
                className="text-muted stroke-current"
                strokeWidth="3"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
                strokeDasharray={`${overallScore} 100`}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{overallScore}</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{shoppingQueries.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">shopping queries/wk</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-amber-600">{missedOpportunities}</span>
              <span className="text-xs text-muted-foreground">missed opportunities</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-2">
              <PlatformLogo
                name={platform.name}
                shortName={platform.shortName}
                iconSlug={platform.iconSlug}
                color={platform.color}
                size="sm"
              />
              <span className="w-20 text-xs">{platform.name}</span>
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${platform.color}`}
                  style={{ width: `${platform.score}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs tabular-nums">{platform.score}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
