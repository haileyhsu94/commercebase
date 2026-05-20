import { useState } from "react"
import { ArrowRight, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BrandMemoriesPanel } from "@/components/onboarding/BrandMemoriesPanel"
import { OnboardingShell } from "@/components/onboarding/OnboardingShell"
import {
  getCompanyProfile,
  patchCompanyProfile,
  type BrandMemories,
} from "@/lib/company-profile"
import { saveOnboarding } from "@/lib/onboarding-storage"
import { cn } from "@/lib/utils"

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1,000", "1,000+"] as const

const ROLES = [
  "Founder / CEO",
  "CMO",
  "VP of Marketing",
  "Director of Marketing",
  "Head of Growth",
  "Marketing Manager",
  "Content Manager",
  "Social Media Manager",
  "GTM Engineer",
  "Other",
] as const

interface Props {
  onContinue: () => void
}

export function StepBrandDiscovery({ onContinue }: Props) {
  const profile = getCompanyProfile()
  const [businessName, setBusinessName] = useState(profile.companyName ?? "")
  const [websiteUrl, setWebsiteUrl] = useState(profile.website ?? "")
  // Defer streaming until URL leaves the input (blur) so we don't re-stream
  // every keystroke.
  const [streamUrl, setStreamUrl] = useState(profile.brandMemories ? profile.website ?? "" : "")
  const [companySize, setCompanySize] = useState(profile.companySize ?? "")
  const [role, setRole] = useState(profile.role ?? "")
  const [memoriesReady, setMemoriesReady] = useState(!!profile.brandMemories)

  function handleMemoriesComplete(m: BrandMemories) {
    patchCompanyProfile({
      companyName: businessName,
      website: websiteUrl,
      brandMemories: m,
    })
    setMemoriesReady(true)
  }

  function continueClicked() {
    patchCompanyProfile({
      companyName: businessName,
      website: websiteUrl,
      companySize,
      role,
    })
    saveOnboarding({ step: 2 })
    onContinue()
  }

  const writingInProgress = !!streamUrl && !memoriesReady

  return (
    <OnboardingShell
      step={1}
      leftTitle="Tell us about your business"
      leftDescription="Your website is the first thing our AI reads to understand your brand. We'll synthesize a company overview, an ideal customer profile, and your positioning so every future campaign starts from the same memory."
      leftIllustration={
        <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={continueClicked}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Skip ahead and we'll finish drafting in the background
          </button>
          <Button
            type="button"
            onClick={continueClicked}
            disabled={writingInProgress}
            className="gap-1.5"
          >
            {writingInProgress ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Drafting your brand memories…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* Form */}
        <div className="mx-auto w-full max-w-md space-y-5 p-8">
          <header>
            <h2 className="text-2xl font-semibold">Tell us about your business</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your website is the first thing our AI reads to understand your brand.
            </p>
          </header>

          <Field label="Business name">
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Realry"
            />
          </Field>

          <Field label="Website URL" required>
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              onBlur={() => setStreamUrl(websiteUrl)}
              type="url"
              placeholder="https://www.yourbrand.com"
            />
          </Field>

          <Field label="Company size">
            <div className="flex flex-wrap gap-1.5">
              {COMPANY_SIZES.map((s) => (
                <Chip key={s} active={companySize === s} onClick={() => setCompanySize(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Your role">
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <Chip key={r} active={role === r} onClick={() => setRole(r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </Field>

          {memoriesReady && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Brand memories ready
            </div>
          )}
        </div>

        {/* Live brand-memories panel */}
        <div className="hidden lg:flex">
          <BrandMemoriesPanel websiteUrl={streamUrl} onComplete={handleMemoriesComplete} />
        </div>
      </div>
    </OnboardingShell>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">
        {label} {required && <span className="text-muted-foreground">(required)</span>}
      </label>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
