import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ImageOff,
  Info,
  OctagonAlert,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { alerts as alertsMock } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/** Flip this to a positive number to preview the funded state. */
const ACCOUNT_BALANCE_USD = 0

/**
 * Today panel rule: show at most 4 items so the panel stays scannable and
 * balances against the Balance & Spend card on the right. Items are sorted
 * by urgency (danger → warning → opportunity → info → success); ties keep
 * insertion order. Anything beyond the cap should surface via a "View all".
 */
const MAX_FEED_ITEMS = 4
const TONE_PRIORITY: Record<Tone, number> = {
  danger: 0,
  warning: 1,
  opportunity: 2,
  info: 3,
  success: 4,
}

type Tone = "danger" | "warning" | "success" | "info" | "opportunity"

const toneStyles: Record<Tone, { icon: string; dot: string }> = {
  danger: { icon: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  warning: { icon: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  success: { icon: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  info: { icon: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
  opportunity: { icon: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
}

type FeedItem = {
  id: string
  tone: Tone
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  meta?: string
  time?: string
  cta: string
} & ({ kind: "navigate"; href: string } | { kind: "sheet"; sheetKey: "missing-images" })

const proactiveItems: FeedItem[] = [
  {
    id: "missing-images",
    tone: "warning",
    icon: ImageOff,
    title: "3 products missing images",
    description: "Ads with images get 2.4× more clicks.",
    meta: "Catalog",
    cta: "Review",
    kind: "sheet",
    sheetKey: "missing-images",
  },
  {
    id: "duplicate-campaign",
    tone: "opportunity",
    icon: Sparkles,
    title: "Duplicate “Linen Edit – May”?",
    description: "Drove $14.2k attributed revenue. Ended 4 days ago.",
    meta: "Last campaign",
    cta: "Duplicate",
    kind: "navigate",
    href: "/campaigns?create=1&from=last",
  },
  {
    id: "trending-query",
    tone: "opportunity",
    icon: TrendingUp,
    title: "“Wide-leg trousers” is trending",
    description: "8 matching products in your catalog.",
    meta: "Trends",
    cta: "Create",
    kind: "navigate",
    href: "/campaigns?create=1&seed=wide-leg-trousers",
  },
]

const alertToneMap: Record<"success" | "warning" | "info", Tone> = {
  success: "success",
  warning: "warning",
  info: "info",
}
const alertIconMap = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
}

const missingImagesMock = [
  { sku: "RL-LIN-204", name: "Linen wide-leg trouser – oat", price: "$148" },
  { sku: "RL-LIN-211", name: "Cropped linen blazer – sand", price: "$268" },
  { sku: "RL-COT-309", name: "Poplin midi shirt dress – ivory", price: "$198" },
]

function FundsNotAvailableBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-900/60 dark:bg-rose-950/40">
      <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
          Funds not available
        </p>
        <p className="text-xs leading-snug text-rose-800/90 dark:text-rose-200/80">
          Your campaigns are paused. Add credit to resume — or visit{" "}
          <Link to="/settings?tab=billing" className="underline underline-offset-2">
            Billing
          </Link>{" "}
          to update your payment method.
        </p>
      </div>
      <Link
        to="/settings?tab=billing"
        className={cn(
          buttonVariants({ size: "sm" }),
          "shrink-0 gap-1.5 bg-rose-600 text-white hover:bg-rose-700"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Add credit
      </Link>
    </div>
  )
}

function BalanceCard({ balance }: { balance: number }) {
  const isZero = balance <= 0
  return (
    <aside className="flex flex-col rounded-xl border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Balance</h2>
        <Link
          to="/settings?tab=billing"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Manage
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Account credit
          </p>
          <p className="mt-1 text-4xl font-semibold tabular-nums leading-none">
            ${balance.toLocaleString("en-US")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {isZero ? "Campaigns paused" : "Available to spend across all campaigns"}
          </p>
        </div>
        <dl className="space-y-2 border-t pt-3 text-xs">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Spent · last 7d</dt>
            <dd className="font-medium tabular-nums">$0.00</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Next charge</dt>
            <dd className="font-medium">Jun 1, 2026</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Auto-reload</dt>
            <dd className="font-medium">Every $100</dd>
          </div>
        </dl>
        {!isZero && (
          <Link
            to="/settings?tab=billing"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full gap-1.5")}
          >
            <Plus className="h-3.5 w-3.5" />
            Add card
          </Link>
        )}
      </div>
    </aside>
  )
}

export function QuickActions() {
  const [openSheet, setOpenSheet] = useState<null | "missing-images">(null)
  const navigate = useNavigate()

  const alertItems: FeedItem[] = alertsMock.slice(0, 2).map((a) => ({
    id: `alert-${a.id}`,
    tone: alertToneMap[a.type],
    icon: alertIconMap[a.type],
    title: a.title,
    description: a.description,
    meta: a.type === "success" ? "Win" : a.type === "warning" ? "Attention" : "AI visibility",
    time: a.time,
    cta: a.actionLabel ?? "View",
    kind: "navigate",
    href: a.actionHref ?? "#",
  }))

  const feed: FeedItem[] = [...alertItems, ...proactiveItems]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const pa = TONE_PRIORITY[a.item.tone] ?? 99
      const pb = TONE_PRIORITY[b.item.tone] ?? 99
      return pa === pb ? a.index - b.index : pa - pb
    })
    .slice(0, MAX_FEED_ITEMS)
    .map(({ item }) => item)

  return (
    <div className="space-y-3">
      {ACCOUNT_BALANCE_USD <= 0 && <FundsNotAvailableBanner />}

      <div className="grid gap-3 md:grid-cols-3">
        <section className="flex flex-col rounded-xl border bg-card md:col-span-2">
          <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight">Alerts & Next Steps</h2>
            <Link
              to="/inbox"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="divide-y px-1 py-1">
          {feed.map((item) => {
          const Icon = item.icon
          const tone = toneStyles[item.tone]
          const handleClick = () => {
            if (item.kind === "sheet") setOpenSheet(item.sheetKey)
            else if (item.href !== "#") navigate(item.href)
          }
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={handleClick}
                className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent/50"
              >
                <span className="relative shrink-0">
                  <Icon className={cn("h-4 w-4", tone.icon)} />
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-card",
                      tone.dot
                    )}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium leading-tight">{item.title}</p>
                    {item.meta && (
                      <span className="hidden shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:inline">
                        · {item.meta}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {item.time && <span className="tabular-nums">{item.time}</span>}
                  <span className="hidden items-center gap-1 font-medium text-foreground group-hover:inline-flex">
                    {item.cta}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            </li>
          )
        })}
          </ul>
        </section>
        <BalanceCard balance={ACCOUNT_BALANCE_USD} />
      </div>

      <Sheet open={openSheet === "missing-images"} onOpenChange={(o) => setOpenSheet(o ? "missing-images" : null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Products missing images</SheetTitle>
            <SheetDescription>
              Add an image and these products will start appearing in dynamic ads within 15 minutes.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2 px-4">
            {missingImagesMock.map((p) => (
              <div
                key={p.sku}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.sku} · {p.price}
                  </p>
                </div>
                <Button size="sm" variant="secondary">
                  Add image
                </Button>
              </div>
            ))}
          </div>
          <SheetFooter>
            <Link to="/products" className={cn(buttonVariants({ variant: "outline" }))}>
              Open full catalog
            </Link>
            <Button onClick={() => setOpenSheet(null)}>Done</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
