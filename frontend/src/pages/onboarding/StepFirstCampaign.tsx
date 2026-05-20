import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle2, Rocket, Sparkles } from "lucide-react"
// ArrowLeft is used by the goal-phase Back button below.
import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/OnboardingShell"
import {
  GoalFunnelCard,
  GOAL_OPTIONS,
  type GoalOption,
} from "@/components/campaigns/wizard/GoalFunnelCard"
import { getCompanyProfile } from "@/lib/company-profile"
import { saveOnboarding } from "@/lib/onboarding-storage"
import {
  initialCampaignWizardForm,
  type CampaignWizardFormData,
} from "@/types/campaign-wizard"
import { currencyForCountry } from "@/lib/mock-data"
import { CampaignCreateV2 } from "@/pages/campaigns/CampaignCreateV2"

interface Props {
  /** Unused since the post-onboarding screen no longer surfaces a Back button,
   * but kept on the Props type to match the orchestrator's contract. */
  onBack?: () => void
}

type Phase = "intro" | "goal" | "wizard"

export function StepFirstCampaign(_props: Props = {}) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("intro")
  const [seededForm, setSeededForm] = useState<CampaignWizardFormData | null>(null)

  function pickGoal(goal: GoalOption) {
    const profile = getCompanyProfile()
    const draft: CampaignWizardFormData = {
      ...initialCampaignWizardForm,
      objective: goal.value,
      campaignType: "performance_max",
      name: `${profile.companyName ?? "Campaign"} — ${goal.label}`,
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
    setSeededForm(draft)
    setPhase("wizard")
  }

  function handleWizardClose() {
    saveOnboarding({ completed: true })
    navigate("/campaigns")
  }

  // ---------------------------------------------------------------------------
  // Phase 3 — Campaign wizard, full-screen with only the wizard's own stepper.
  // (No onboarding chrome — the previous transition screen sets the context.)
  // ---------------------------------------------------------------------------
  if (phase === "wizard" && seededForm) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <CampaignCreateV2
          embedded
          initialFormOverride={seededForm}
          onClose={handleWizardClose}
          saveAndCloseLabel="Save draft & finish"
          launchLabel="Launch & finish"
        />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Phase 2 — Goal picker. Uses the onboarding shell (without the 4-step
  // stepper) so the user keeps the visual context as they pick a goal.
  // ---------------------------------------------------------------------------
  if (phase === "goal") {
    return (
      <OnboardingShell
        step={5}
        hideStepper
        leftTitle="Pick a campaign goal"
        leftDescription="A campaign is a goal you're working toward. CommerceBase creates the tasks and content inside — posts, emails, articles — and delivers them on schedule."
        leftIllustration={
          <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPhase("intro")} className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <span className="text-xs text-muted-foreground">
              Pick a goal to continue — you can save & leave from the next screen.
            </span>
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
        </div>
      </OnboardingShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Phase 1 — Onboarding-complete transition. Celebrates the milestone and
  // sets expectations that the campaign-creation flow is next.
  // ---------------------------------------------------------------------------
  return (
    <OnboardingShell
      step={5}
      hideStepper
      leftTitle="You're all set"
      leftDescription="Your CommerceBase workspace is configured. The next step is creating your first campaign — every brand on CommerceBase starts with one so we can show you the platform in motion."
      leftIllustration={
        <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
          <Rocket className="h-10 w-10 text-muted-foreground" />
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Onboarding complete</h2>
          <p className="text-sm text-muted-foreground">
            We've saved your brand memories, business profile, connected tools, and billing
            details. Now let's get your first campaign live — it only takes a few minutes.
          </p>
        </div>
        <ul className="w-full space-y-2 rounded-xl border bg-card p-4 text-left text-sm">
          {[
            "Brand memories — company overview, ideal customer, messaging",
            "Business profile — country, currency, sector",
            "Tools — store + messaging connectors",
            "Billing — company address and payment method",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button size="lg" onClick={() => setPhase("goal")} className="gap-1.5">
          Create my first campaign
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground">
          You can save the campaign as a draft and come back to it from the dashboard at any
          time.
        </p>
      </div>
    </OnboardingShell>
  )
}
