import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Globe2,
  Building2,
  Landmark,
  MapPin,
  Megaphone,
  MousePointerClick,
  Rocket,
  RotateCcw,
  Save,
  ShoppingBag,
  ShoppingCart,
  UserPlus,
  Zap,
  Sparkles,
  Upload,
  Copy,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { DatePickerField, parseIsoDateString } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getCompanyProfile, siteHostname } from "@/lib/company-profile"
import {
  addLaunchedCampaign,
  getMergedCampaigns,
  makeNewCampaignRow,
  wizardFormFromCampaign,
} from "@/lib/campaign-storage"
import { CAMPAIGN_WIZARD_AI_DRAFT_KEY } from "@/lib/campaign-ai-copy-mock"
import { AdPreview } from "@/components/campaigns/AdPreview"
import { CampaignPlanAllowanceBanner } from "@/components/campaigns/CampaignPlanAllowanceBanner"
import {
  initialCampaignWizardForm,
  type CampaignWizardFormData,
  CAMPAIGN_OBJECTIVE_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  BID_STRATEGY_OPTIONS,
  BUDGET_TYPE_OPTIONS,
  ATTRIBUTION_OPTIONS,
  CURRENCY_OPTIONS,
  TARGET_MARKET_OPTIONS,
  IMAGE_ASPECT_RATIOS,
} from "@/types/campaign-wizard"

const STEP_COUNT = 3

const steps = [
  { id: 1, title: "Goal & budget", description: "What, where, how much" },
  { id: 2, title: "Ad design", description: "Copy and creative" },
  { id: 3, title: "Review & launch", description: "Confirm and go live" },
] as const

const BUDGET_SLIDER_MIN = 0
const BUDGET_SLIDER_MAX = 50000
const BUDGET_SLIDER_STEP = 100

const TARGET_MARKET_ICONS = {
  uk_ie: Landmark,
  north_america: MapPin,
  eu: Building2,
  apac: Globe,
  global: Globe2,
} as const

const OBJECTIVE_ICONS = {
  sales: ShoppingBag,
  traffic: MousePointerClick,
  awareness: Megaphone,
  newcustomer: UserPlus,
  creator_commerce: Sparkles,
} as const

const CAMPAIGN_TYPE_ICONS = {
  performance: Zap,
  shopping: ShoppingCart,
  remarketing: RotateCcw,
} as const

const textareaClass =
  "flex min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"

function optionLabel<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): string {
  if (!value) return "—"
  return options.find((o) => o.value === value)?.label ?? value
}

/** AI-recommended defaults based on goal and target market */
function getAiDefaults(formData: CampaignWizardFormData) {
  const objective = formData.objective
  const bidStrategy =
    objective === "sales" || objective === "newcustomer"
      ? "maximize_conversions"
      : objective === "traffic"
        ? "target_cpa"
        : "target_roas"
  const channels =
    objective === "creator_commerce"
      ? ["creator"]
      : objective === "awareness"
        ? ["shopping", "commerce"]
        : ["shopping"]
  const channelSurfaces: Record<string, string[]> = {}
  if (channels.includes("shopping"))
    channelSurfaces.shopping = ["ai-search", "price-compare"]
  if (channels.includes("creator"))
    channelSurfaces.creator = ["stories", "affiliate"]
  if (channels.includes("commerce"))
    channelSurfaces.commerce = ["placements", "retargeting"]

  const targetMarket = formData.targetMarket
  let regions: string[] = []
  if (targetMarket === "uk_ie") regions = ["United Kingdom", "Ireland"]
  else if (targetMarket === "north_america")
    regions = ["United States", "Canada", "Mexico"]
  else if (targetMarket === "eu")
    regions = [
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Netherlands",
      "Belgium",
      "Austria",
      "Portugal",
      "Ireland",
    ]
  else if (targetMarket === "apac")
    regions = [
      "Japan",
      "South Korea",
      "Singapore",
      "Australia",
      "New Zealand",
    ]
  else
    regions = [
      "United States",
      "United Kingdom",
      "Canada",
      "Germany",
      "France",
      "Australia",
    ]

  return {
    bidStrategy,
    channels,
    channelSurfaces,
    regions,
    products: ["All Products"],
    ageBands: ["18–24", "25–34", "35–44"],
    interests: ["Fashion", "Luxury"],
    devices: ["Desktop", "Mobile", "Tablet"],
    conversionGoals: objective === "sales" || objective === "newcustomer" ? ["purchase"] : ["add_to_cart"],
    attributionModel: "data_driven",
    campaignType:
      objective === "sales"
        ? "performance"
        : objective === "traffic"
          ? "shopping"
          : "performance",
  }
}

