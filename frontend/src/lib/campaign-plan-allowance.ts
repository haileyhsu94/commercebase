import { getUserCampaigns } from "@/lib/campaign-storage"
import type { Campaign } from "@/lib/mock-data"
import { ADDITIONAL_CAMPAIGN_COPY, CURRENT_PLAN_ID, getMediaPlan } from "@/lib/media-plans"

/** When the campaign “went live” for slot counting — prefers `launchedAt`, else parses numeric `new-<ts>` ids. */
export function effectiveLaunchedAt(c: Campaign): Date | null {
  if (c.launchedAt) {
    const d = new Date(c.launchedAt)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const m = /^new-(\d+)$/.exec(c.id)
  if (m) {
    const ts = Number(m[1])
    if (!Number.isNaN(ts)) return new Date(ts)
  }
  return null
}

function isInCurrentMonth(d: Date): boolean {
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

/**
 * Counts campaigns that count toward this month’s included plan slots:
 * launched this calendar month and not ended (active/paused/draft still hold a slot).
 */
export function countIncludedCampaignSlotsUsedThisMonth(): number {
  return getUserCampaigns().filter((c) => {
    if (c.status === "ended") return false
    const la = effectiveLaunchedAt(c)
    if (!la || !isInCurrentMonth(la)) return false
    return true
  }).length
}

export type CampaignPlanAllowance = {
  planId: string
  planName: string
  /** From `media-plans` — included active campaigns per month for this tier. */
  includedPerMonth: number
  usedThisMonth: number
  remainingThisMonth: number
  /** True when `usedThisMonth` >= `includedPerMonth` (extra campaigns use per-campaign pricing). */
  isAtOrOverIncludedLimit: boolean
}

export function getCampaignPlanAllowance(): CampaignPlanAllowance {
  const plan = getMediaPlan(CURRENT_PLAN_ID)
  const included = plan?.includedCampaigns ?? 0
  const used = countIncludedCampaignSlotsUsedThisMonth()
  const remaining = Math.max(0, included - used)
  return {
    planId: CURRENT_PLAN_ID,
    planName: plan?.name ?? "—",
    includedPerMonth: included,
    usedThisMonth: used,
    remainingThisMonth: remaining,
    isAtOrOverIncludedLimit: included > 0 && used >= included,
  }
}

export { ADDITIONAL_CAMPAIGN_COPY }
