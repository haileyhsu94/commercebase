/**
 * Media / placement packages — aligned with CommerceBase `plan.pdf` (Realry + StylMatch 2026).
 * Campaigns: each tier includes a number of active campaigns; additional campaigns bill when added.
 */

/** Shown in billing UI — extra campaigns use per-campaign pricing, not one flat add-on fee. */
export const ADDITIONAL_CAMPAIGN_COPY =
  "Beyond your included campaigns, each extra campaign is priced from that campaign's settings (placements, targeting, creatives, duration, and more). You'll see the estimate before you publish, and you're billed when the campaign goes live."

export type MediaPlanDefinition = {
  id: string
  name: string
  /** Monthly package price (PDF) */
  priceDisplay: string
  period: string
  tagline: string
  /** Short onsite + creator highlights */
  highlights: string[]
  /** Active campaigns included in this package */
  includedCampaigns: number
}

/** Ordered low → high (PDF) */
export const MEDIA_PLANS: readonly MediaPlanDefinition[] = [
  {
    id: "pilot",
    name: "Pilot",
    priceDisplay: "$500",
    period: "/mo",
    tagline: "Prime navigational real estate & creator network intro",
    highlights: ["Discovery Banner", "Bi-weekly creator newsletters", "StylMatch partner program"],
    includedCampaigns: 1,
  },
  {
    id: "affinity",
    name: "Affinity",
    priceDisplay: "$1,200",
    period: "/mo",
    tagline: "Target users at comparison with authentic social proof",
    highlights: ["Catalog Insert Banner", "1× Instagram Story (Nano-Creator)", "Product list & search placement"],
    includedCampaigns: 1,
  },
  {
    id: "momentum",
    name: "Momentum",
    priceDisplay: "$2,500",
    period: "/mo",
    tagline: "Dominate a category with sequential storytelling",
    highlights: ["Category Banner · Store Spotlight", "2× Instagram Stories (Micro-Creator)"],
    includedCampaigns: 2,
  },
  {
    id: "growth",
    name: "Growth",
    priceDisplay: "$5,000",
    period: "/mo",
    tagline: "High-traffic search utility + micro-creator endorsements",
    highlights: ["Promotion · Store · Search banners", "1× IG Post + 2× Stories (Micro-Creator)"],
    includedCampaigns: 3,
  },
  {
    id: "accelerator",
    name: "Accelerator",
    priceDisplay: "$10,000",
    period: "/mo",
    tagline: "Homepage visibility + intent-driving creator content",
    highlights: ["Hero · Featured Collections · Catalog insert", "Feed/Reels + 2× Stories (2 Micro-Creators)"],
    includedCampaigns: 4,
  },
  {
    id: "authority",
    name: "Authority",
    priceDisplay: "$15,000",
    period: "/mo",
    tagline: "Multi-voice creator campaign — trending effect",
    highlights: ["Category · Promo · Store · Discovery · Search · Featured", "2× Reels + 3× Stories (3 Micro-Creators)"],
    includedCampaigns: 5,
  },
  {
    id: "dominance",
    name: "Dominance",
    priceDisplay: "$20,000",
    period: "/mo",
    tagline: "Full site takeover + StylMatch social army",
    highlights: ["Full site takeover · 1st position placements", "5 Creators (Micro & Nano) + advisory"],
    includedCampaigns: 6,
  },
] as const

export const CURRENT_PLAN_ID = "growth" as const

export function getMediaPlan(id: string): MediaPlanDefinition | undefined {
  return MEDIA_PLANS.find((p) => p.id === id)
}

export function planBulletsLine(plan: MediaPlanDefinition): string {
  const n = plan.includedCampaigns
  const campaignLine = `${n} active campaign${n === 1 ? "" : "s"} included`
  return `${campaignLine} · ${plan.highlights[0] ?? plan.tagline}`
}

type PlanRelation = "downgrade" | "current" | "upgrade"

export type PlanRow = MediaPlanDefinition & {
  relation: PlanRelation
}

export function buildPlanCatalog(currentId: string): PlanRow[] {
  const idx = MEDIA_PLANS.findIndex((p) => p.id === currentId)
  const currentIndex = idx === -1 ? 3 : idx

  return MEDIA_PLANS.map((plan, i) => {
    let relation: PlanRelation = "current"
    if (i < currentIndex) relation = "downgrade"
    if (i > currentIndex) relation = "upgrade"
    return { ...plan, relation }
  })
}

export function upgradeOptionsFrom(currentId: string): MediaPlanDefinition[] {
  const idx = MEDIA_PLANS.findIndex((p) => p.id === currentId)
  if (idx < 0 || idx >= MEDIA_PLANS.length - 1) return []
  return MEDIA_PLANS.slice(idx + 1)
}
