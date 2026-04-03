import type { Campaign } from "@/lib/mock-data"
import { campaigns as seedCampaigns } from "@/lib/mock-data"

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

export function makeNewCampaignRow(name: string, currencySymbol: string): Campaign {
  const launchedAt = new Date().toISOString()
  return {
    id: `new-${Date.now()}`,
    name,
    status: "active",
    spent: `${currencySymbol}0`,
    revenue: `${currencySymbol}0`,
    cvr: "—",
    roas: "—",
    cpc: "—",
    cps: "—",
    launchedAt,
  }
}

/** User-created campaigns first, then seed data (no duplicate ids). */
export function getMergedCampaigns(): Campaign[] {
  const user = getUserCampaigns()
  const ids = new Set(user.map((c) => c.id))
  return [...user, ...seedCampaigns.filter((c) => !ids.has(c.id))]
}
