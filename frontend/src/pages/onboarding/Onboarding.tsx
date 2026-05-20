import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { StepBrandDiscovery } from "@/pages/onboarding/StepBrandDiscovery"
import { StepBusinessProfile } from "@/pages/onboarding/StepBusinessProfile"
import { StepConnectTools } from "@/pages/onboarding/StepConnectTools"
import { StepBilling } from "@/pages/onboarding/StepBilling"
import { StepFirstCampaign } from "@/pages/onboarding/StepFirstCampaign"
import { getOnboarding } from "@/lib/onboarding-storage"

export function Onboarding() {
  const [searchParams] = useSearchParams()
  const forceStep = Number(searchParams.get("step")) || 0
  const initialStep = forceStep || getOnboarding().step || 1
  const [step, setStep] = useState<number>(Math.min(Math.max(initialStep, 1), 5))

  const go = (next: number) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (step === 1) return <StepBrandDiscovery onContinue={() => go(2)} />
  if (step === 2) return <StepBusinessProfile onContinue={() => go(3)} onBack={() => go(1)} />
  if (step === 3) return <StepConnectTools onContinue={() => go(4)} onBack={() => go(2)} />
  if (step === 4) return <StepBilling onContinue={() => go(5)} onBack={() => go(3)} />
  return <StepFirstCampaign onBack={() => go(4)} />
}
