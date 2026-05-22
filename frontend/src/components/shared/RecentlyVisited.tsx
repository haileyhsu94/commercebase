import { Link } from "react-router-dom"
import {
  BarChart3,
  Bot,
  CreditCard,
  Megaphone,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react"

type RecentItem = {
  id: string
  icon: LucideIcon
  primary: string
  secondary: string
  visitedLabel: string
  href: string
}

// Mock data — would come from a page-visit tracking hook in production.
const recentItems: RecentItem[] = [
  {
    id: "linen-edit",
    icon: Megaphone,
    primary: "Campaigns",
    secondary: "Linen Edit – May",
    visitedLabel: "2 minutes ago",
    href: "/campaigns/2",
  },
  {
    id: "billing",
    icon: CreditCard,
    primary: "Billing & Payments",
    secondary: "Invoices",
    visitedLabel: "3 hours ago",
    href: "/settings?tab=billing",
  },
  {
    id: "performance",
    icon: BarChart3,
    primary: "Analytics",
    secondary: "Performance Overview",
    visitedLabel: "Yesterday",
    href: "/analytics",
  },
  {
    id: "ai-visibility",
    icon: Bot,
    primary: "AI Visibility",
    secondary: "Share of Voice",
    visitedLabel: "2 days ago",
    href: "/ai-presence",
  },
]

// Used in production when no recent items exist — top destinations.
const fallbackItems: RecentItem[] = [
  {
    id: "catalogs",
    icon: Package,
    primary: "Catalogs",
    secondary: "Product feeds",
    visitedLabel: "Suggested",
    href: "/catalogs",
  },
  {
    id: "audiences",
    icon: Users,
    primary: "Audiences",
    secondary: "Custom segments",
    visitedLabel: "Suggested",
    href: "/analytics/audiences",
  },
]

export function RecentlyVisited() {
  const items = recentItems.length > 0 ? recentItems : fallbackItems
  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Recently visited</h2>
      </header>
      <ul className="grid gap-3 p-3 sm:grid-cols-2 md:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <Link
                to={item.href}
                className="group flex h-full flex-col gap-2 rounded-lg border bg-background/40 p-3 transition-colors hover:border-foreground/20 hover:bg-accent/40"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                    <Icon className="h-4 w-4 text-foreground/80" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">{item.primary}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.secondary}</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.visitedLabel}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
