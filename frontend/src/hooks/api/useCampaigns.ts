import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createCampaign,
  deleteCampaign,
  fetchCampaign,
  fetchCampaigns,
  launchCampaign,
  pauseCampaign,
  resumeCampaign,
  type CampaignListFilters,
  type CreateCampaignPayload,
} from "@/lib/api/campaigns"

export const campaignKeys = {
  all: ["campaigns"] as const,
  list: (filters?: CampaignListFilters) => [...campaignKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...campaignKeys.all, "detail", id] as const,
}

export function useCampaignsQuery(filters?: CampaignListFilters) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => fetchCampaigns(filters),
  })
}

export function useCampaignQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? campaignKeys.detail(id) : campaignKeys.all,
    queryFn: () => fetchCampaign(id as string),
    enabled: !!id,
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: campaignKeys.all })
}

export function useCreateCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useLaunchCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => launchCampaign(id),
    onSuccess: () => invalidateAll(qc),
  })
}

export function usePauseCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pauseCampaign(id),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useResumeCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeCampaign(id),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => invalidateAll(qc),
  })
}
