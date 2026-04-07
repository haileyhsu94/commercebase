import { getMergedCampaigns, wizardFormFromCampaign } from "@/lib/campaign-storage"
import type { Campaign } from "@/lib/mock-data"
import type { CampaignWizardFormData } from "@/types/campaign-wizard"

/** sessionStorage key for one-shot wizard pre-fill from Aeris (read once, then removed). */
export const CAMPAIGN_WIZARD_AI_DRAFT_KEY = "commercebase_campaign_wizard_draft_v1"

const COPY_INTENT =
  /\b(copy|clone|duplicate|similar to|same as|like|based on|start from|from my|reuse|remix|pre-?fill|another (one )?like|same setup)\b/i

export type AiCampaignCopyResult =
  | { matched: false }
  | { matched: true; summary: string; draft: CampaignWizardFormData }

function resolveSourceCampaign(pathname: string, message: string, list: Campaign[]): Campaign | null {
  if (list.length === 0) return null

  const detail = pathname.match(/^\/campaigns\/([^/]+)$/)
  if (detail && detail[1] !== "new") {
    const byPath = list.find((c) => c.id === detail[1])
    if (byPath) return byPath
  }

  const lower = message.toLowerCase()
  const quoted = message.match(/["']([^"']{2,})["']/)
  if (quoted) {
    const q = quoted[1].toLowerCase()
    const exact = list.find((c) => c.name.toLowerCase() === q)
    if (exact) return exact
    const partial = list.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()))
    if (partial) return partial
  }

  let best: Campaign | null = null
  let bestLen = 0
  for (const c of list) {
    const n = c.name.toLowerCase()
    if (n.length < 3) continue
    if (lower.includes(n) && n.length > bestLen) {
      best = c
      bestLen = n.length
    }
  }
  if (best) return best

  return list[0]
}

function applyMockTweaks(draft: CampaignWizardFormData, msg: string): CampaignWizardFormData {
  const lower = msg.toLowerCase()
  let next = { ...draft }

  if (/\b(us|united states|usa)\b/.test(lower)) {
    next = { ...next, targetMarket: "north_america" }
  }

  if (
    /\b(higher|increase|raise|more)\b[\s\S]{0,40}\bbudget\b|\bbudget\b[\s\S]{0,40}\b(higher|increase|raise|more)\b/.test(
      lower
    )
  ) {
    const digits = next.budget.replace(/\D/g, "")
    const n = parseInt(digits, 10)
    if (!Number.isNaN(n) && n > 0) {
      next = { ...next, budget: String(Math.round(n * 1.25)) }
    } else if (!next.budget.trim()) {
      next = { ...next, budget: "150" }
    }
  }

  return next
}

/**
 * Heuristic matcher for NL “copy this campaign” requests (mock v1).
 * When matched, caller should offer “Open copy in wizard” with JSON in sessionStorage.
 */
export function tryBuildAiCampaignCopy(userMessage: string, pathname: string): AiCampaignCopyResult {
  const trimmed = userMessage.trim()
  if (!trimmed || !COPY_INTENT.test(trimmed)) {
    return { matched: false }
  }

  const list = getMergedCampaigns()
  const source = resolveSourceCampaign(pathname, trimmed, list)
  if (!source) return { matched: false }

  let draft = wizardFormFromCampaign(source)
  draft = applyMockTweaks(draft, trimmed)

  const tweaks: string[] = []
  if (/\b(us|united states|usa)\b/i.test(trimmed)) tweaks.push("target market set toward North America")
  if (
    /\b(higher|increase|raise|more)\b[\s\S]{0,40}\bbudget\b|\bbudget\b[\s\S]{0,40}\b(higher|increase|raise|more)\b/i.test(
      trimmed
    )
  ) {
    tweaks.push("daily budget adjusted upward")
  }

  const tweakLine = tweaks.length ? ` I applied: ${tweaks.join("; ")}.` : ""
  const summary = `I’ll base the new campaign on “${source.name}”.${tweakLine} Open the wizard to review every step before you launch.`

  return { matched: true, summary, draft }
}
