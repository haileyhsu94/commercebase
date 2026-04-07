import { Link } from "react-router-dom"
import { ArrowRight, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { aiVisibilityData } from "@/lib/mock-data"
import { SOV_LABEL_WITH_ABBR } from "@/lib/sov"
import { PlatformLogo } from "@/components/shared/PlatformLogo"
import {
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import { adjustAiVisibilityForHomeRange, daysFromAiPresenceTimeRange } from "@/lib/home-range-metrics"

const topRecommendations = [
  "Add 'Italian leather' to product descriptions",
  "Include customer reviews in feed",
  "Optimize price positioning",
]

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
              {formatAiPresencePeriodShort(timeRange)}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" render={<Link to="/ai-presence" />}>
            Explore
            <ArrowRight className="h-3 w-3" />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none">{overallScore}</span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{shoppingQueries.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">shopping queries/wk</span>
            </div>
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    to="/ai-presence?highlight=recommendations"
                    className="flex items-baseline gap-2 rounded-md decoration-amber-400/50 underline-offset-2 hover:underline"
                  >
                    <span className="text-sm font-medium text-amber-600">{missedOpportunities}</span>
                    <span className="text-xs text-muted-foreground">missed opportunities</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="flex max-w-72 flex-col gap-2 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md [&>:last-child]:hidden"
                >
                  <p className="text-xs font-semibold">Top recommendations</p>
                  <ul className="flex flex-col gap-1.5">
                    {topRecommendations.map((rec) => (
                      <li key={rec} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/ai-presence?highlight=recommendations"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    See all in AI Visibility
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
