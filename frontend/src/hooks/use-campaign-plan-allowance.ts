import { useEffect, useMemo, useState } from "react"
import { CAMPAIGN_STORAGE_UPDATED_EVENT } from "@/lib/campaign-storage"
import {
  getCampaignPlanAllowance,
  type CampaignPlanAllowance,
} from "@/lib/campaign-plan-allowance"

/**
 * Re-reads allowance when user campaigns change (e.g. after launching a campaign).
 * Same-tab `localStorage` updates don’t fire `storage`.
 */
export function useCampaignPlanAllowance(): CampaignPlanAllowance {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener(CAMPAIGN_STORAGE_UPDATED_EVENT, bump)
    return () => window.removeEventListener(CAMPAIGN_STORAGE_UPDATED_EVENT, bump)
  }, [])

  return useMemo(() => getCampaignPlanAllowance(), [version])
}