export type CampaignCreateProps = {
  embedded?: boolean
  onClose?: () => void
  duplicateSourceId?: string | null
}

export function CampaignCreate({
  embedded = false,
  onClose,
  duplicateSourceId = null,
}: CampaignCreateProps = {}) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CampaignWizardFormData>(initialCampaignWizardForm)
  const [stepError, setStepError] = useState("")
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const uploadObjectUrlRef = useRef<string | null>(null)
  const skipDupEffectRef = useRef(false)
  const prevDupIdRef = useRef<string | null>(null)
  const [copyPickerValue, setCopyPickerValue] = useState<string>(
    () => duplicateSourceId ?? "__none__"
  )
  const [showAiDraftBanner, setShowAiDraftBanner] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const duplicateSourceCampaign = useMemo(() => {
    if (!duplicateSourceId) return null
    return getMergedCampaigns().find((c) => c.id === duplicateSourceId) ?? null
  }, [duplicateSourceId])

  useEffect(() => {
    return () => {
      if (uploadObjectUrlRef.current) {
        URL.revokeObjectURL(uploadObjectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (duplicateSourceId !== prevDupIdRef.current) {
      skipDupEffectRef.current = false
      prevDupIdRef.current = duplicateSourceId
      if (duplicateSourceId) {
        setCopyPickerValue(duplicateSourceId)
      } else {
        setCopyPickerValue("__none__")
        setShowAiDraftBanner(false)
      }
    }
  }, [duplicateSourceId])

  useEffect(() => {
    if (!duplicateSourceId) return
    if (skipDupEffectRef.current) return
    const c = getMergedCampaigns().find((x) => x.id === duplicateSourceId)
    if (!c) return
    if (uploadObjectUrlRef.current) {
      URL.revokeObjectURL(uploadObjectUrlRef.current)
      uploadObjectUrlRef.current = null
    }
    setUploadPreview(null)
    setFormData(wizardFormFromCampaign(c))
    setCurrentStep(1)
    setStepError("")
  }, [duplicateSourceId])

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return
    const raw = sessionStorage.getItem(CAMPAIGN_WIZARD_AI_DRAFT_KEY)
    if (!raw) return
    if (duplicateSourceId) {
      sessionStorage.removeItem(CAMPAIGN_WIZARD_AI_DRAFT_KEY)
      return
    }
    try {
      const parsed = JSON.parse(raw) as Partial<CampaignWizardFormData>
      if (uploadObjectUrlRef.current) {
        URL.revokeObjectURL(uploadObjectUrlRef.current)
        uploadObjectUrlRef.current = null
      }
      setUploadPreview(null)
      setFormData({ ...initialCampaignWizardForm, ...parsed })
      setShowAiDraftBanner(true)
      setCopyPickerValue("__none__")
      setCurrentStep(1)
      setStepError("")
    } catch {
      /* ignore invalid JSON */
    }
    sessionStorage.removeItem(CAMPAIGN_WIZARD_AI_DRAFT_KEY)
  }, [duplicateSourceId])

  const creativeImageDisplay = uploadPreview || formData.imageUrl.trim() || undefined

  const progress = (currentStep / STEP_COUNT) * 100

  const exitToCampaigns = () => {
    if (embedded) {
      onClose?.()
    } else {
      navigate("/campaigns")
    }
  }

  const aiDefaults = useMemo(() => getAiDefaults(formData), [formData])

  const handleSaveDraft = () => {
    exitToCampaigns()
  }

  const handleLaunch = () => {
    const sym =
      CURRENCY_OPTIONS.find((c) => c.value === formData.currency)?.symbol ?? "$"
    const merged: CampaignWizardFormData = {
      ...formData,
      bidStrategy: formData.bidStrategy || aiDefaults.bidStrategy,
      channels: formData.channels.length ? formData.channels : aiDefaults.channels,
      channelSurfaces: Object.keys(formData.channelSurfaces).length
        ? formData.channelSurfaces
        : aiDefaults.channelSurfaces,
      regions: formData.regions.length ? formData.regions : aiDefaults.regions,
      products: formData.products.length ? formData.products : aiDefaults.products,
      ageBands: formData.ageBands.length ? formData.ageBands : aiDefaults.ageBands,
      interests: formData.interests.length ? formData.interests : aiDefaults.interests,
      devices: formData.devices.length ? formData.devices : aiDefaults.devices,
      conversionGoals: formData.conversionGoals.length
        ? formData.conversionGoals
        : aiDefaults.conversionGoals,
      attributionModel: formData.attributionModel || aiDefaults.attributionModel,
      campaignType: formData.campaignType || aiDefaults.campaignType,
    }
    addLaunchedCampaign(
      makeNewCampaignRow(merged.name.trim() || "Untitled campaign", sym, { ...merged })
    )
    exitToCampaigns()
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.objective) {
        setStepError("Add a campaign name and goal to continue.")
        return
      }
      if (!formData.currency) {
        setStepError("Select a currency for budgets and reporting.")
        return
      }
    }
    setStepError("")
    if (currentStep < STEP_COUNT) {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setStepError("")
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }

  const toggleImageAspectRatio = (ratio: string) => {
    setFormData((prev) => {
      const has = prev.imageAspectRatios.includes(ratio)
      let next = has ? prev.imageAspectRatios.filter((x) => x !== ratio) : [...prev.imageAspectRatios, ratio]
      if (next.length === 0) next = [ratio]
      return { ...prev, imageAspectRatios: next }
    })
  }

  const handleCreativeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadObjectUrlRef.current) URL.revokeObjectURL(uploadObjectUrlRef.current)
    const url = URL.createObjectURL(file)
    uploadObjectUrlRef.current = url
    setUploadPreview(url)
    e.target.value = ""
  }

  const clearCreativeUpload = () => {
    if (uploadObjectUrlRef.current) URL.revokeObjectURL(uploadObjectUrlRef.current)
    uploadObjectUrlRef.current = null
    setUploadPreview(null)
  }

  const handleCopyFromExistingChange = (value: string | null) => {
    if (value == null) return
    setCopyPickerValue(value)
    if (value === "__none__") {
      if (duplicateSourceId) skipDupEffectRef.current = true
      clearCreativeUpload()
      setFormData({ ...initialCampaignWizardForm })
      setStepError("")
      setShowAiDraftBanner(false)
      return
    }
    skipDupEffectRef.current = false
    const c = getMergedCampaigns().find((x) => x.id === value)
    if (!c) return
    clearCreativeUpload()
    setFormData(wizardFormFromCampaign(c))
    setStepError("")
    setShowAiDraftBanner(false)
  }

  const budgetNumeric = (() => {
    const n = Number.parseInt(formData.budget, 10)
    if (Number.isNaN(n)) return 0
    return Math.min(BUDGET_SLIDER_MAX, Math.max(BUDGET_SLIDER_MIN, n))
  })()

  const currencySymbol =
    CURRENCY_OPTIONS.find((c) => c.value === formData.currency)?.symbol ?? "$"

  const setBudgetFromNumber = (n: number) => {
    const clamped = Math.min(BUDGET_SLIDER_MAX, Math.max(BUDGET_SLIDER_MIN, Math.round(n)))
    setFormData((prev) => ({ ...prev, budget: String(clamped) }))
  }

  const companyProfile = useMemo(() => getCompanyProfile(), [])

  const applyAiHeadlines = () => {
    const p = getCompanyProfile()
    const host = siteHostname(p.website)
    setFormData((prev) => ({
      ...prev,
      headlinePrimary: `Shop ${p.companyName} — styles you'll love`,
      headlineSecondary: `New arrivals and bestsellers from ${host}`,
      description: `Explore curated products from ${p.companyName}. Aeris drafted this from your company profile and website—you can edit every line.`,
    }))
  }

  // Effective values for review: user overrides or AI defaults
  const effectiveBidStrategy = formData.bidStrategy || aiDefaults.bidStrategy
  const effectiveChannels = formData.channels.length ? formData.channels : aiDefaults.channels
  const effectiveRegions = formData.regions.length ? formData.regions : aiDefaults.regions
  const effectiveProducts = formData.products.length ? formData.products : aiDefaults.products
  const effectiveAgeBands = formData.ageBands.length ? formData.ageBands : aiDefaults.ageBands
  const effectiveInterests = formData.interests.length ? formData.interests : aiDefaults.interests
  const effectiveDevices = formData.devices.length ? formData.devices : aiDefaults.devices
  const effectiveCampaignType = formData.campaignType || aiDefaults.campaignType
  const effectiveConversionGoals = formData.conversionGoals.length
    ? formData.conversionGoals
    : aiDefaults.conversionGoals
  const effectiveAttribution = formData.attributionModel || aiDefaults.attributionModel

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
          embedded && "pt-0"
        )}
      >
        <div className="flex items-center gap-4">
          {!embedded && (
            <Link
              to="/campaigns"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="Back to campaigns"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className={cn(
                  "font-semibold tracking-tight",
                  embedded ? "text-xl" : "text-2xl"
                )}
              >
                Create Campaign
              </h1>
              {duplicateSourceId && duplicateSourceCampaign && (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
                  <Copy className="mr-1 h-3 w-3" aria-hidden />
                  Copying
                </span>
              )}
              {showAiDraftBanner && (
                <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                  From Aeris
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {STEP_COUNT}: {steps[currentStep - 1].title}
            </p>
          </div>
        </div>
        {currentStep === STEP_COUNT && (
          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="shrink-0">
            <Save className="mr-2 h-4 w-4" />
            Save draft
          </Button>
        )}
      </div>

      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1 md:justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex min-w-[5rem] flex-col items-center",
                step.id <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                      ? "border-2 border-primary"
                      : "border-2 border-muted"
                )}
              >
                {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span className="mt-1 hidden text-center text-[10px] leading-tight md:block md:text-xs">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {stepError && currentStep === 1 && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {stepError}
        </p>
      )}

      {duplicateSourceId && duplicateSourceCampaign && (
        <div
          className="mb-4 flex gap-3 rounded-lg border border-l-4 border-l-foreground/20 bg-muted/40 px-4 py-3 text-sm"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-foreground" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Manual copy</p>
            <p className="mt-1 text-muted-foreground">
              Settings are pre-filled from{" "}
              <span className="font-medium text-foreground">{duplicateSourceCampaign.name}</span>. Review
              every step before launch.
            </p>
          </div>
        </div>
      )}
      {showAiDraftBanner && (
        <div
          className="mb-4 flex gap-3 rounded-lg border border-l-4 border-l-primary bg-primary/5 px-4 py-3 text-sm"
          role="status"
        >
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Aeris draft</p>
            <p className="mt-1 text-muted-foreground">
              This wizard was opened from Aeris with a suggested copy of an existing campaign. Check each
              step, then launch when ready.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="space-y-6">
          {/* ── STEP 1 — Goal & budget ── */}
          {currentStep === 1 && (
            <>
              {/* Copy from existing */}
              <div
                id="wizard-start-from-existing"
                className="max-w-3xl scroll-mt-4 space-y-3 rounded-xl border-2 border-dashed border-primary/40 bg-muted/30 p-4 sm:p-5"
              >
                <div className="flex items-start gap-2">
                  <Copy className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <span className="text-sm font-semibold text-foreground" id="copy-from-existing-label">
                      Start from an existing campaign
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground" id="copy-from-existing-desc">
                      Choose a campaign below to load its settings (same as{" "}
                      <span className="font-medium text-foreground">Copy campaign</span> on the list). Leave
                      blank to start fresh.
                    </p>
                  </div>
                </div>
                <Select value={copyPickerValue} onValueChange={handleCopyFromExistingChange}>
                  <SelectTrigger
                    className="max-w-full sm:max-w-md"
                    aria-labelledby="copy-from-existing-label"
                    aria-describedby="copy-from-existing-desc"
                  >
                    <SelectValue placeholder="Don't copy — start blank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Don't copy — start blank</SelectItem>
                    {getMergedCampaigns().map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CampaignPlanAllowanceBanner compact />

              <div className="max-w-3xl space-y-8">
                {/* Campaign name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="campaign-name">
                    Campaign name
                  </label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., Summer Sale 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Goal */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium">Goal</h3>
                    <p className="text-xs text-muted-foreground">
                      Choose your primary objective. AI configures targeting, bidding, and channels to
                      match.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {CAMPAIGN_OBJECTIVE_OPTIONS.map((o) => {
                      const Icon = OBJECTIVE_ICONS[o.value as keyof typeof OBJECTIVE_ICONS]
                      const selected = formData.objective === o.value
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, objective: o.value })}
                          className={cn(
                            "relative flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
                            selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                          )}
                        >
                          {selected && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-medium leading-tight">{o.label}</span>
                          <span className="text-xs text-muted-foreground">{o.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Target market */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium">Target market</h3>
                    <p className="text-xs text-muted-foreground">
                      AI auto-selects delivery regions and audience from this market.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {TARGET_MARKET_OPTIONS.map((m) => {
                      const Icon = TARGET_MARKET_ICONS[m.value as keyof typeof TARGET_MARKET_ICONS]
                      const selected = formData.targetMarket === m.value
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, targetMarket: m.value })}
                          className={cn(
                            "relative flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
                            selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                          )}
                        >
                          {selected && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                          {Icon && <Icon className="h-5 w-5 text-primary" />}
                          <span className="font-medium leading-tight">{m.label}</span>
                          <span className="text-xs text-muted-foreground">{m.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Currency + Budget */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="campaign-currency">
                      Currency
                    </label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value ?? "" })}
                    >
                      <SelectTrigger id="campaign-currency" className="w-full max-w-md">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {`${c.symbol} ${c.value} — ${c.label}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium" htmlFor="campaign-budget">
                        Budget
                      </label>
                      <Input
                        id="campaign-budget"
                        type="number"
                        min={BUDGET_SLIDER_MIN}
                        max={BUDGET_SLIDER_MAX}
                        step={BUDGET_SLIDER_STEP}
                        placeholder="5000"
                        value={formData.budget}
                        onChange={(e) => {
                          const raw = e.target.value
                          if (raw === "") {
                            setFormData({ ...formData, budget: "" })
                            return
                          }
                          const n = Number.parseInt(raw, 10)
                          if (Number.isNaN(n)) return
                          setBudgetFromNumber(n)
                        }}
                      />
                      <Slider
                        min={BUDGET_SLIDER_MIN}
                        max={BUDGET_SLIDER_MAX}
                        step={BUDGET_SLIDER_STEP}
                        value={[budgetNumeric]}
                        onValueChange={(v) => {
                          const arr = Array.isArray(v) ? v : [v]
                          const next = arr[0]
                          if (typeof next === "number") setBudgetFromNumber(next)
                        }}
                        aria-label="Adjust budget"
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.budget ? (
                          <>
                            <span className="font-medium text-foreground">
                              {currencySymbol}
                              {budgetNumeric.toLocaleString()}
                            </span>{" "}
                            budget cap ·{" "}
                          </>
                        ) : (
                          <>
                            Set a cap between {currencySymbol}
                            {BUDGET_SLIDER_MIN.toLocaleString()}–{currencySymbol}
                            {BUDGET_SLIDER_MAX.toLocaleString()}.{" "}
                          </>
                        )}
                        {BUDGET_TYPE_OPTIONS.find((b) => b.value === formData.budgetType)?.description ??
                          "Choose how the budget is spent across time."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Budget type</label>
                      <Select
                        value={formData.budgetType}
                        onValueChange={(value) => {
                          if (value) setFormData({ ...formData, budgetType: value })
                        }}
                      >
                        <SelectTrigger className="h-auto min-h-8 w-full min-w-0 whitespace-normal py-2 [&_[data-slot=select-value]]:line-clamp-none">
                          <SelectValue placeholder="Select budget type" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[min(100vw-2rem,22rem)] max-w-lg w-[min(100vw-2rem,28rem)]">
                          {BUDGET_TYPE_OPTIONS.map((b) => (
                            <SelectItem key={b.value} value={b.value} title={b.description}>
                              <span className="block font-medium leading-snug">{b.label}</span>
                              <span className="block text-xs text-muted-foreground">{b.description}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="campaign-start-date" className="text-sm font-medium">
                        Start date
                      </label>
                      <DatePickerField
                        id="campaign-start-date"
                        value={formData.startDate}
                        onChange={(v) => setFormData({ ...formData, startDate: v })}
                        maxDate={parseIsoDateString(formData.endDate)}
                        placeholder="Start date"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="campaign-end-date" className="text-sm font-medium">
                        End date
                      </label>
                      <DatePickerField
                        id="campaign-end-date"
                        value={formData.endDate}
                        onChange={(v) => setFormData({ ...formData, endDate: v })}
                        minDate={parseIsoDateString(formData.startDate)}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>

                {/* AI-configured notice */}
                {formData.objective && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-foreground">AI will configure the rest</p>
                        <p className="mt-1 text-muted-foreground">
                          Based on your goal ({optionLabel(CAMPAIGN_OBJECTIVE_OPTIONS, formData.objective)})
                          {formData.targetMarket
                            ? ` and market (${optionLabel(TARGET_MARKET_OPTIONS, formData.targetMarket)})`
                            : ""}
                          , we'll auto-set channels, targeting, bidding, and product selection for optimal
                          performance. You can review everything before launch.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── STEP 2 — Ad design ── */}
          {currentStep === 2 && (
            <div className="max-w-5xl space-y-8">
              <div>
                <h3 className="text-sm font-medium">Copy</h3>
                <p className="text-xs text-muted-foreground">
                  Aeris drafts from your{" "}
                  <Link to="/settings" className="text-primary underline underline-offset-2">
                    company website
                  </Link>
                  . Edit any field before launch.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={applyAiHeadlines}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply AI draft from website
                  </Button>
                </div>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary headline</label>
                    <Input
                      placeholder="e.g., New season — up to 30% off"
                      value={formData.headlinePrimary}
                      onChange={(e) => setFormData({ ...formData, headlinePrimary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secondary headline (optional)</label>
                    <Input
                      placeholder="Supporting line"
                      value={formData.headlineSecondary}
                      onChange={(e) => setFormData({ ...formData, headlineSecondary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className={textareaClass}
                      placeholder="Longer value proposition or promo details"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Previews for each selected aspect ratio (same copy; image repeats across crops).
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {formData.imageAspectRatios.map((ratio) => (
                      <AdPreview
                        key={ratio}
                        headline={formData.headlinePrimary}
                        headlineSecondary={formData.headlineSecondary}
                        description={formData.description}
                        imageUrl={creativeImageDisplay}
                        aspectRatioValue={ratio}
                        domainLabel={siteHostname(companyProfile.website)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Image aspect ratios</h3>
                <p className="text-xs text-muted-foreground">
                  Multi-select every size you will supply. Ad networks need matching crops per placement.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {IMAGE_ASPECT_RATIOS.map((r) => {
                    const selected = formData.imageAspectRatios.includes(r.value)
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => toggleImageAspectRatio(r.value)}
                        className={cn(
                          "rounded-lg border p-3 text-left text-sm transition-colors",
                          selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                        )}
                      >
                        <p className="font-medium">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Creative image</h3>
                <p className="text-xs text-muted-foreground">
                  Paste a URL or upload a file. Upload takes priority over URL in the preview.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="creative-image-url">
                      Image URL
                    </label>
                    <Input
                      id="creative-image-url"
                      placeholder="https://…"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Upload image</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "cursor-pointer"
                        )}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleCreativeFile}
                        />
                      </label>
                      {uploadPreview ? (
                        <Button type="button" variant="ghost" size="sm" onClick={clearCreativeUpload}>
                          Remove upload
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Review & launch ── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="py-4 text-center">
                <Rocket className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="text-xl font-semibold">Ready to launch</h2>
                <p className="text-muted-foreground">Review settings below, then launch or save as draft.</p>
              </div>

              {/* Your settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Goal & budget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <ReviewRow label="Name" value={formData.name || "—"} />
                    <ReviewRow
                      label="Goal"
                      value={optionLabel(CAMPAIGN_OBJECTIVE_OPTIONS, formData.objective)}
                    />
                    <ReviewRow
                      label="Target market"
                      value={optionLabel(TARGET_MARKET_OPTIONS, formData.targetMarket)}
                    />
                    <ReviewRow
                      label="Currency"
                      value={
                        formData.currency
                          ? (() => {
                              const c = CURRENCY_OPTIONS.find((x) => x.value === formData.currency)
                              return c ? `${c.value} (${c.symbol})` : formData.currency
                            })()
                          : "—"
                      }
                    />
                    <ReviewRow
                      label="Budget type"
                      value={optionLabel(BUDGET_TYPE_OPTIONS, formData.budgetType)}
                    />
                    <ReviewRow
                      label="Budget"
                      value={
                        formData.budget
                          ? `${currencySymbol}${Number(formData.budget).toLocaleString()}`
                          : "—"
                      }
                    />
                    <ReviewRow
                      label="Schedule"
                      value={[formData.startDate, formData.endDate].filter(Boolean).join(" → ") || "—"}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Creative</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <ReviewRow label="Headline" value={formData.headlinePrimary || "—"} />
                    <ReviewRow label="Secondary" value={formData.headlineSecondary || "—"} />
                    <ReviewRow
                      label="Description"
                      value={
                        formData.description
                          ? formData.description.length > 80
                            ? `${formData.description.slice(0, 80)}…`
                            : formData.description
                          : "—"
                      }
                    />
                    <ReviewRow
                      label="Image ratios"
                      value={
                        formData.imageAspectRatios
                          .map((r) => optionLabel(IMAGE_ASPECT_RATIOS, r))
                          .join(", ") || "—"
                      }
                    />
                    <ReviewRow
                      label="Image"
                      value={
                        uploadPreview
                          ? "Uploaded file (preview)"
                          : formData.imageUrl.trim()
                            ? formData.imageUrl
                            : "—"
                      }
                    />
                  </CardContent>
                </Card>
              </div>

              {/* AI-configured settings */}
              <Card className="border-primary/30 bg-primary/[0.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">AI-configured settings</CardTitle>
                  </div>
                  <CardDescription>
                    Auto-optimized based on your goal and market. These deliver the best performance for
                    most advertisers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <ReviewRow
                    label="Campaign type"
                    value={optionLabel(CAMPAIGN_TYPE_OPTIONS, effectiveCampaignType)}
                  />
                  <ReviewRow
                    label="Bid strategy"
                    value={optionLabel(BID_STRATEGY_OPTIONS, effectiveBidStrategy)}
                  />
                  <ReviewRow label="Products" value={effectiveProducts.join(", ")} />
                  <ReviewRow label="Channels" value={effectiveChannels.join(", ")} />
                  <ReviewRow
                    label="Regions"
                    value={
                      effectiveRegions.length > 4
                        ? `${effectiveRegions.slice(0, 4).join(", ")} +${effectiveRegions.length - 4} more`
                        : effectiveRegions.join(", ") || "—"
                    }
                  />
                  <ReviewRow label="Age" value={effectiveAgeBands.join(", ")} />
                  <ReviewRow label="Interests" value={effectiveInterests.join(", ")} />
                  <ReviewRow label="Devices" value={effectiveDevices.join(", ")} />
                  <ReviewRow
                    label="Conversion goals"
                    value={effectiveConversionGoals.join(", ") || "—"}
                  />
                  <ReviewRow
                    label="Attribution"
                    value={optionLabel(ATTRIBUTION_OPTIONS, effectiveAttribution)}
                  />
                </CardContent>
              </Card>

              {/* Advanced / override toggle */}
              <div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowAdvancedSettings((p) => !p)}
                >
                  {showAdvancedSettings ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {showAdvancedSettings ? "Hide" : "Show"} advanced overrides
                </button>
                {showAdvancedSettings && (
                  <Card className="mt-3">
                    <CardContent className="space-y-5 pt-4">
                      <p className="text-xs text-muted-foreground">
                        Override any AI-configured setting. Leave unchanged to keep the AI recommendation.
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Campaign type</label>
                        <div className="grid gap-3 md:grid-cols-3">
                          {CAMPAIGN_TYPE_OPTIONS.map((t) => {
                            const Icon = CAMPAIGN_TYPE_ICONS[t.value as keyof typeof CAMPAIGN_TYPE_ICONS]
                            const selected = effectiveCampaignType === t.value
                            return (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, campaignType: t.value })}
                                className={cn(
                                  "relative flex flex-col gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                                  selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                                )}
                              >
                                {selected && (
                                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="h-2.5 w-2.5" />
                                  </span>
                                )}
                                <Icon className="h-4 w-4 text-primary" />
                                <span className="font-medium">{t.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bid strategy</label>
                        <Select
                          value={effectiveBidStrategy}
                          onValueChange={(value) =>
                            setFormData({ ...formData, bidStrategy: value ?? "" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            {BID_STRATEGY_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attribution model</label>
                        <Select
                          value={effectiveAttribution}
                          onValueChange={(value) =>
                            setFormData({ ...formData, attributionModel: value ?? "" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTRIBUTION_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">UTM prefix (optional)</label>
                        <Input
                          placeholder="e.g., ss26_sale"
                          value={formData.utmPrefix}
                          onChange={(e) => setFormData({ ...formData, utmPrefix: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ad preview */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {formData.imageAspectRatios.map((ratio) => (
                  <AdPreview
                    key={ratio}
                    headline={formData.headlinePrimary}
                    headlineSecondary={formData.headlineSecondary}
                    description={formData.description}
                    imageUrl={creativeImageDisplay}
                    aspectRatioValue={ratio}
                    domainLabel={siteHostname(getCompanyProfile().website)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {currentStep === STEP_COUNT && (
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save draft
            </Button>
          )}
          {currentStep < STEP_COUNT ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch}>
              <Rocket className="mr-2 h-4 w-4" />
              Launch campaign
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium break-words">{value}</span>
    </div>
  )
}
