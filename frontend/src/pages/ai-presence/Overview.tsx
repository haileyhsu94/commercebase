import { Link, useOutletContext } from "react-router-dom"
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VisibilityScoreGauge } from "@/components/shared/VisibilityScoreGauge"
import { PlatformBreakdown } from "@/components/shared/PlatformBreakdown"
import { aiVisibilityData } from "@/lib/mock-data"
import { SOV_DESCRIPTION, SOV_LABEL_WITH_ABBR } from "@/lib/sov"
import {
  formatOverviewTrendVsPriorLabel,
  formatOverviewVolumePeriodLabel,
  type AIPresenceOutletContext,
} from "./ai-presence-time-range"

const topQueries = [
  { query: "luxury handbags", visibility: 23, competitors: 68, trend: "down" as const },
  { query: "designer sneakers", visibility: 45, competitors: 52, trend: "up" as const },
  { query: "premium watches", visibility: 67, competitors: 30, trend: "up" as const },
  { query: "winter jackets", visibility: 34, competitors: 61, trend: "down" as const },
  { query: "running shoes", visibility: 78, competitors: 20, trend: "up" as const },
]

const recommendations = [
  {
    title: "Add 'Italian leather' to product descriptions",
    impact: "High",
    description: "Products with this keyword rank 2x higher in AI recommendations",
  },
  {
    title: "Include customer reviews in feed",
    impact: "High",
    description: "Products with 4.5+ stars get 3x more AI mentions",
  },
  {
    title: "Optimize price positioning",
    impact: "Medium",
    description: "Your luxury items are above the 'best value' threshold",
  },
]

export function AIPresenceOverview() {
  const { overallScore, shoppingQueries, missedOpportunities } = aiVisibilityData
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const volumePeriodLabel = formatOverviewVolumePeriodLabel(timeRange)
  const trendVsPriorLabel = formatOverviewTrendVsPriorLabel(timeRange)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{SOV_LABEL_WITH_ABBR}</CardTitle>
            <CardDescription className="text-xs">{SOV_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <VisibilityScoreGauge score={overallScore} size="lg" showLabel={false} />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Your brand captures about {overallScore}% share of voice in relevant AI shopping answers for
              your catalog.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Platform Breakdown</CardTitle>
            <CardDescription>SoV by AI platform — where you win or lag</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformBreakdown />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shopping Queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{shoppingQueries.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{volumePeriodLabel}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 text-green-600">
                <div className="flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span className="text-sm">+12%</span>
                </div>
                <span className="text-[10px] font-normal text-muted-foreground leading-none">
                  {trendVsPriorLabel}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Mentions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(shoppingQueries * (overallScore / 100)).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{volumePeriodLabel}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 text-green-600">
                <div className="flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span className="text-sm">+8%</span>
                </div>
                <span className="text-[10px] font-normal text-muted-foreground leading-none">
                  {trendVsPriorLabel}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Missed Opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">{missedOpportunities}</p>
                <p className="text-xs text-muted-foreground">high-value queries</p>
              </div>
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Top Shopping Queries</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-presence/opportunities">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <CardDescription>Query-level SoV vs top competitors (illustrative)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topQueries.map((item) => (
                <div key={item.query} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.visibility}%` }}
                        />
                      </div>
                      <span className="text-xs w-10">{item.visibility}%</span>
                    </div>
                  </div>
                  <div
                    className="text-right"
                    role="group"
                    aria-label={`Trend ${item.trend === "up" ? "up" : "down"}, ${trendVsPriorLabel}`}
                  >
                    <div
                      className={`flex items-center justify-end ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}
                    >
                      {item.trend === "up" ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                      {trendVsPriorLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <CardDescription>AI-powered optimization suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <Badge variant={rec.impact === "High" ? "default" : "secondary"}>{rec.impact}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
