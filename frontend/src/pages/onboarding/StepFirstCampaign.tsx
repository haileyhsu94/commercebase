import { useNavigate } from "react-router-dom"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/OnboardingShell"
import {
  GoalFunnelCard,
  GOAL_OPTIONS,
  type GoalOption,
} from "@/components/campaigns/wizard/GoalFunnelCard"
import { getCompanyProfile } from "@/lib/company-profile"
import { saveOnboarding } from "@/lib/onboarding-storage"
import { CAMPAIGN_WIZARD_AI_DRAFT_KEY } from "@/lib/campaign-ai-copy-mock"

/** Read the persisted home mode directly (the context provider only wraps RootLayout). */
function getHomeModePref(): "dashboard" | "ai" {
  try {
    const v = localStorage.getItem("commercebase_home_mode_v1")
    return v === "ai" ? "ai" : "dashboard"
  } catch {
    return "dashboard"
  }
}
import {
  initialCampaignWizardForm,
  type CampaignWizardFormData,
} from "@/types/campaign-wizard"
import { currencyForCountry } from "@/lib/mock-data"

interface Props {
  onBack: () => void
}

export function StepFirstCampaign({ onBack }: Props) {
  const navigate = useNavigate()
  const mode = getHomeModePref()

  function pickGoal(goal: GoalOption) {
    const profile = getCompanyProfile()
    const draft: CampaignWizardFormData = {
      ...initialCampaignWizardForm,
      objective: goal.value,
      campaignType: "performance_max",
      name: `${profile.companyName} — ${goal.label}`,
      currency:
        profile.currency || (profile.country ? currencyForCountry(profile.country) : "USD"),
      regions: profile.country ? [profile.country] : [],
      languages: profile.language ? [profile.language] : ["en"],
      finalUrl: profile.website ?? "",
      businessName: profile.companyName ?? "",
      brandMainColor: profile.brandMainColor ?? "",
      brandAccentColor: profile.brandAccentColor ?? "",
      brandFont: profile.brandFont ?? "",
      assetLogoUrls: profile.logoUrl ? [profile.logoUrl] : [],
      attributionModel: "data_driven",
      biddingFocus: "conversions",
      locationMode: "all",
    }

    sessionStorage.setItem(CAMPAIGN_WIZARD_AI_DRAFT_KEY, JSON.stringify(draft))
    saveOnboarding({ completed: true })

    if (mode === "ai") {
      navigate("/agent/campaigns?focus=1")
    } else {
      navigate("/campaigns?create=1")
    }
  }

  function skipForNow() {
    saveOnboarding({ completed: true, firstCampaignSkipped: true })
    navigate("/")
  }

  return (
    <OnboardingShell
      step={5}
      leftTitle="Start your first campaign"
      leftDescription="A campaign is a goal you're working toward. CommerceBase creates the tasks and content inside — posts, emails, articles — and delivers them on schedule."
      leftIllustration={
        <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
          <Sparkles className="h-10 w-10 text-muted-foreground" />
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <button
            type="button"
            onClick={skipForNow}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            I'll do this later — go to dashboard
          </button>
        </>
      }
    >
      <div className="mx-auto w-full max-w-2xl space-y-6 p-8">
        <header>
          <h2 className="text-2xl font-semibold">What's your goal?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecting a goal will help set up the rest of your campaign — we'll seed the wizard
            with what we already know about your brand.
          </p>
        </header>

        <div className="space-y-3">
          {GOAL_OPTIONS.map((opt) => (
            <GoalFunnelCard
              key={opt.value}
              option={opt}
              selected={false}
              onClick={() => pickGoal(opt)}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can create more campaigns from the dashboard at any time.
        </p>
      </div>
    </OnboardingShell>
  )
}
