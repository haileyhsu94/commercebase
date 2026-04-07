import { useEffect, useRef } from "react"
import { Link, useOutletContext, useSearchParams } from "react-router-dom"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlatformLogo } from "@/components/shared/PlatformLogo"
import {
  merchantCheckoutShare,
  merchantCategoryShare,
  engineMerchantShare,
} from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"
import {
  formatAiPresencePeriodShort,
  type AIPresenceOutletContext,
} from "./ai-presence-time-range"

export function MerchantsPage() {
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const period = formatAiPresencePeriodShort(timeRange)
  const [searchParams, setSearchParams] = useSearchParams()
  const shareRef = useRef<HTMLDivElement>(null)
  const shouldHighlight = searchParams.get("highlight") === "share"

  useEffect(() => {
    if (shouldHighlight && shareRef.current) {
      shareRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      const timeout = setTimeout(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete("highlight")
          return next
        }, { replace: true })
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [shouldHighlight, setSearchParams])

  return (
    <>
      {/* Merchant checkout share — horizontal bar chart */}
      <Card
        ref={shareRef}
        className={cn(
          "mb-6 transition-all duration-700",
          shouldHighlight && "animate-pulse ring-2 ring-primary/50"
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">Merchant checkout share</CardTitle>
          <CardDescription>
            Who gets the click when AI recommends where to buy · {period}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {merchantCheckoutShare.map((row) => (
            <div key={row.merchant} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("text-sm font-medium truncate", row.isYou && "text-primary")}>
                    {row.merchant}
                    {row.isYou && <span className="ml-1 text-xs">(You)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{row.estCheckouts} checkouts</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                      row.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {row.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {row.change >= 0 ? "+" : ""}{row.change}%
                  </span>
                  <span className="text-sm font-semibold tabular-nums w-10 text-right">{row.share}%</span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    row.isYou ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  style={{ width: `${row.share}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Your share by category — comparative bars */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Your share by category</CardTitle>
          <CardDescription>
            Your AI-attributed checkout share vs top competitor per category · {period}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {merchantCategoryShare.map((row) => {
            const winning = row.youPct >= row.competitorPct
            return (
              <div key={row.category} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{row.category}</p>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      winning ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {winning ? "Leading" : `Behind by ${row.competitorPct - row.youPct}pts`}
                  </span>
                </div>
                {/* You */}
                <div className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground truncate">You</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${row.youPct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold tabular-nums">{row.youPct}%</span>
                </div>
                {/* Competitor */}
                <div className="flex items-center gap-2">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground truncate">{row.topCompetitor}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-muted-foreground/40 transition-all duration-500"
                      style={{ width: `${row.competitorPct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium tabular-nums text-muted-foreground">{row.competitorPct}%</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Your share by AI engine */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your share by AI engine</CardTitle>
          <CardDescription>
            How your checkout share compares to the top rival on each engine · {period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {engineMerchantShare.map((engine) => {
              const winning = engine.yourShare >= engine.competitorShare
              return (
                <div
                  key={engine.name}
                  className="rounded-lg border border-border/80 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PlatformLogo
                        name={engine.name}
                        shortName={engine.shortName}
                        iconSlug={engine.iconSlug}
                        color={engine.color}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-medium">{engine.name}</p>
                        <p className="text-xs text-muted-foreground">
                          vs {engine.topCompetitor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold tabular-nums">{engine.yourShare}%</p>
                      <p className={cn(
                        "text-[11px] font-medium",
                        winning ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {winning
                          ? `+${engine.yourShare - engine.competitorShare}pts ahead`
                          : `${engine.competitorShare - engine.yourShare}pts behind`}
                      </p>
                    </div>
                  </div>
                  {/* Comparative bars */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-[11px] text-muted-foreground">You</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${engine.yourShare}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-[11px] text-muted-foreground truncate">{engine.topCompetitor}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-muted-foreground/40 transition-all duration-500"
                          style={{ width: `${engine.competitorShare}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Tweak prompts and catalog attributes in{" "}
            <Link to="/ai-presence/prompts" className="text-primary underline-offset-4 hover:underline">
              Prompts
            </Link>{" "}
            and{" "}
            <Link to="/ai-presence/attributes" className="text-primary underline-offset-4 hover:underline">
              Attributes
            </Link>{" "}
            to lift engines where your share lags rivals.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
