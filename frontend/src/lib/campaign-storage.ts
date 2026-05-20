import type { Campaign } from "@/lib/mock-data"
import { campaigns as seedCampaigns } from "@/lib/mock-data"
import {
  assetTextFromLegacySnapshot,
  initialCampaignWizardForm,
  type CampaignWizardFormData,
} from "@/types/campaign-wizard"

const STORAGE_KEY = "commercebase_user_campaigns_v1"

export const CAMPAIGN_STORAGE_UPDATED_EVENT = "commercebase-campaigns-updated"

function notifyCampaignStorageUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(CAMPAIGN_STORAGE_UPDATED_EVENT))
}

function read(): Campaign[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Campaign[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(campaigns: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
  notifyCampaignStorageUpdated()
}

/** User-launched campaigns (prepended to mock list). */
export function getUserCampaigns(): Campaign[] {
  return read()
}

export function addLaunchedCampaign(campaign: Campaign): void {
  write([campaign, ...read()])
}

/** Returns true when the wizard form has meaningful input worth saving as a draft. */
export function isDraftworthy(form: CampaignWizardFormData): boolean {
  return Boolean(
    form.name?.trim() ||
      form.budget?.trim() ||
      form.maxCpc?.trim() ||
      form.maxCps?.trim() ||
      (form.objective && form.objective !== "") ||
      form.assetImageUrls?.length ||
      form.headline?.trim(),
  )
}

/** Persist an in-progress campaign form as a draft Campaign row. */
export function saveDraftCampaign(form: CampaignWizardFormData): Campaign {
  const launchedAt = new Date().toISOString()
  const draft: Campaign = {
    id: `draft-${Date.now()}`,
    name: form.name?.trim() || "Untitled draft",
    status: "draft",
    spent: "—",
    revenue: "—",
    cvr: "—",
    roas: "—",
    cpc: form.maxCpc?.trim() ? form.maxCpc.trim() : "—",
    cps: form.maxCps?.trim() ? form.maxCps.trim() : "—",
    launchedAt,
    wizardSnapshot: { ...form },
  }
  write([draft, ...read()])
  return draft
}

/** Update an existing draft Campaign in place. */
export function updateCampaignDraft(id: string, form: CampaignWizardFormData): void {
  const current = read()
  const next = current.map((c) =>
    c.id === id
      ? {
          ...c,
          name: form.name?.trim() || c.name,
          cpc: form.maxCpc?.trim() ? form.maxCpc.trim() : c.cpc,
          cps: form.maxCps?.trim() ? form.maxCps.trim() : c.cps,
          wizardSnapshot: { ...form },
        }
      : c,
  )
  write(next)
}

/** All draft campaigns (status === "draft"). */
export function getDraftCampaigns(): Campaign[] {
  return read().filter((c) => c.status === "draft")
}

/** Map V2 wizard objective → display label for the All Campaigns "Goal KPI" column. */
function goalLabelFromObjective(objective?: string): string | undefined {
  switch (objective) {
    case "awareness_consideration":
      return "Drive discovery"
    case "leads":
      return "Acquire new customers"
    case "sales":
      return "Maximize conversion"
    default:
      return undefined
  }
}

export function makeNewCampaignRow(
  name: string,
  currencySymbol: string,
  wizardSnapshot?: CampaignWizardFormData
): Campaign {
  const launchedAt = new Date().toISOString()
  const cpcValue = wizardSnapshot?.maxCpc?.trim()
  const cpsValue = wizardSnapshot?.maxCps?.trim()
  const goal = goalLabelFromObjective(wizardSnapshot?.objective)
  return {
    id: `new-${Date.now()}`,
    name,
    status: "active",
    ...(goal ? { goal } : {}),
    spent: `${currencySymbol}0`,
    revenue: `${currencySymbol}0`,
    cvr: "—",
    roas: "—",
    cpc: cpcValue ? `${currencySymbol}${cpcValue}` : "—",
    cps: cpsValue ? `${currencySymbol}${cpsValue}` : "—",
    launchedAt,
    ...(wizardSnapshot ? { wizardSnapshot: { ...wizardSnapshot } } : {}),
  }
}

/** Pre-fill wizard for Copy campaign — uses saved snapshot when present.
 * Drafts resume in-place (no "(copy)" suffix). */
export function wizardFormFromCampaign(c: Campaign): CampaignWizardFormData {
  const isDraft = c.status === "draft"
  if (c.wizardSnapshot) {
    const base = (c.wizardSnapshot.name || c.name).trim() || c.name
    const merged: Record<string, unknown> = {
      ...initialCampaignWizardForm,
      ...c.wizardSnapshot,
      name: isDraft ? base : `${base} (copy)`,
    }
    const { headlines: _h, longHeadlines: _lh, descriptions: _d, ...rest } = merged
    return {
      ...rest,
      ...assetTextFromLegacySnapshot(merged as Parameters<typeof assetTextFromLegacySnapshot>[0]),
    } as CampaignWizardFormData
  }
  return {
    ...initialCampaignWizardForm,
    name: isDraft ? c.name : `${c.name} (copy)`,
  }
}

/** User-created campaigns first, then seed data (no duplicate ids). */
export function getMergedCampaigns(): Campaign[] {
  const user = getUserCampaigns()
  const ids = new Set(user.map((c) => c.id))
  return [...user, ...seedCampaigns.filter((c) => !ids.has(c.id))]
}
