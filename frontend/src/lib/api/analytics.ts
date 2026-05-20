import { apiClient } from "./client"

export type RangePreset = "7d" | "14d" | "28d" | "30d" | "90d" | "custom"

export interface AnalyticsRange {
  range?: RangePreset
  from?: string
  to?: string
}

export interface ServerRange {
  from: string
  to: string
  days: number
}

export interface AnalyticsStat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
}

export interface RevenueChartRow {
  date: string
  revenue: number
}

export interface FunnelStage {
  id: string
  label: string
  value: number
  pct: number
}

export interface OverviewResponse {
  range: ServerRange
  stats: AnalyticsStat[]
  revenueChart: RevenueChartRow[]
  funnel: FunnelStage[]
}

export interface ChannelRow {
  name: string
  channel: string
  description?: string
  impressions: string
  clicks: string
  conversions: number
  revenue: string
  revenueRaw: number
  spend: string
  cvr: string
  roas: string
  share: number
  model: string
}

export interface ChannelsResponse {
  range: ServerRange
  channels: ChannelRow[]
}

export interface DailyRow {
  date: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue: number
}

export interface DailyResponse {
  range: ServerRange
  daily: DailyRow[]
}

function params(r: AnalyticsRange) {
  const out: Record<string, string> = {}
  if (r.range) out.range = r.range
  if (r.from) out.from = r.from
  if (r.to) out.to = r.to
  return out
}

export async function fetchOverview(range: AnalyticsRange): Promise<OverviewResponse> {
  const { data } = await apiClient.get<OverviewResponse>("/analytics/overview", { params: params(range) })
  return data
}

export async function fetchChannels(range: AnalyticsRange): Promise<ChannelsResponse> {
  const { data } = await apiClient.get<ChannelsResponse>("/analytics/channels", { params: params(range) })
  return data
}

export async function fetchDaily(range: AnalyticsRange): Promise<DailyResponse> {
  const { data } = await apiClient.get<DailyResponse>("/analytics/daily", { params: params(range) })
  return data
}
