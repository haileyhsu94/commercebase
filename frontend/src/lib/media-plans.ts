/**
 * Pricing plans — aligned with CommerceBase v1 platform pricing.
 * Three tiers: Free, Starter, Enterprise.
 */

export type MediaPlanDefinition = {
  id: string
  name: string
  /** Monthly package price display string */
  priceDisplay: string
  period: string
  tagline: string
  /** Short feature highlights */
  highlights: string[]
  /** Active campaigns included in this package (0 = unlimited / custom) */
  includedCampaigns: number
}

export const MEDIA_PLANS: readonly MediaPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceDisplay: "$0",
    period: "/mo",
    tagline: "Get started with the basics — no credit card required",
    highlights: ["1 product catalog", "Realry network only", "Basic reporting"],
    includedCampaigns: 1,
  },
  {
    id: "starter",
    name: "Starter",
    priceDisplay: "$1K–$10K",
    period: "/mo",
    tagline: "Full publisher network with hybrid pricing",
    highlights: ["Full publisher network", "CPC + CPS hybrid pricing model", "Monthly reporting"],
    includedCampaigns: 5,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceDisplay: "$100K+",
    period: "/mo",
    tagline: "Dedicated team, RTB, and real-time analytics at scale",
    highlights: ["Dedicated account team", "RTB + programmatic capabilities", "Real-time dashboard"],
    includedCampaigns: 0,
  },
] as const

export const CURRENT_PLAN_ID = "starter" as const

export function getMediaPlan(id: string): MediaPlanDefinition | undefined {
  return MEDIA_PLANS.find((p) => p.id === id)
}

export function planBulletsLine(plan: MediaPlanDefinition): string {
  if (plan.includedCampaigns <= 0) return `Unlimited campaigns · ${plan.highlights[0] ?? plan.tagline}`
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
  const currentIndex = idx === -1 ? 1 : idx

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
