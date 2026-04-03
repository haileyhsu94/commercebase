import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { shoppingJourneySteps } from "@/lib/ai-presence-mock"

export function ShoppingJourneyPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI shopping journey</CardTitle>
          <CardDescription>Mock conversion rates between stages (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {shoppingJourneySteps.map((step, i) => {
            const prev = i > 0 ? shoppingJourneySteps[i - 1]!.ratePct : 100
            const drop = i === 0 ? null : Math.round(100 - (step.ratePct / prev) * 100)
            return (
              <div key={step.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold tabular-nums">{step.ratePct}%</span>
                    {drop != null && (
                      <span className="ml-2 text-xs text-muted-foreground">−{drop}% vs prev</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${step.ratePct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}
