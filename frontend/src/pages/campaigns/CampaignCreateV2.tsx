import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Package,
  Rocket,
  Sparkles,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  initialCampaignWizardForm,
  type CampaignWizardFormData,
  CURRENCY_OPTIONS,
  ATTRIBUTION_OPTIONS,
  BIDDING_FOCUS_OPTIONS,
  LOCATION_PRESENCE_OPTIONS,
} from "@/types/campaign-wizard"
import {
  addLaunchedCampaign,
  getMergedCampaigns,
  getUserCampaigns,
  isDraftworthy,
  makeNewCampaignRow,
  saveDraftCampaign,
  updateCampaignDraft,
  wizardFormFromCampaign,
} from "@/lib/campaign-storage"
import {
  currencyForCountry,
  defaultCompanyProfile,
} from "@/lib/mock-data"

import {
  GoalFunnelCard,
  GOAL_OPTIONS,
} from "@/components/campaigns/wizard/GoalFunnelCard"
import { DateRangePicker } from "@/components/campaigns/wizard/DateRangePicker"
import {
  BudgetWithRatesFields,
  type BudgetState,
} from "@/components/campaigns/wizard/BudgetWithRatesFields"
import { EstimatedPerformancePanel } from "@/components/campaigns/wizard/EstimatedPerformancePanel"
import { CountryMultiSelect } from "@/components/campaigns/wizard/CountryMultiSelect"
import { CityMultiSelect } from "@/components/campaigns/wizard/CityMultiSelect"
import { LanguageMultiSelect } from "@/components/campaigns/wizard/LanguageMultiSelect"
import { AssetUrlList } from "@/components/campaigns/wizard/AssetUrlList"
import { AdGalleryByFormat } from "@/components/campaigns/wizard/AdGalleryByFormat"
import { CatalogAdGallery } from "@/components/campaigns/wizard/CatalogAdGallery"
import { GenerateWithAIPanel } from "@/components/campaigns/wizard/GenerateWithAIPanel"
import { AdPreview } from "@/components/campaigns/AdPreview"
import { CampaignPlanAllowanceBanner } from "@/components/campaigns/CampaignPlanAllowanceBanner"

export type CampaignCreateV2Props = {
  embedded?: boolean
  onClose?: () => void
  duplicateSourceId?: string | null
  /** Pre-seed the wizard form (e.g. from onboarding handoff). */
  initialFormOverride?: Partial<CampaignWizardFormData>
  /** Override the Save & close button label on Step 1. */
  saveAndCloseLabel?: string
  /** Override the Launch button label on Step 5. */
  launchLabel?: string
}

const AGE_BAND_OPTIONS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const

const STEPS = [
  { id: 1, title: "Goal" },
  { id: 2, title: "Schedule & budget" },
  { id: 3, title: "Audience" },
  { id: 4, title: "Creative" },
  { id: 5, title: "Review & launch" },
] as const

