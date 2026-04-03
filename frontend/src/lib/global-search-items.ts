/**
 * Searchable destinations — GA4-inspired: jump to “reports” (screens) by name or keyword.
 * See https://support.google.com/analytics/answer/9357428 (search box in GA properties).
 */

export type GlobalSearchNavItem = {
  id: string
  title: string
  href: string
  /** Shown as secondary line */
  hint?: string
  /** Extra tokens for matching (lowercased when matching) */
  keywords: string[]
}

export const globalSearchNavItems: GlobalSearchNavItem[] = [
  { id: "home", title: "Home", href: "/", hint: "Dashboard", keywords: ["dashboard", "overview"] },
  { id: "campaigns", title: "Campaigns", href: "/campaigns", hint: "All campaigns", keywords: ["ads", "roas"] },
  {
    id: "campaign-new",
    title: "New campaign",
    href: "/campaigns?create=1",
    hint: "Create",
    keywords: ["create", "add"],
  },
  {
    id: "ai-overview",
    title: "AI Visibility — Overview",
    href: "/ai-presence",
    hint: "Hub",
    keywords: ["ai", "visibility", "sov", "chatgpt"],
  },
  {
    id: "shopping-journey",
    title: "Shopping Journey",
    href: "/ai-presence/shopping-journey",
    hint: "AI Visibility",
    keywords: ["funnel", "journey"],
  },
  {
    id: "merchants",
    title: "Merchants",
    href: "/ai-presence/merchants",
    hint: "AI Visibility",
    keywords: ["checkout", "share"],
  },
  {
    id: "attributes",
    title: "Attributes",
    href: "/ai-presence/attributes",
    hint: "Catalog & prompts",
    keywords: ["catalog", "structured"],
  },
  {
    id: "prompts",
    title: "Prompts",
    href: "/ai-presence/prompts",
    hint: "Shopping prompts",
    keywords: ["keywords", "sov"],
  },
  {
    id: "optimize",
    title: "SEO / GEO",
    href: "/ai-presence/optimize",
    hint: "Generative optimization",
    keywords: ["seo", "geo", "search", "citations"],
  },
  {
    id: "auto-agent",
    title: "Auto Agent",
    href: "/ai-presence/auto-agent",
    hint: "Automation",
    keywords: ["agent", "automation"],
  },
  {
    id: "competitors",
    title: "Competitors",
    href: "/ai-presence/competitors",
    hint: "Compare SoV",
    keywords: ["compare", "benchmark"],
  },
  {
    id: "opportunities",
    title: "Opportunities",
    href: "/ai-presence/opportunities",
    hint: "Gaps & fixes",
    keywords: ["gaps", "recommendations"],
  },
  {
    id: "analytics",
    title: "Performance",
    href: "/analytics",
    hint: "Analytics",
    keywords: ["reports", "revenue", "metrics"],
  },
  {
    id: "audiences",
    title: "Audiences",
    href: "/analytics/audiences",
    hint: "Analytics",
    keywords: ["segments", "users"],
  },
  {
    id: "publishers",
    title: "Publishers",
    href: "/publishers",
    hint: "Assets",
    keywords: ["partners"],
  },
  {
    id: "products",
    title: "Products",
    href: "/products",
    hint: "Catalog",
    keywords: ["catalog", "sku", "items"],
  },
  {
    id: "sync",
    title: "Sync status",
    href: "/products/sync",
    hint: "Catalog",
    keywords: ["import", "feed", "errors"],
  },
  {
    id: "settings",
    title: "Settings",
    href: "/settings",
    hint: "Account",
    keywords: ["profile", "account", "admin"],
  },
  {
    id: "ai-permissions",
    title: "AI permissions",
    href: "/settings/ai-permissions",
    hint: "Settings",
    keywords: ["aeris", "access"],
  },
  {
    id: "integrations",
    title: "Integrations",
    href: "/settings?tab=integrations",
    hint: "Settings",
    keywords: ["shopify", "connect", "api"],
  },
]

export function filterGlobalSearchNav(query: string): GlobalSearchNavItem[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return globalSearchNavItems.slice(0, 8)
  }
  return globalSearchNavItems.filter((item) => {
    const blob = `${item.title} ${item.hint ?? ""} ${item.keywords.join(" ")}`.toLowerCase()
    return blob.includes(q)
  })
}
