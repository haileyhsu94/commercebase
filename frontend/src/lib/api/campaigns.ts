import type { Campaign } from "@/lib/mock-data"
import type { CampaignWizardFormData } from "@/types/campaign-wizard"
import { apiClient } from "./client"

export interface CampaignListFilters {
  status?: string
  search?: string
}

/** Raw resource shape returned by /api/v1/campaigns. Currency-formatted strings. */
interface CampaignResource {
  id: string
  name: string
  status: Campaign["status"]
  goal?: string | null
  campaignType?: string | null
  budget?: string | null
  budgetType?: string | null
  bidStrategy?: string | null
  maxCpc?: number | null
  currency?: string | null
  startDate?: string | null
  endDate?: string | null
  targetMarket?: string | null
  channels?: string[]
  channelSurfaces?: string[]
  regions?: string[]
  devices?: string[]
  ageBands?: string[]
  interests?: string[]
  products?: string[]
  productExclusions?: string[]
  headlinePrimary?: string | null
  headlineSecondary?: string | null
  description?: string | null
  imageAspectRatios?: string[]
  imageUrl?: string | null
  conversionGoals?: string[]
  attributionModel?: string | null
  utmPrefix?: string | null
  spent: string
  revenue: string
  clicks: string
  orders: number
  cvr: string
  roas: string
  cpc: string
  cps: string
  launchedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

function currencySymbol(code?: string | null): string {
  if (!code) return "$"
  if (code === "KRW") return "₩"
  if (code === "EUR") return "€"
  if (code === "GBP") return "£"
  return "$"
}

function fmtMoney(raw: string | number | null | undefined, symbol: string): string {
  if (raw == null || raw === "") return `${symbol}0`
  const n = typeof raw === "string" ? Number(raw) : raw
  if (!Number.isFinite(n)) return `${symbol}0`
  if (n >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${symbol}${(n / 1_000).toFixed(1)}K`
  return `${symbol}${Math.round(n)}`
}

function toCampaign(r: CampaignResource): Campaign {
  const symbol = currencySymbol(r.currency)
  return {
    id: r.id,
    name: r.name,
    status: r.status,
    goal: r.goal ?? undefined,
    budget: r.budget != null ? fmtMoney(r.budget, symbol) : undefined,
    spent: fmtMoney(r.spent, symbol),
    clicks: r.clicks || undefined,
    orders: r.orders || undefined,
    revenue: fmtMoney(r.revenue, symbol),
    cvr: r.cvr && r.cvr !== "0" ? `${r.cvr}%` : "—",
    roas: r.roas && r.roas !== "0" ? `${r.roas}%` : "—",
    cpa: undefined,
    cpc: r.cpc && r.cpc !== "0" ? fmtMoney(r.cpc, symbol) : "—",
    cps: r.cps && r.cps !== "0" ? fmtMoney(r.cps, symbol) : "—",
    launchedAt: r.launchedAt ?? undefined,
  }
}

export async function fetchCampaigns(filters: CampaignListFilters = {}): Promise<Campaign[]> {
  const { data } = await apiClient.get<{ data: CampaignResource[] }>("/campaigns", { params: filters })
  return data.data.map(toCampaign)
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.get<{ data: CampaignResource }>(`/campaigns/${id}`)
  return toCampaign(data.data)
}

export interface CreateCampaignPayload extends Partial<CampaignWizardFormData> {
  name: string
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  const { data } = await apiClient.post<{ data: CampaignResource }>("/campaigns", payload)
  return toCampaign(data.data)
}

export async function launchCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.post<{ data: CampaignResource }>(`/campaigns/${id}/launch`)
  return toCampaign(data.data)
}

export async function pauseCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.post<{ data: CampaignResource }>(`/campaigns/${id}/pause`)
  return toCampaign(data.data)
}

export async function resumeCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.post<{ data: CampaignResource }>(`/campaigns/${id}/resume`)
  return toCampaign(data.data)
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiClient.delete(`/campaigns/${id}`)
}