export function CampaignCreateV2({
  embedded = false,
  onClose,
  duplicateSourceId = null,
  initialFormOverride,
  saveAndCloseLabel = "Save & close",
  launchLabel = "Launch campaign",
}: CampaignCreateV2Props = {}) {
  // True when opened by resuming a saved draft (vs. a fresh start or a true
  // duplicate of an active campaign). Resuming jumps straight to Review & launch
  // so the user sees everything they've filled and can edit any section via the
  // step rail — easier than re-walking the wizard linearly.
  const isDraftResume = !!(
    duplicateSourceId &&
    getUserCampaigns().find((c) => c.id === duplicateSourceId && c.status === "draft")
  )
  const lastStep = STEPS[STEPS.length - 1].id

  const [step, setStep] = useState(isDraftResume ? lastStep : 1)
  const [maxVisited, setMaxVisited] = useState(isDraftResume ? lastStep : 1)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<CampaignWizardFormData>(() => ({
    ...buildInitialForm(duplicateSourceId),
    ...(initialFormOverride ?? {}),
  }))
  /** If this wizard was opened by resuming a draft, track that draft's id so
   * we can update it in place on save (instead of creating a new draft). */
  const resumingDraftId = useRef<string | null>(isDraftResume ? duplicateSourceId : null)
  /** Mirror the latest formData in a ref so the unmount cleanup can read it. */
  const formDataRef = useRef(formData)
  /** Set true on a deliberate launch — prevents unmount from also saving a draft. */
  const launchedRef = useRef(false)
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])
  // Save-as-draft on unmount (covers the dialog X / ESC paths that bypass our
  // own Save & close button). Skipped if the wizard launched normally.
  useEffect(() => {
    return () => {
      if (launchedRef.current) return
      const latest = formDataRef.current
      if (!isDraftworthy(latest)) return
      if (resumingDraftId.current) {
        updateCampaignDraft(resumingDraftId.current, { ...latest })
      } else {
        saveDraftCampaign({ ...latest })
      }
    }
  }, [])

  function update<K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K],
  ) {
    setFormData((f) => ({ ...f, [key]: value }))
  }
  function patch(p: Partial<CampaignWizardFormData>) {
    setFormData((f) => ({ ...f, ...p }))
  }

  function toggleArrayValue(field: keyof CampaignWizardFormData, value: string) {
    const current = (formData[field] as unknown as string[] | undefined) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    update(field, next as never)
  }

  const currency =
    CURRENCY_OPTIONS.find((c) => c.value === formData.currency) ?? CURRENCY_OPTIONS[1]
  const currencySymbol = currency.symbol

  function goToStep(next: number) {
    setError("")
    setStep(next)
    setMaxVisited((m) => Math.max(m, next))
  }

  function next() {
    const err = validateStep(step, formData)
    if (err) {
      setError(err)
      return
    }
    if (step >= STEPS.length) return
    goToStep(step + 1)
  }
  function prev() {
    if (step <= 1) return
    goToStep(step - 1)
  }

  function launch() {
    const err = validateStep(2, formData)
    if (err) {
      setError(err)
      setStep(2)
      return
    }
    addLaunchedCampaign(
      makeNewCampaignRow(
        formData.name.trim() || "Untitled campaign",
        currencySymbol,
        { ...formData },
      ),
    )
    launchedRef.current = true
    onClose?.()
  }

  /** Save in-progress form as draft and close. Used when the user clicks Save & close. */
  function saveAndClose() {
    launchedRef.current = true  // suppress the unmount cleanup (we handle here)
    if (!isDraftworthy(formData)) {
      onClose?.()
      return
    }
    if (resumingDraftId.current) {
      updateCampaignDraft(resumingDraftId.current, { ...formData })
    } else {
      const draft = saveDraftCampaign({ ...formData })
      resumingDraftId.current = draft.id
    }
    onClose?.()
  }

  // Stepper
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col",
        embedded ? "pt-0" : "pt-4",
      )}
    >
      <Stepper step={step} maxVisited={maxVisited} onJump={goToStep} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {step === 1 && <StepGoal formData={formData} update={update} />}
          {step === 2 && (
            <StepScheduleBudget
              formData={formData}
              patch={patch}
              currencySymbol={currencySymbol}
            />
          )}
          {step === 3 && (
            <StepAudience
              formData={formData}
              update={update}
              patch={patch}
              toggleArrayValue={toggleArrayValue}
            />
          )}
          {step === 4 && (
            <StepCreative
              formData={formData}
              update={update}
              patch={patch}
            />
          )}
          {step === 5 && (
            <StepReview
              formData={formData}
              currencySymbol={currencySymbol}
              jumpTo={goToStep}
            />
          )}
          {error && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {step < 5 ? (
          <EstimatedPerformancePanel
            budget={formData.budget}
            budgetType={formData.budgetType}
            objective={formData.objective}
            currencySymbol={currencySymbol}
          />
        ) : (
          <CreativePreviewRail formData={formData} />
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-background px-6 py-3">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={prev} className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            onClose && (
              <Button variant="ghost" size="sm" onClick={saveAndClose}>
                {saveAndCloseLabel}
              </Button>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          {step < STEPS.length ? (
            <Button size="sm" onClick={next} className="gap-1.5">
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={launch} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Rocket className="h-3.5 w-3.5" />
              {launchLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stepper                                                                    */
/* -------------------------------------------------------------------------- */

function Stepper({
  step,
  maxVisited,
  onJump,
}: {
  step: number
  maxVisited: number
  onJump: (n: number) => void
}) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-3 border-b bg-background px-6 py-3 text-sm">
      {STEPS.map((s, i) => {
        const done = step > s.id
        const active = step === s.id
        const canJump = s.id <= maxVisited
        return (
          <div key={s.id} className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && onJump(s.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-2 py-1 transition-colors",
                canJump && !active && "hover:bg-accent",
                active && "text-foreground",
                !active && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded border text-[11px] font-medium",
                  active && "border-foreground bg-foreground text-background",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  !active && !done && "border-input",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : s.id}
              </span>
              <span className={cn("text-sm", active && "font-medium")}>{s.title}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Goal                                                              */
/* -------------------------------------------------------------------------- */

function StepGoal({
  formData,
  update,
}: {
  formData: CampaignWizardFormData
  update: <K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K],
  ) => void
}) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">What's your goal?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecting a goal will help set up the rest of your campaign.
        </p>
      </header>
      <div className="space-y-3">
        {GOAL_OPTIONS.map((opt) => (
          <GoalFunnelCard
            key={opt.value}
            option={opt}
            selected={formData.objective === opt.value}
            onClick={() => update("objective", opt.value)}
          />
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Schedule & budget                                                 */
/* -------------------------------------------------------------------------- */

function StepScheduleBudget({
  formData,
  patch,
  currencySymbol,
}: {
  formData: CampaignWizardFormData
  patch: (p: Partial<CampaignWizardFormData>) => void
  currencySymbol: string
}) {
  const budgetState: BudgetState = {
    currency: formData.currency,
    budgetType: formData.budgetType,
    budget: formData.budget,
    maxCpc: formData.maxCpc,
    maxCps: formData.maxCps,
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Schedule & budget</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set when the campaign runs and how much you're willing to spend.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <FormRow label="Campaign name">
          <Input
            value={formData.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="e.g. SS26 Launch — Drive Sales"
            className="h-9 text-sm"
          />
        </FormRow>
        <FormRow label="Date range">
          <DateRangePicker
            start={formData.startDate}
            end={formData.endDate}
            onChange={(r) => patch({ startDate: r.start, endDate: r.end })}
          />
        </FormRow>
      </div>

      <BudgetWithRatesFields
        value={budgetState}
        onChange={(p) => patch(p)}
      />

      <details className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-sm font-medium">
          Advanced — bidding & attribution
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="space-y-3 border-t p-4 text-sm">
          <FormRow label="Bidding focus">
            <Select
              value={formData.biddingFocus}
              onValueChange={(v) => patch({ biddingFocus: v ?? "" })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick a bidding focus" />
              </SelectTrigger>
              <SelectContent>
                {BIDDING_FOCUS_OPTIONS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Target CPA">
            <Input
              value={formData.biddingTargetCpa}
              onChange={(e) => patch({ biddingTargetCpa: e.target.value })}
              placeholder={`${currencySymbol}20`}
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Target ROAS">
            <Input
              value={formData.biddingTargetRoas}
              onChange={(e) => patch({ biddingTargetRoas: e.target.value })}
              placeholder="400%"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Attribution model">
            <Select
              value={formData.attributionModel}
              onValueChange={(v) => patch({ attributionModel: v ?? "" })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick a model" />
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTION_OPTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="New-customer acquisition">
            <Select
              value={formData.newCustomerAcquisition}
              onValueChange={(v) => patch({ newCustomerAcquisition: v ?? "off" })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="value">Bid higher for new customers</SelectItem>
                <SelectItem value="only">Only new customers</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
        </div>
      </details>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Audience                                                          */
/* -------------------------------------------------------------------------- */

function StepAudience({
  formData,
  update,
  patch,
  toggleArrayValue,
}: {
  formData: CampaignWizardFormData
  update: <K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K],
  ) => void
  patch: (p: Partial<CampaignWizardFormData>) => void
  toggleArrayValue: (field: keyof CampaignWizardFormData, value: string) => void
}) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Audience</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us who this campaign is for. We'll handle the rest.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <FormRow label="Countries">
          <CountryMultiSelect
            value={formData.regions}
            onChange={(next) => update("regions", next)}
          />
        </FormRow>
        <FormRow label="Cities">
          <CityMultiSelect
            value={formData.cities}
            onChange={(next) => update("cities", next)}
          />
        </FormRow>
        <FormRow label="Languages">
          <LanguageMultiSelect
            value={formData.languages}
            onChange={(next) => update("languages", next)}
          />
        </FormRow>
        <FormRow label="Age bands">
          <div className="flex flex-wrap gap-1.5">
            {AGE_BAND_OPTIONS.map((a) => {
              const active = formData.ageBands.includes(a)
              return (
                <Chip
                  key={a}
                  active={active}
                  onClick={() => toggleArrayValue("ageBands", a)}
                >
                  {a}
                </Chip>
              )
            })}
          </div>
        </FormRow>
      </div>

      <details className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-sm font-medium">
          Advanced — audience signals & targeting
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="space-y-3 border-t p-4 text-sm">
          <FormRow label="Location presence">
            <Select
              value={formData.locationPresence}
              onValueChange={(v) => patch({ locationPresence: v ?? "" })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick a presence mode" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_PRESENCE_OPTIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Audience signal name">
            <Input
              value={formData.audienceSignalName}
              onChange={(e) => patch({ audienceSignalName: e.target.value })}
              placeholder="e.g. Spring intent shoppers"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Custom segments">
            <Input
              value={formData.audienceCustomSegments}
              onChange={(e) => patch({ audienceCustomSegments: e.target.value })}
              placeholder="Comma-separated keywords / URLs / apps"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Demographic exclusions">
            <Input
              value={formData.demographicExclusions}
              onChange={(e) => patch({ demographicExclusions: e.target.value })}
              placeholder="e.g. exclude under 18"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="EU political ads">
            <Select
              value={formData.euPoliticalAds}
              onValueChange={(v) => patch({ euPoliticalAds: (v ?? "") as CampaignWizardFormData["euPoliticalAds"] })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Not applicable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not applicable</SelectItem>
                <SelectItem value="no">Does not contain political ads</SelectItem>
                <SelectItem value="yes">Contains political ads</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
        </div>
      </details>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 4 — Creative                                                          */
/* -------------------------------------------------------------------------- */

type CreativeRoute = "catalog" | "upload" | "existing" | "ai"

function StepCreative({
  formData,
  update,
  patch,
}: {
  formData: CampaignWizardFormData
  update: <K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K],
  ) => void
  patch: (p: Partial<CampaignWizardFormData>) => void
}) {
  const [route, setRoute] = useState<CreativeRoute>("catalog")
  // Track the URLs the AI panel most recently contributed, so we can swap
  // them in/out of assetImageUrls without disturbing manually-uploaded ones.
  const [aiContributedUrls, setAiContributedUrls] = useState<string[]>([])

  function handleAiSelectionChange(nextUrls: string[]) {
    // Remove the previous AI contribution, then add the new selection.
    const kept = formData.assetImageUrls.filter(
      (u) => !aiContributedUrls.includes(u),
    )
    update("assetImageUrls", [...kept, ...nextUrls])
    setAiContributedUrls(nextUrls)
  }

  // "Choose from existing ads" — only show if there are prior campaigns with assets.
  const existingAdsAvailable = useMemo(
    () =>
      getMergedCampaigns().some(
        (c) =>
          (c.wizardSnapshot?.assetImageUrls?.length ?? 0) > 0 ||
          !!c.wizardSnapshot?.imageUrl,
      ),
    [],
  )

  const assetsProgress = [
    { key: "logo", label: "Logo", filled: formData.assetLogoUrls.length, total: 1 },
    { key: "images", label: "Images", filled: formData.assetImageUrls.length, total: 3 },
    { key: "videos", label: "Videos", filled: formData.assetVideoUrls.length, total: 1 },
    {
      key: "text",
      label: "Text",
      filled:
        (formData.headline ? 1 : 0) +
        (formData.adDescription ? 1 : 0) +
        (formData.businessName ? 1 : 0),
      total: 3,
    },
    {
      key: "destination",
      label: "Destination URL",
      filled: formData.finalUrl ? 1 : 0,
      total: 1,
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      {/* Left rail: assets progress */}
      <aside className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Assets
        </div>
        <ul className="space-y-1.5 text-sm">
          {assetsProgress.map((a) => (
            <li
              key={a.key}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/40"
            >
              <span
                className={cn(
                  a.filled >= a.total
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {a.label}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {a.filled}/{a.total}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <div className="space-y-6">
        <header>
          <h2 className="text-xl font-semibold">Creative</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add images, text, and a destination URL. We'll automatically render the right format
            for each placement.
          </p>
        </header>

        {/* Source picker — vertical stack. Catalog is the no-effort option
            and sits at the top so it gets noticed first. */}
        <div className="grid grid-cols-1 gap-3">
          <SourceCard
            active={route === "catalog"}
            icon={Package}
            title="Use product catalog"
            description="Skip image upload entirely — we'll auto-build creative from your synced product catalog (titles, images, prices)."
            onClick={() => setRoute("catalog")}
          />
          <SourceCard
            active={route === "upload"}
            icon={Upload}
            title="Upload images"
            description="Drop image and video files; we'll render the right format per placement."
            onClick={() => setRoute("upload")}
          />
          {existingAdsAvailable && (
            <SourceCard
              active={route === "existing"}
              icon={ImageIcon}
              title="Choose from existing ads"
              description="Use creative from an ad you've already designed."
              onClick={() => setRoute("existing")}
            />
          )}
          <SourceCard
            active={route === "ai"}
            icon={Sparkles}
            title="Generate with AI"
            description="No image? We'll generate qualitative assets that match your brand."
            onClick={() => {
              setRoute("ai")
              patch({ assetGenerationEnabled: true })
            }}
          />
        </div>

        {/* Source body */}
        {route === "catalog" && (
          <div className="space-y-2 rounded-lg border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Synced product catalog
            </div>
            <p className="text-muted-foreground">
              We'll automatically pull product images, titles, and prices from your synced
              catalog and render the right format per placement. No upload needed.
            </p>
            <ul className="ml-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              <li>Products refresh whenever your catalog re-syncs.</li>
              <li>Out-of-stock items are filtered out automatically.</li>
              <li>You can still add a logo and headline below to brand the ad.</li>
            </ul>
          </div>
        )}
        {route === "upload" && (
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <AssetUrlList
              label="Logo"
              values={formData.assetLogoUrls}
              onChange={(next) => update("assetLogoUrls", next)}
              max={1}
              kind="image"
              placeholder="https://yourbrand.com/logo.svg"
              hint="Detected from your website — replace it if you want to use a different version."
            />
            <AssetUrlList
              label="Images"
              values={formData.assetImageUrls}
              onChange={(next) => update("assetImageUrls", next)}
              max={5}
              kind="image"
              placeholder="https://yourbrand.com/hero.jpg"
            />
            <AssetUrlList
              label="Videos"
              values={formData.assetVideoUrls}
              onChange={(next) => update("assetVideoUrls", next)}
              max={3}
              kind="video"
              placeholder="https://yourbrand.com/promo.mp4"
            />
          </div>
        )}
        {route === "existing" && (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            We'll show your existing creatives here. Hooked up when the prior campaigns table has
            assets attached.
          </div>
        )}
        {route === "ai" && (
          <GenerateWithAIPanel
            formData={formData}
            patch={patch}
            onSelectionChange={handleAiSelectionChange}
          />
        )}

        {/* Text inputs that drive the AdPreview gallery — vertical stack.
            Hidden when the catalog source is selected: each ad's headline,
            description, and destination URL come from the product itself. */}
        {route === "catalog" ? (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            <p>
              Headline, description, and destination URL are pulled from each product in your
              catalog automatically — no need to fill them in here. You can still tweak brand
              colors and tracking under <span className="font-medium">Advanced</span> below.
            </p>
          </div>
        ) : (
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <FormRow label="Headline">
            <Input
              value={formData.headline}
              onChange={(e) => patch({ headline: e.target.value })}
              placeholder="Primary headline"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Final URL">
            <Input
              type="url"
              value={formData.finalUrl}
              onChange={(e) => patch({ finalUrl: e.target.value })}
              placeholder={defaultCompanyProfile.website}
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Secondary headline">
            <Input
              value={formData.headlineSecondary}
              onChange={(e) => patch({ headlineSecondary: e.target.value })}
              placeholder="Optional second line"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Description">
            <Input
              value={formData.adDescription}
              onChange={(e) => patch({ adDescription: e.target.value })}
              placeholder="What the ad says"
              className="h-8 text-sm"
            />
          </FormRow>
          <FormRow label="Business name">
            <Input
              value={formData.businessName}
              onChange={(e) => patch({ businessName: e.target.value })}
              placeholder={defaultCompanyProfile.companyName}
              className="h-8 text-sm"
            />
          </FormRow>
        </div>
        )}

        {/* Format-based gallery (catalog mode uses product samples instead) */}
        {route === "catalog" ? (
          <CatalogAdGallery
            domainLabel={
              formData.finalUrl ? new URL(safeUrl(formData.finalUrl)).hostname : undefined
            }
          />
        ) : (
          <AdGalleryByFormat
            headline={formData.headline || formData.headlinePrimary}
            headlineSecondary={formData.headlineSecondary}
            description={formData.adDescription || formData.description}
            imageUrl={formData.assetImageUrls[0] ?? formData.imageUrl}
            videoUrl={formData.assetVideoUrls[0]}
            domainLabel={
              formData.finalUrl ? new URL(safeUrl(formData.finalUrl)).hostname : undefined
            }
            hideVideo={route === "ai"}
          />
        )}

        <details className="group rounded-lg border bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-sm font-medium">
            Advanced — search themes & tracking
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
          </summary>
          <div className="space-y-4 border-t p-4 text-sm">
            <FormRow label="Search themes">
              <Input
                value={formData.searchThemes}
                onChange={(e) => patch({ searchThemes: e.target.value })}
                placeholder="e.g. spring dresses, linen shirts, summer sandals"
                className="h-8 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Comma-separated keywords/topics that tell the AI what queries this campaign
                should show up for. Used as a hint when our matcher can't infer intent from your
                creative alone.
              </p>
            </FormRow>
            <FormRow label="UTM prefix">
              <Input
                value={formData.utmPrefix}
                onChange={(e) => patch({ utmPrefix: e.target.value })}
                placeholder="ss26_launch_"
                className="h-8 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Prepended to <code>utm_campaign</code> on every outbound click so you can
                identify this campaign's traffic in Google Analytics, Shopify, etc.
              </p>
            </FormRow>
            <FormRow label="Tracking template">
              <Input
                value={formData.trackingTemplate}
                onChange={(e) => patch({ trackingTemplate: e.target.value })}
                placeholder="{lpurl}?utm_source={network}&utm_medium=cpc"
                className="h-8 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Advanced URL template that wraps every click. <code>{`{lpurl}`}</code> expands
                to your Final URL, and tokens like <code>{`{network}`}</code> /{" "}
                <code>{`{device}`}</code> are filled in at click time. Leave blank unless you
                need custom server-side tracking.
              </p>
            </FormRow>
          </div>
        </details>
      </div>
    </section>
  )
}

function SourceCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof Upload
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all",
        active
          ? "border-foreground shadow-sm ring-2 ring-foreground/10"
          : "border-border hover:border-foreground/30 hover:bg-accent/30",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground/10">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 5 — Review                                                            */
/* -------------------------------------------------------------------------- */

function StepReview({
  formData,
  currencySymbol,
  jumpTo,
}: {
  formData: CampaignWizardFormData
  currencySymbol: string
  jumpTo: (n: number) => void
}) {
  const goalLabel =
    GOAL_OPTIONS.find((g) => g.value === formData.objective)?.label ?? "—"

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Review & launch</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm everything looks right. You can edit after launch too.
        </p>
      </header>

      <CampaignPlanAllowanceBanner variant="embedded" />

      <ReviewCard title="Goal" onEdit={() => jumpTo(1)}>
        <div className="text-sm">{goalLabel}</div>
      </ReviewCard>

      <ReviewCard title="Schedule & budget" onEdit={() => jumpTo(2)}>
        <KeyValueGrid
          pairs={[
            ["Name", formData.name || "—"],
            [
              "Date range",
              formData.startDate && formData.endDate
                ? `${formData.startDate} → ${formData.endDate}`
                : "—",
            ],
            ["Currency", formData.currency || "—"],
            ["Budget type", formData.budgetType],
            ["Budget", formData.budget ? `${currencySymbol}${formData.budget}` : "—"],
            ["Max CPC", formData.maxCpc ? `${currencySymbol}${formData.maxCpc}` : "—"],
            ["Target CPS", formData.maxCps ? `${currencySymbol}${formData.maxCps}` : "—"],
          ]}
        />
      </ReviewCard>

      <ReviewCard title="Audience" onEdit={() => jumpTo(3)}>
        <KeyValueGrid
          pairs={[
            ["Countries", formData.regions.join(", ") || "—"],
            ["Cities", formData.cities.join(", ") || "—"],
            ["Languages", formData.languages.join(", ") || "—"],
            ["Age bands", formData.ageBands.join(", ") || "—"],
          ]}
        />
      </ReviewCard>

      <ReviewCard title="Creative" onEdit={() => jumpTo(4)}>
        <KeyValueGrid
          pairs={[
            ["Headline", formData.headline || "—"],
            ["Description", formData.adDescription || "—"],
            ["Business name", formData.businessName || defaultCompanyProfile.companyName],
            ["Logo", formData.assetLogoUrls[0] || "—"],
            ["Images", String(formData.assetImageUrls.length)],
            ["Videos", String(formData.assetVideoUrls.length)],
            ["Final URL", formData.finalUrl || "—"],
            ["AI generation", formData.assetGenerationEnabled ? "On" : "Off"],
          ]}
        />
      </ReviewCard>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
        Campaigns enter a short learning period after launch while we discover the best
        placements and reallocate spend toward what works.
      </div>
    </section>
  )
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      {children}
    </div>
  )
}

function KeyValueGrid({ pairs }: { pairs: [string, string][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm md:grid-cols-2">
      {pairs.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-2 border-b py-1 last:border-b-0">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="truncate text-right" title={v}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 5 right rail — creative preview                                        */
/* -------------------------------------------------------------------------- */

function CreativePreviewRail({ formData }: { formData: CampaignWizardFormData }) {
  const headline = formData.headline || formData.headlinePrimary
  const description = formData.adDescription || formData.description
  const imageUrl = formData.assetImageUrls[0] ?? formData.imageUrl
  const domainLabel = formData.finalUrl
    ? new URL(safeUrl(formData.finalUrl)).hostname
    : undefined

  const formats: { aspect: string; label: string }[] = [
    { aspect: "1.91:1", label: "Landscape" },
    { aspect: "1:1", label: "Square" },
    { aspect: "9:16", label: "Vertical" },
  ]

  return (
    <aside className="sticky top-4 space-y-3 self-start">
      <h3 className="text-sm font-semibold">Creative preview</h3>
      <div className="space-y-3">
        {formats.map((f) => (
          <div key={f.aspect} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{f.label}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 uppercase tracking-wide">
                {f.aspect}
              </span>
            </div>
            <AdPreview
              headline={headline}
              headlineSecondary={formData.headlineSecondary}
              description={description}
              imageUrl={imageUrl}
              aspectRatioValue={f.aspect}
              domainLabel={domainLabel}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function FormRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[140px_minmax(0,1fr)]">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="min-w-0">{children}</div>
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

function buildInitialForm(duplicateSourceId: string | null): CampaignWizardFormData {
  const profile = defaultCompanyProfile
  const defaultCurrency =
    profile.currency || currencyForCountry(profile.country || "")
  const today = new Date()
  const end = new Date(today.getTime() + 30 * 86400000)
  const toIso = (d: Date) => d.toISOString().slice(0, 10)

  const base: CampaignWizardFormData = {
    ...initialCampaignWizardForm,
    campaignType: "performance_max",
    locationPresence: "presence_interest",
    languages: profile.language ? [profile.language] : ["en"],
    regions: profile.country ? [profile.country] : [],
    currency: defaultCurrency,
    budgetType: "daily",
    startDate: toIso(today),
    endDate: toIso(end),
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

  if (duplicateSourceId) {
    const source = getMergedCampaigns().find((c) => c.id === duplicateSourceId)
    if (source) {
      return { ...base, ...wizardFormFromCampaign(source) }
    }
  }

  return base
}

function validateStep(step: number, f: CampaignWizardFormData): string {
  if (step === 1) {
    if (!f.objective) return "Please pick a goal to continue."
  }
  if (step === 2) {
    if (!f.name.trim()) return "Give your campaign a name."
    if (!f.startDate || !f.endDate) return "Pick a date range."
    if (!f.budget.trim()) return "Set a budget amount."
  }
  if (step === 3) {
    if (f.regions.length === 0) return "Pick at least one country."
  }
  return ""
}

function safeUrl(u: string): string {
  try {
    return new URL(u).toString()
  } catch {
    return "https://yourbrand.com"
  }
}

/* Re-export commonly used hooks/types so other modules don't break if they
 * pull from this file (Aeris pre-fill handoff still uses sessionStorage). */
export type { CampaignWizardFormData }

// Suppress unused-import warning for the AI draft hook spot (left for the
// follow-up wiring step, see plan).
void useEffect
