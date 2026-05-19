// Mock audience segments. In production these come from §4 Analytics
// (segment builder) — here they're hard-coded so the Send Email / Send SMS
// configuration can offer real choices and show membership criteria.

export interface AudienceSegment {
  id: string
  name: string
  description: string
  criteria: string
  count: number
}

export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: "vip",
    name: "VIP segment",
    description: "Highest-LTV customers eligible for early access and concierge.",
    criteria: "Top 5% LTV in last 12 months AND ≥3 orders",
    count: 1247,
  },
  {
    id: "high-intent",
    name: "High-intent shoppers",
    description: "Recently signaled purchase intent in AI shopping prompts.",
    criteria: "Viewed PDP ≥2× in last 7d OR added to cart in last 24h",
    count: 8420,
  },
  {
    id: "cart-abandoners",
    name: "Cart abandoners",
    description: "Started checkout but didn't complete in 1+ hour.",
    criteria: "checkout.started AND NOT order.placed (window: 1h–7d)",
    count: 2113,
  },
  {
    id: "lapsed-90d",
    name: "Lapsed (90d)",
    description: "Haven't ordered in 90+ days but previously engaged.",
    criteria: "last_order_at < now-90d AND lifetime_orders ≥ 1",
    count: 5934,
  },
  {
    id: "subscribers",
    name: "Email subscribers",
    description: "All consented marketing email subscribers.",
    criteria: "email_consent = true",
    count: 24180,
  },
  {
    id: "all-customers",
    name: "All customers",
    description: "Anyone with a placed order.",
    criteria: "lifetime_orders ≥ 1",
    count: 38205,
  },
]

export function findSegment(idOrName: string | undefined): AudienceSegment | undefined {
  if (!idOrName) return undefined
  const key = idOrName.toLowerCase().trim()
  return AUDIENCE_SEGMENTS.find((s) => s.id === key || s.name.toLowerCase() === key)
}
