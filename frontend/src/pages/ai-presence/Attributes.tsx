import { useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { AlertCircle, CheckCircle2, Gauge, ListChecks, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { attributeCoverage } from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"

const barColor = (pct: number, gap: boolean) => {
  if (!gap) return "bg-emerald-500 dark:bg-emerald-400"
  if (pct >= 70) return "bg-amber-500 dark:bg-amber-400"
  return "bg-red-500 dark:bg-red-400"
}

export function AttributesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const shouldHighlight = searchParams.get("highlight") === "coverage"

  useEffect(() => {
    if (shouldHighlight && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
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

  const stats = useMemo(() => {
    const total = attributeCoverage.length
    const gaps = attributeCoverage.filter((r) => r.gap).length
    const avg = Math.round(attributeCoverage.reduce((s, r) => s + r.coveragePct, 0) / total)
    const totalMissing = attributeCoverage.reduce((s, r) => s + r.missingSKUs, 0)
    return { total, gaps, avg, totalMissing }
  }, [])

  return (
    <>
      {/* Summary KPIs */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Coverage summary</CardTitle>
          <CardDescription>How complete your catalog's structured data is across key AI-facing attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            <div className="space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent dark:bg-white/[0.1] dark:ring-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Catalog completeness</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    stats.avg >= 80
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400"
                      : ""
                  }
                >
                  {stats.avg >= 80 ? "Good" : "Needs work"}
                </Badge>
              </div>
              <span className="block text-2xl font-bold">{stats.avg}%</span>
              <p className="text-[11px] text-muted-foreground leading-snug">avg. across all attributes</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent dark:bg-white/[0.1] dark:ring-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Attributes with incomplete data</span>
                </div>
                <Badge variant={stats.gaps > 0 ? "destructive" : "outline"}>
                  {stats.gaps > 0 ? `${stats.gaps} gaps` : "All clear"}
                </Badge>
              </div>
              <span className="block text-2xl font-bold">
                {stats.gaps}
                <span className="text-sm font-normal text-muted-foreground"> / {stats.total}</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-snug">attributes where SKUs are missing data</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/50 p-3 ring-1 ring-transparent dark:bg-white/[0.1] dark:ring-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">SKUs missing attribute data</span>
                </div>
              </div>
              <span className="block text-2xl font-bold">{stats.totalMissing.toLocaleString()}</span>
              <p className="text-[11px] text-muted-foreground leading-snug">product records with at least one gap</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage breakdown */}
      <Card
        ref={cardRef}
        className={cn(
          "transition-all duration-700",
          shouldHighlight && "animate-pulse ring-2 ring-primary/50"
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">Attribute coverage</CardTitle>
          <CardDescription>
            Each bar shows what share of your active SKUs have this attribute filled in. Gaps mean AI engines may skip or misrepresent your products.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {attributeCoverage.map((row) => (
            <div key={row.attribute} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {row.gap ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  <span className="text-sm font-medium truncate">{row.attribute}</span>
                  <Badge
                    variant={row.aiImpact === "high" ? "default" : "secondary"}
                    className="shrink-0 text-[10px] px-1.5 h-4"
                  >
                    {row.aiImpact} AI impact
                  </Badge>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  {row.missingSKUs > 0 && (
                    <span className="tabular-nums">{row.missingSKUs} SKUs lack this data</span>
                  )}
                  <span className="font-semibold text-foreground tabular-nums w-24 text-right">
                    {row.coveragePct}% of catalog covered
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barColor(row.coveragePct, row.gap))}
                  style={{ width: `${row.coveragePct}%` }}
                />
              </div>
              {row.whyItMatters && (
                <p className="text-xs text-muted-foreground pl-6 leading-relaxed">{row.whyItMatters}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
