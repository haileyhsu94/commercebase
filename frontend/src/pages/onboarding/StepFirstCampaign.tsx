import { useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, Rocket, Sparkles, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/OnboardingShell"
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
import { cn } from "@/lib/utils"

type GoalKey = "launch" | "grow" | "nurture" | "thought-leadership"

interface GoalOption {
  key: GoalKey
  label: string
  description: string
  icon: typeof Rocket
  objective: "sales" | "leads" | "awareness_consideration"
}

const GOALS: GoalOption[] = [
  {
    key: "launch",
    label: "Launch a Product",
    description: "Make a splash with your next launch.",
    icon: Rocket,
    objective: "sales",
  },
  {
    key: "grow",
    label: "Grow Your Audience",
    description: "Expand your reach and build a following.",
    icon: TrendingUp,
    objective: "awareness_consideration",
  },
  {
    key: "nurture",
    label: "Nurture Your Leads",
    description: "Turn warm prospects into happy customers.",
    icon: Heart,
    objective: "leads",
  },
  {
    key: "thought-leadership",
    label: "Thought Leadership",
    description: "Establish your team as voices worth following.",
    icon: Target,
    objective: "awareness_consideration",
  },
]

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
      objective: goal.objective,
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
      <div className="mx-auto w-full max-w-3xl space-y-6 p-8">
        <header>
          <h2 className="text-2xl font-semibold">Start your first campaign</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a goal — we'll seed the campaign wizard with what we already know about your brand.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {GOALS.map((g) => {
            const Icon = g.icon
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => pickGoal(g)}
                className={cn(
                  "flex h-full flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all",
                  "hover:border-foreground/30 hover:bg-accent/30",
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-foreground/10">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-semibold">{g.label}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can create more campaigns from the dashboard at any time.
        </p>
      </div>
    </OnboardingShell>
  )
}
