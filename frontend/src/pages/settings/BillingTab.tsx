import { useState } from "react"
import {
  ArrowRight,
  Bot,
  Check,
  Download,
  MoreHorizontal,
  Plus,
  Receipt,
  ScanSearch,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CURRENT_PLAN_ID, getMediaPlan } from "@/lib/media-plans"

const currentMediaPlan = getMediaPlan(CURRENT_PLAN_ID)!

// ─── Constants ──────────────────────────────────────────────────────────────

const CREDIT_PRESETS = [100, 250, 500, 1000] as const

type SavedCard = {
  id: string
  brand: "Visa" | "Mastercard" | "Amex"
  last4: string
  expiry: string
  isDefault: boolean
}

const savedCards: SavedCard[] = [
  { id: "c1", brand: "Visa", last4: "4242", expiry: "08/27", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "8210", expiry: "11/26", isDefault: false },
]

type BillingHistoryEntry = {
  id: string
  date: string
  kind: "credit" | "subscription"
  description: string
  amount: number // positive = charge, negative = refund
  status: "Paid" | "Refunded" | "Failed"
}

const billingHistory: BillingHistoryEntry[] = [
  { id: "h1", date: "May 14, 2026", kind: "credit", description: "Credit top-up · Visa •• 4242", amount: 250, status: "Paid" },
  { id: "h2", date: "May 1, 2026", kind: "subscription", description: "Starter plan · monthly", amount: 1000, status: "Paid" },
  { id: "h3", date: "Apr 24, 2026", kind: "credit", description: "Auto-reload · Visa •• 4242", amount: 100, status: "Paid" },
  { id: "h4", date: "Apr 1, 2026", kind: "subscription", description: "Starter plan · monthly", amount: 1000, status: "Paid" },
  { id: "h5", date: "Mar 22, 2026", kind: "credit", description: "Credit top-up · Mastercard •• 8210", amount: 500, status: "Paid" },
]

const ACCOUNT_BALANCE_USD = 0
const SPENT_THIS_MONTH = 1342.5
const LAST_TOPUP = "Apr 24, 2026 · $100"

// AI feature usage — metered against plan limits. `limit: null` = unlimited.
type UsageItem = {
  id: string
  icon: typeof Bot
  label: string
  description: string
  used: number
  limit: number | null
  unit: string
  overageRate?: string
}

const usageItems: UsageItem[] = [
  {
    id: "aeris",
    icon: Bot,
    label: "Aeris assistant messages",
    description: "Chat turns with Aeris across all surfaces",
    used: 187,
    limit: 250,
    unit: "messages",
    overageRate: "$0.04 / message",
  },
  {
    id: "ai-gen",
    icon: Sparkles,
    label: "AI ad generations",
    description: "Headlines, descriptions, and image variants from the wizard",
    used: 42,
    limit: 50,
    unit: "generations",
    overageRate: "$0.50 / generation",
  },
  {
    id: "scans",
    icon: ScanSearch,
    label: "AI visibility scans",
    description: "Daily Share-of-Voice scans across ChatGPT, Perplexity, Google AI",
    used: 18,
    limit: 30,
    unit: "scans / day",
    overageRate: "$2.00 / scan",
  },
  {
    id: "agent",
    icon: Wrench,
    label: "Auto-agent fixes applied",
    description: "Aeris-applied content and schema fixes",
    used: 6,
    limit: 10,
    unit: "fixes",
    overageRate: "$5.00 / fix",
  },
]

const BILLING_CYCLE_RESET = "Jun 1, 2026"

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

