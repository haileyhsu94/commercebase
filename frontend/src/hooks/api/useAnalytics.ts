import { useQuery } from "@tanstack/react-query"
import {
  fetchChannels,
  fetchDaily,
  fetchOverview,
  type AnalyticsRange,
  type ChannelsResponse,
  type DailyResponse,
  type OverviewResponse,
} from "@/lib/api/analytics"
import type { AiPresenceTimeRange } from "@/pages/ai-presence/ai-presence-time-range"

/**
 * 프론트 timeRange 객체 → 백엔드 API range 파라미터로 변환.
 */
export function toAnalyticsRange(timeRange: AiPresenceTimeRange): AnalyticsRange {
  if (timeRange.kind === "preset") {
    return { range: timeRange.preset as AnalyticsRange["range"] }
  }
  return {
    range: "custom",
    from: timeRange.from,
    to: timeRange.to,
  }
}

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (r: AnalyticsRange) => [...analyticsKeys.all, "overview", r] as const,
  channels: (r: AnalyticsRange) => [...analyticsKeys.all, "channels", r] as const,
  daily: (r: AnalyticsRange) => [...analyticsKeys.all, "daily", r] as const,
}

export function useOverviewQuery(range: AnalyticsRange) {
  return useQuery<OverviewResponse>({
    queryKey: analyticsKeys.overview(range),
    queryFn: () => fetchOverview(range),
  })
}

export function useChannelsQuery(range: AnalyticsRange) {
  return useQuery<ChannelsResponse>({
    queryKey: analyticsKeys.channels(range),
    queryFn: () => fetchChannels(range),
  })
}

export function useDailyQuery(range: AnalyticsRange) {
  return useQuery<DailyResponse>({
    queryKey: analyticsKeys.daily(range),
    queryFn: () => fetchDaily(range),
  })
}
