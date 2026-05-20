import { useEffect, useState } from "react"

const KEY = "commercebase_onboarding_v1"
export const ONBOARDING_UPDATED_EVENT = "commercebase-onboarding-updated"

export interface OnboardingState {
  /** True once the user has completed (or skipped through) all steps. */
  completed: boolean
  /** Furthest step (1–5) the user has progressed to. */
  step: number
  signupCompletedAt?: string
  firstCampaignSkipped?: boolean
}

const DEFAULT: OnboardingState = {
  completed: false,
  step: 1,
}

function notify() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(ONBOARDING_UPDATED_EVENT))
}

export function getOnboarding(): OnboardingState {
  if (typeof window === "undefined") return { ...DEFAULT }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return {
      completed: parsed.completed ?? false,
      step: parsed.step ?? 1,
      signupCompletedAt: parsed.signupCompletedAt,
      firstCampaignSkipped: parsed.firstCampaignSkipped,
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveOnboarding(next: Partial<OnboardingState>): OnboardingState {
  const current = getOnboarding()
  const merged: OnboardingState = { ...current, ...next }
  localStorage.setItem(KEY, JSON.stringify(merged))
  notify()
  return merged
}

export function resetOnboarding(): void {
  localStorage.removeItem(KEY)
  notify()
}

/** React hook subscribing to onboarding changes. */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => getOnboarding())

  useEffect(() => {
    const refresh = () => setState(getOnboarding())
    window.addEventListener(ONBOARDING_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(ONBOARDING_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  return {
    state,
    save: saveOnboarding,
    reset: resetOnboarding,
  }
}