const cardBrandClasses: Record<SavedCard["brand"], string> = {
  Visa: "bg-blue-600 text-white",
  Mastercard: "bg-orange-500 text-white",
  Amex: "bg-cyan-700 text-white",
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function CampaignCreditSection() {
  const [autoReload, setAutoReload] = useState(true)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<number | null>(250)
  const isZero = ACCOUNT_BALANCE_USD <= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Campaign credit</CardTitle>
        <CardDescription>
          Pre-paid balance used across all your campaigns. Add credit any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Balance row */}
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-muted/20 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Account credit
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums leading-none">
              {fmtUsd(ACCOUNT_BALANCE_USD)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {isZero ? "Campaigns paused — add credit to resume" : "Available across all campaigns"}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Spent this month</dt>
            <dd className="text-right font-medium tabular-nums">{fmtUsd(SPENT_THIS_MONTH)}</dd>
            <dt className="text-muted-foreground">Last top-up</dt>
            <dd className="text-right font-medium">{LAST_TOPUP}</dd>
          </dl>
        </div>

        {/* Add credit */}
        <div>
          <p className="mb-2 text-sm font-medium">Add credit</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CREDIT_PRESETS.map((amt) => {
              const active = selectedPreset === amt
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(amt)
                    setCustomAmount("")
                  }}
                  className={
                    "rounded-md border px-3 py-2 text-sm font-medium tabular-nums transition-colors " +
                    (active
                      ? "border-foreground bg-foreground text-background"
                      : "hover:bg-accent")
                  }
                >
                  ${amt.toLocaleString()}
                </button>
              )
            })}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value.replace(/[^\d]/g, ""))
                  setSelectedPreset(null)
                }}
                placeholder="Custom"
                inputMode="numeric"
                className="h-9 pl-6 text-sm tabular-nums"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Charged to{" "}
              <span className="font-medium text-foreground">Visa •• 4242</span>
            </span>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add ${(selectedPreset ?? (Number(customAmount) || 0)).toLocaleString()} credit
            </Button>
          </div>
        </div>

        {/* Auto-reload */}
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Auto-reload</p>
              {autoReload && (
                <Badge variant="secondary" className="h-5 text-[10px]">
                  On
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Top up <strong className="text-foreground">$100</strong> automatically when balance drops below{" "}
              <strong className="text-foreground">$20</strong>.
            </p>
          </div>
          <Switch checked={autoReload} onCheckedChange={setAutoReload} />
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentMethodsSection() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">Payment methods</CardTitle>
          <CardDescription>
            Cards are securely stored via Stripe. Used for credit top-ups and subscription billing.
          </CardDescription>
        </div>
        <Button size="sm" className="gap-1.5 self-start">
          <Plus className="size-3.5" />
          Add card
        </Button>
      </CardHeader>
      <CardContent>
        {savedCards.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
            <p className="text-sm font-medium">No payment methods yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a card to enable credit top-ups and resume campaigns.
            </p>
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {savedCards.map((card) => (
              <li
                key={card.id}
                className="flex items-center gap-3 p-3"
              >
                <span
                  className={
                    "flex h-7 w-11 shrink-0 items-center justify-center rounded text-[10px] font-bold tracking-wide " +
                    cardBrandClasses[card.brand]
                  }
                >
                  {card.brand === "Mastercard" ? "MC" : card.brand.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                      {card.brand} ending in {card.last4}
                    </p>
                    {card.isDefault && (
                      <Badge variant="secondary" className="h-5 gap-1 text-[10px]">
                        <Star className="size-3 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!card.isDefault && (
                    <Button type="button" variant="ghost" size="sm" className="gap-1.5">
                      <Check className="size-3.5" />
                      Set default
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Card options"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriptionSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Subscription</CardTitle>
          <Badge variant="outline">Coming soon</Badge>
        </div>
        <CardDescription>
          Paid plans and billing are coming soon. You have full access during preview — you won't be charged yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{currentMediaPlan.name}</p>
              <Badge>Current</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{currentMediaPlan.tagline}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Billing begins when plans launch — no charges during preview.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Manage subscription
            </Button>
            <Button size="sm" disabled>
              Upgrade
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UsageSection() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">AI feature usage</CardTitle>
          <CardDescription>
            Included in your {currentMediaPlan.name} plan. Resets on{" "}
            <span className="font-medium text-foreground">{BILLING_CYCLE_RESET}</span>.
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" className="self-start gap-1.5">
          <TrendingUp className="size-3.5" />
          Upgrade for more
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {usageItems.map((item) => {
            const Icon = item.icon
            const pct = item.limit ? Math.min(100, (item.used / item.limit) * 100) : 0
            const isUnlimited = item.limit === null
            return (
              <li key={item.id}>
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/30">
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-sm tabular-nums">
                        <span className="font-semibold">{item.used.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          {" "}/ {isUnlimited ? "Unlimited" : item.limit?.toLocaleString()} {item.unit}
                        </span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    {!isUnlimited && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

function BillingHistorySection() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">Billing history</CardTitle>
          <CardDescription>
            Credit top-ups and subscription charges, most recent first.
          </CardDescription>
        </div>
        <Button size="sm" variant="ghost" className="self-start gap-1.5 text-muted-foreground">
          View all
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y rounded-lg border">
          {billingHistory.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                <Receipt className="size-3.5 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.description}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.date} ·{" "}
                  <span className="capitalize">{entry.kind === "credit" ? "Credit top-up" : "Subscription"}</span>
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">
                {fmtUsd(entry.amount)}
              </p>
              <Badge
                variant="secondary"
                className={
                  "shrink-0 " +
                  (entry.status === "Paid"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : entry.status === "Refunded"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700")
                }
              >
                {entry.status}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Download receipt for ${entry.description}`}
              >
                <Download className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// ─── Public component ───────────────────────────────────────────────────────

export function BillingTab() {
  return (
    <div className="space-y-4">
      <CampaignCreditSection />
      <PaymentMethodsSection />
      <SubscriptionSection />
      <BillingHistorySection />
    </div>
  )
}
