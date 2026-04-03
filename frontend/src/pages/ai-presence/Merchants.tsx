import { Link, useOutletContext } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlatformLogo } from "@/components/shared/PlatformLogo"
import {
  merchantCheckoutShare,
  merchantCategoryShare,
  engineMerchantShare,
} from "@/lib/ai-presence-mock"
import { SOV_SHORT } from "@/lib/sov"
import { cn } from "@/lib/utils"
import {
  formatAiPresencePeriodShort,
  type AIPresenceOutletContext,
} from "./ai-presence-time-range"

export function MerchantsPage() {
  const { timeRange } = useOutletContext<AIPresenceOutletContext>()
  const period = formatAiPresencePeriodShort(timeRange)

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Merchant checkout share</CardTitle>
          <CardDescription className="space-y-2 text-pretty">
            <span>
              When an AI answer recommends where to buy, we attribute the resulting click to a merchant.
              <strong className="font-medium text-foreground"> Share</strong> is each merchant&apos;s
              percentage of those <strong className="font-medium text-foreground">AI-attributed checkout</strong>{" "}
              clicks — all rows sum to 100%.
            </span>
            <span className="block text-xs text-muted-foreground">Period: {period} (matches header)</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right">Est. checkouts</TableHead>
                <TableHead className="text-right">Δ vs prior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantCheckoutShare.map((row) => (
                <TableRow key={row.merchant} className={row.isYou ? "bg-primary/5" : undefined}>
                  <TableCell className="font-medium">
                    {row.merchant}
                    {row.isYou && <span className="ml-2 text-xs text-primary">(You)</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.share}%</TableCell>
                  <TableCell className="text-right">{row.estCheckouts}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      row.change >= 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {row.change >= 0 ? "+" : ""}
                    {row.change}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Your share by category</CardTitle>
          <CardDescription className="space-y-2 text-pretty">
            <span>
              Each percentage is your <strong className="font-medium text-foreground">share of AI-attributed
              merchant clicks</strong> in that category. The competitor % is their share of the{" "}
              <em>same</em> category total — not a two-way split, so numbers won&apos;t add to 100% with only
              two brands.
            </span>
            <span className="block text-xs text-muted-foreground">Period: {period}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {merchantCategoryShare.map((row) => {
              const otherApprox = Math.max(0, 100 - row.youPct - row.competitorPct)
              return (
                <div
                  key={row.category}
                  className="rounded-lg bg-muted/40 p-4"
                >
                  <p className="text-sm font-medium">{row.category}</p>
                  <p className="text-xs text-muted-foreground">vs {row.topCompetitor}</p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">You</p>
                      <p className="text-lg font-semibold tabular-nums">{row.youPct}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{row.topCompetitor}</p>
                      <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                        {row.competitorPct}%
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                    ~{otherApprox}% other merchants in this category (illustrative)
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your share by AI engine</CardTitle>
          <CardDescription className="space-y-2 text-pretty">
            <span>
              <strong className="font-medium text-foreground">Your share</strong> is what portion of{" "}
              <strong className="font-medium text-foreground">AI-attributed merchant clicks</strong> came from
              answers produced by <em>that</em> engine (ChatGPT vs Perplexity vs …). Top competitor shows who
              wins the most share on the same engine basis ({SOV_SHORT}-style slice, 0–100).
            </span>
            <span className="block text-xs text-muted-foreground">Period: {period}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {engineMerchantShare.map((engine) => (
              <div
                key={engine.name}
                className="flex flex-col gap-3 rounded-lg border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
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
                      Strongest rival on this engine: {engine.topCompetitor} ({engine.competitorShare}% share)
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-semibold tabular-nums">{engine.yourShare}%</p>
                  <p className="text-xs text-muted-foreground">your share of engine traffic</p>
                </div>
              </div>
            ))}
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
