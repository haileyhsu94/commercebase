import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  ImageOff,
  Package,
  Search,
  Sparkles,
  Swords,
  TrendingDown,
  Wrench,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { promptInsights } from "@/lib/ai-presence-mock"
import { cn } from "@/lib/utils"
import { AutoAgentPage } from "@/pages/ai-presence/AutoAgent"

type OpportunitySource = "prompts" | "competitors" | "catalog"
type FilterKey = "all" | OpportunitySource | "pending"

type Opportunity = {
  id: string
  source: OpportunitySource
  title: string
  meta: string
  gapLabel: string
  recommendation: string
  affected: string
  impact: "high" | "medium"
}

// ── Source config ──────────────────────────────────────────────────────────

const sourceConfig: Record<OpportunitySource, { label: string; icon: typeof Search }> = {
  prompts: { label: "AI Visibility", icon: Search },
  competitors: { label: "Competitors", icon: Swords },
  catalog: { label: "Catalog", icon: Package },
}

// ── Mock opportunities ─────────────────────────────────────────────────────

const promptOpportunities: Opportunity[] = [...promptInsights]
  .filter((p) => p.recommendedFix && p.impact !== "low")
  .sort((a, b) => b.opportunityScore - a.opportunityScore)
  .slice(0, 4)
  .map((p) => ({
    id: `prompt-${p.id}`,
    source: "prompts" as const,
    title: p.prompt,
    meta: `${p.category} · ${p.volume}`,
    gapLabel: `${p.gapVsLeader} pts behind ${p.leader}`,
    recommendation: p.recommendedFix,
    affected: `~${p.affectedSkusApprox.toLocaleString()} SKUs affected`,
    impact: (p.impact === "high" ? "high" : "medium") as "high" | "medium",
  }))

const competitorOpportunities: Opportunity[] = [
  {
    id: "comp-net-a-porter",
    source: "competitors",
    title: "NET-A-PORTER outranks you on ‘luxury work bags’",
    meta: "Bags · 22K/wk",
    gapLabel: "42% share gap on ChatGPT",
    recommendation: "Add structured ‘best-for’ attribute (commuter / interview) on tote PDPs.",
    affected: "~32 SKUs affected",
    impact: "high",
  },
  {
    id: "comp-stockx",
    source: "competitors",
    title: "StockX dominates ‘limited release sneakers’",
    meta: "Sneakers · 61K/wk",
    gapLabel: "31% share gap on Perplexity",
    recommendation: "Publish authenticity & release-date schema; cross-link to drop calendar.",
    affected: "~58 SKUs affected",
    impact: "high",
  },
]

const catalogOpportunities: Opportunity[] = [
  {
    id: "cat-missing-images",
    source: "catalog",
    title: "3 products missing primary images",
    meta: "Spring/Summer collection",
    gapLabel: "Below feed quality threshold",
    recommendation: "Upload primary image for each SKU; Aeris can auto-generate alt text.",
    affected: "3 SKUs affected",
    impact: "high",
  },
  {
    id: "cat-short-desc",
    source: "catalog",
    title: "12 PDPs under 50-word description threshold",
    meta: "Outerwear · Knitwear",
    gapLabel: "AI engines deprioritize thin content",
    recommendation: "Expand descriptions with material origin, fit notes, and care info.",
    affected: "12 SKUs affected",
    impact: "medium",
  },
  {
    id: "cat-no-schema",
    source: "catalog",
    title: "8 products without JSON-LD product schema",
    meta: "Accessories",
    gapLabel: "Missing from AI Shopping cards",
    recommendation: "Generate schema with price, availability, and review aggregate.",
    affected: "8 SKUs affected",
    impact: "medium",
  },
]

const allOpportunities: Opportunity[] = [
  ...promptOpportunities,
  ...competitorOpportunities,
  ...catalogOpportunities,
]

// ── Page ───────────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string; count?: (n: number) => number }[] = [
  { key: "all", label: "All" },
  { key: "prompts", label: "AI Visibility" },
  { key: "competitors", label: "Competitors" },
  { key: "catalog", label: "Catalog" },
  { key: "pending", label: "Pending review" },
]

function countFor(filter: FilterKey): number | null {
  if (filter === "all") return allOpportunities.length
  if (filter === "pending") return null // dynamic — leave blank
  return allOpportunities.filter((o) => o.source === filter).length
}

export function FixWithAerisPage() {
  const [filter, setFilter] = useState<FilterKey>("all")

  const visibleOpportunities =
    filter === "all" || filter === "pending"
      ? allOpportunities
      : allOpportunities.filter((o) => o.source === filter)

  const showOpportunities = filter !== "pending"
  const showPending = filter === "all" || filter === "pending"

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Fix with Aeris</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          One queue for every Aeris-suggested fix — across AI visibility, competitors, and catalog.
        </p>
      </header>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1">
        {FILTERS.map((f) => {
          const count = countFor(f.key)
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f.label}
              {count !== null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    active
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Opportunities list */}
      {showOpportunities && visibleOpportunities.length > 0 && (
        <section>
          <header className="mb-3 flex items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Open opportunities</h2>
              <p className="text-sm text-muted-foreground">
                Identified by Aeris but not yet drafted. Kick off a fix to add it to the queue.
              </p>
            </div>
          </header>

          <ul className="divide-y rounded-xl border bg-card">
            {visibleOpportunities.map((o) => {
              const Icon = sourceConfig[o.source].icon
              return (
                <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 items-center gap-2 sm:w-44">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/30">
                      {/* dedicated icon per catalog/competitor; prompt uses Search */}
                      {o.source === "catalog" && o.id === "cat-missing-images" ? (
                        <ImageOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Icon className="size-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {sourceConfig[o.source].label}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{o.title}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{o.meta}</span>
                          <span className="text-border" aria-hidden>·</span>
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <TrendingDown className="size-3" />
                            {o.gapLabel}
                          </span>
                          <span className="text-border" aria-hidden>·</span>
                          <span>{o.affected}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          o.impact === "high"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        )}
                      >
                        {o.impact}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-primary">Aeris recommends: </span>
                      {o.recommendation}
                    </p>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    <Button size="sm" className="gap-1.5">
                      <Wrench className="size-3.5" />
                      Fix with Aeris
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Pending review queue */}
      {showPending && (
        <section>
          <header className="mb-3">
            <h2 className="text-base font-semibold">Pending review queue</h2>
            <p className="text-sm text-muted-foreground">
              Drafts Aeris has prepared. Approve to publish, reject to discard.
            </p>
          </header>
          <AutoAgentPage />
        </section>
      )}

      {/* Deep-link footer */}
      <footer className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/20 p-4 text-sm">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-muted-foreground">
          Looking for fixes from a specific surface? Jump directly to where the issue was found.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/ai-presence/prompts"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            Prompts
            <ArrowRight className="size-3" />
          </Link>
          <Link
            to="/ai-presence/competitors"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            Competitors
            <ArrowRight className="size-3" />
          </Link>
          <Link
            to="/catalogs"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            Catalog
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
