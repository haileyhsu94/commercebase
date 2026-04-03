import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const opportunities = [
  {
    id: 1,
    query: "luxury handbags",
    volume: "12.5K",
    yourVisibility: 23,
    topCompetitor: { name: "Gucci", visibility: 45 },
    recommendation: "Add 'Italian leather' and 'handcrafted' to product descriptions",
    impact: "High",
    status: "new",
  },
  {
    id: 2,
    query: "designer sneakers",
    volume: "8.2K",
    yourVisibility: 45,
    topCompetitor: { name: "Nike", visibility: 52 },
    recommendation: "Include collaborator names and limited edition details",
    impact: "High",
    status: "new",
  },
  {
    id: 3,
    query: "winter jackets premium",
    volume: "5.1K",
    yourVisibility: 34,
    topCompetitor: { name: "Moncler", visibility: 61 },
    recommendation: "Add warmth ratings and material specifications",
    impact: "Medium",
    status: "in_progress",
  },
  {
    id: 4,
    query: "sustainable fashion",
    volume: "15.8K",
    yourVisibility: 12,
    topCompetitor: { name: "Stella McCartney", visibility: 78 },
    recommendation: "Highlight eco-friendly materials and certifications",
    impact: "High",
    status: "new",
  },
  {
    id: 5,
    query: "running shoes comfortable",
    volume: "22.3K",
    yourVisibility: 78,
    topCompetitor: { name: "Nike", visibility: 82 },
    recommendation: "Continue current strategy - close to leading",
    impact: "Low",
    status: "optimized",
  },
]

const statusConfig = {
  new: { label: "New", variant: "default" as const, icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "secondary" as const, icon: TrendingUp },
  optimized: { label: "Optimized", variant: "outline" as const, icon: CheckCircle2 },
}

export function Opportunities() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums leading-none">3</p>
                <p className="mt-1 text-sm text-muted-foreground">New Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums leading-none">1</p>
                <p className="mt-1 text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums leading-none">1</p>
                <p className="mt-1 text-sm text-muted-foreground">Optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {opportunities.map((opp) => {
          const status = statusConfig[opp.status as keyof typeof statusConfig]
          const StatusIcon = status.icon
          
          return (
            <Card key={opp.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">"{opp.query}"</CardTitle>
                    <CardDescription>{opp.volume} weekly searches</CardDescription>
                  </div>
                  <Badge variant={status.variant}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your SoV</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${opp.yourVisibility}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10">{opp.yourVisibility}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Top Competitor ({opp.topCompetitor.name})
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-400"
                            style={{ width: `${opp.topCompetitor.visibility}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10">{opp.topCompetitor.visibility}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">Recommendation</p>
                        <Badge variant={opp.impact === "High" ? "default" : opp.impact === "Medium" ? "secondary" : "outline"}>
                          {opp.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{opp.recommendation}</p>
                    </div>
                    {opp.status === "new" && (
                      <Button size="sm">Apply</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
