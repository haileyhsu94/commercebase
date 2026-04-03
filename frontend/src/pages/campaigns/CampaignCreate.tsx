import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe,
  Globe2,
  ClipboardList,
  Landmark,
  Mail,
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
  Target,
  Percent,
  SlidersHorizontal,
  Sparkles,
  Upload,
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
import { defaultCompanyProfile } from "@/lib/mock-data"
import { getCompanyProfile, siteHostname } from "@/lib/company-profile"
import { addLaunchedCampaign, makeNewCampaignRow } from "@/lib/campaign-storage"
import { regionFlag } from "@/lib/region-flags"
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

const STEP_COUNT = 7

const steps = [
  { id: 1, title: "Goal & market", description: "Market, objective, campaign type" },
  { id: 2, title: "Budget & bids", description: "Currency, budget, bids, tracking" },
  { id: 3, title: "Products", description: "Catalog and exclusions" },
  { id: 4, title: "Channels", description: "Multi-select surfaces" },
  { id: 5, title: "Audience", description: "Geo, demo, devices" },
  { id: 6, title: "Creative", description: "Copy, ratio, preview" },
  { id: 7, title: "Review", description: "Preview and launch" },
] as const

const PRODUCT_CATEGORIES = [
  { id: "All Products", count: "523 items" },
  { id: "Sneakers", count: "128 items" },
  { id: "Luxury Bags", count: "64 items" },
  { id: "Watches", count: "41 items" },
  { id: "Jackets", count: "89 items" },
  { id: "Accessories", count: "201 items" },
]

const EXCLUSION_OPTIONS = ["Outlet / damaged SKU", "Pre-order only", "Gift cards", "Samples"]

const CHANNEL_DEFS = [
  {
    id: "shopping",
    name: "Shopping",
    desc: "AI Search & Price Comparison",
    surfaces: [
      { id: "ai-search", label: "AI shopping search" },
      { id: "price-compare", label: "Price comparison" },
    ],
  },
  {
    id: "creator",
    name: "Creator Network",
    desc: "Influencer & Affiliate Marketing",
    surfaces: [
      { id: "stories", label: "Stories & short video" },
      { id: "affiliate", label: "Affiliate links" },
    ],
  },
  {
    id: "commerce",
    name: "Commerce Network",
    desc: "Publisher Partners",
    surfaces: [
      { id: "placements", label: "Premium placements" },
      { id: "retargeting", label: "On-site retargeting" },
    ],
  },
] as const

const REGIONS = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Austria",
  "Switzerland",
  "Ireland",
  "Portugal",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "Taiwan",
  "India",
  "Thailand",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "United Arab Emirates",
  "Saudi Arabia",
  "Israel",
  "South Africa",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
]

const AGE_BANDS = ["18–24", "25–34", "35–44", "45–54", "55+"]

const INTEREST_TAGS = ["Fashion", "Luxury", "Sports", "Streetwear", "Sustainability", "Travel"]

const DEVICE_OPTIONS = ["Desktop", "Mobile", "Tablet"]

const CONVERSION_GOAL_OPTIONS = [
  {
    id: "purchase",
    label: "Purchase",
    description: "Completed orders and revenue events for ROAS and sales reporting.",
  },
  {
    id: "add_to_cart",
    label: "Add to cart",
    description: "Cart adds for mid-funnel optimization and catalog campaigns.",
  },
  {
    id: "lead",
    label: "Lead form",
    description: "Qualified leads from forms; pairs with smart bidding and CRM goals.",
  },
  {
    id: "signup",
    label: "Newsletter signup",
    description: "Email subscribers and list growth beyond immediate purchase.",
  },
] as const

const CONVERSION_GOAL_ICONS = {
  purchase: ShoppingBag,
  add_to_cart: ShoppingCart,
  lead: ClipboardList,
  signup: Mail,
} as const

const BUDGET_SLIDER_MIN = 0
const BUDGET_SLIDER_MAX = 50000
const BUDGET_SLIDER_STEP = 100

const MAX_CPC_SLIDER_MIN = 0
const MAX_CPC_SLIDER_MAX = 25
const MAX_CPC_SLIDER_STEP = 0.05

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

const BID_STRATEGY_ICONS = {
  maximize_conversions: Zap,
  target_roas: Percent,
  target_cpa: Target,
  manual_cpc: SlidersHorizontal,
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

export type CampaignCreateProps = {
  /** When true, wizard runs inside a dialog (no back link; close via onClose). */
  embedded?: boolean
  onClose?: () => void
}

export function CampaignCreate({ embedded = false, onClose }: CampaignCreateProps = {}) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CampaignWizardFormData>(initialCampaignWizardForm)
  const [stepError, setStepError] = useState("")
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const uploadObjectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (uploadObjectUrlRef.current) {
        URL.revokeObjectURL(uploadObjectUrlRef.current)
      }
    }
  }, [])

  const creativeImageDisplay = uploadPreview || formData.imageUrl.trim() || undefined

  const progress = (currentStep / STEP_COUNT) * 100

  const exitToCampaigns = () => {
    if (embedded) {
      onClose?.()
    } else {
      navigate("/campaigns")
    }
  }

  const handleSaveDraft = () => {
    exitToCampaigns()
  }

  const handleLaunch = () => {
    const sym =
      CURRENCY_OPTIONS.find((c) => c.value === formData.currency)?.symbol ?? "$"
    addLaunchedCampaign(
      makeNewCampaignRow(formData.name.trim() || "Untitled campaign", sym)
    )
    exitToCampaigns()
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (
        !formData.name.trim() ||
        !formData.targetMarket ||
        !formData.objective ||
        !formData.campaignType
      ) {
        setStepError(
          "Add a campaign name, objective, target market, and campaign type to continue."
        )
        return
      }
    }
    if (currentStep === 2) {
      if (!formData.currency) {
        setStepError("Select a currency for budgets, bids, and performance metrics.")
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

  const toggleInArray = (key: keyof CampaignWizardFormData, value: string) => {
    setFormData((prev) => {
      const arr = prev[key] as string[]
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
      return { ...prev, [key]: next }
    })
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

  const toggleChannel = (channel: string) => {
    setFormData((prev) => {
      const isOn = prev.channels.includes(channel)
      const nextChannels = isOn ? prev.channels.filter((c) => c !== channel) : [...prev.channels, channel]
      const nextSurfaces = { ...prev.channelSurfaces }
      if (isOn) {
        delete nextSurfaces[channel]
      }
      return { ...prev, channels: nextChannels, channelSurfaces: nextSurfaces }
    })
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

  const maxCpcNumeric = (() => {
    const n = Number.parseFloat(formData.maxCpc)
    if (Number.isNaN(n)) return 0
    return Math.min(MAX_CPC_SLIDER_MAX, Math.max(MAX_CPC_SLIDER_MIN, n))
  })()

  const setMaxCpcFromNumber = (n: number) => {
    const clamped = Math.min(MAX_CPC_SLIDER_MAX, Math.max(MAX_CPC_SLIDER_MIN, n))
    setFormData((prev) => ({ ...prev, maxCpc: clamped.toFixed(2) }))
  }

  const companyProfile = useMemo(() => getCompanyProfile(), [])

  const applyAiHeadlines = () => {
    const p = getCompanyProfile()
    const host = siteHostname(p.website)
    setFormData((prev) => ({
      ...prev,
      headlinePrimary: `Shop ${p.companyName} — styles you’ll love`,
      headlineSecondary: `New arrivals and bestsellers from ${host}`,
      description: `Explore curated products from ${p.companyName}. Aeris drafted this from your company profile and website—you can edit every line.`,
    }))
  }

  const toggleSurface = (channelId: string, surfaceId: string) => {
    setFormData((prev) => {
      const list = prev.channelSurfaces[channelId] ?? []
      const nextList = list.includes(surfaceId)
        ? list.filter((s) => s !== surfaceId)
        : [...list, surfaceId]
      return {
        ...prev,
        channelSurfaces: { ...prev.channelSurfaces, [channelId]: nextList },
      }
    })
  }

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
            <h1
              className={cn(
                "font-semibold tracking-tight",
                embedded ? "text-xl" : "text-2xl"
              )}
            >
              Create Campaign
            </h1>
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
                "flex min-w-[4.5rem] flex-col items-center",
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

      {stepError && (currentStep === 1 || currentStep === 2) && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {stepError}
        </p>
      )}

      <Card className="mb-6">
        <CardContent className="space-y-6">
          <CampaignPlanAllowanceBanner compact />
          {currentStep === 1 && (
            <div className="max-w-3xl space-y-8">
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

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Objective</h3>
                  <p className="text-xs text-muted-foreground">What success looks like for this campaign.</p>
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

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Target market</h3>
                  <p className="text-xs text-muted-foreground">
                    Strategic cluster for optimization and reporting (e.g. EU vs North America). This is not
                    the same as ad delivery countries—those are chosen in the Audience step.
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

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Campaign type</h3>
                  <p className="text-xs text-muted-foreground">
                    Shapes channel recommendations and bidding in later steps.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {CAMPAIGN_TYPE_OPTIONS.map((t) => {
                    const Icon = CAMPAIGN_TYPE_ICONS[t.value as keyof typeof CAMPAIGN_TYPE_ICONS]
                    const selected = formData.campaignType === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, campaignType: t.value })}
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
                        <span className="font-medium leading-tight">{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-lg space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="campaign-currency">
                  Currency
                </label>
                <p className="text-xs text-muted-foreground">
                  Budget amounts, bid caps, and reports use this currency. Choose the code you bill in.
                </p>
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
                        </span>
                        {" "}
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
                    <SelectTrigger
                      className="h-auto min-h-8 w-full min-w-0 whitespace-normal py-2 [&_[data-slot=select-value]]:line-clamp-none"
                    >
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
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Bid strategy</label>
                  <p className="text-xs text-muted-foreground">
                    Smart bidding uses your account conversion data when available.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {BID_STRATEGY_OPTIONS.map((o) => {
                    const Icon = BID_STRATEGY_ICONS[o.value as keyof typeof BID_STRATEGY_ICONS]
                    const selected = formData.bidStrategy === o.value
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, bidStrategy: o.value })}
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
              <div className="space-y-3">
                <label className="text-sm font-medium" htmlFor="campaign-max-cpc">
                  Max CPC cap (optional)
                </label>
                <Input
                  id="campaign-max-cpc"
                  type="number"
                  min={MAX_CPC_SLIDER_MIN}
                  max={MAX_CPC_SLIDER_MAX}
                  step={MAX_CPC_SLIDER_STEP}
                  placeholder={`e.g., ${currencySymbol}2.50`}
                  value={formData.maxCpc}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === "") {
                      setFormData({ ...formData, maxCpc: "" })
                      return
                    }
                    const n = Number.parseFloat(raw)
                    if (Number.isNaN(n)) return
                    setMaxCpcFromNumber(n)
                  }}
                />
                <Slider
                  min={MAX_CPC_SLIDER_MIN}
                  max={MAX_CPC_SLIDER_MAX}
                  step={MAX_CPC_SLIDER_STEP}
                  value={[maxCpcNumeric]}
                  onValueChange={(v) => {
                    const arr = Array.isArray(v) ? v : [v]
                    const next = arr[0]
                    if (typeof next === "number") setMaxCpcFromNumber(next)
                  }}
                  aria-label="Adjust max CPC cap"
                />
                <p className="text-xs text-muted-foreground">
                  {currencySymbol}
                  {MAX_CPC_SLIDER_MIN.toFixed(2)} – {currencySymbol}
                  {MAX_CPC_SLIDER_MAX.toFixed(2)} max bid per click
                </p>
              </div>
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
              <Separator />
              <div>
                <h3 className="mb-1 text-sm font-medium">Conversion &amp; measurement</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Set these early so reporting and smart bidding stay aligned (same as Google Ads / Meta
                  onboarding flows).
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Conversion goals</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Multi-select — used for reporting and smart bidding eligibility.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {CONVERSION_GOAL_OPTIONS.map((g) => {
                        const Icon =
                          CONVERSION_GOAL_ICONS[g.id as keyof typeof CONVERSION_GOAL_ICONS]
                        const selected = formData.conversionGoals.includes(g.id)
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggleInArray("conversionGoals", g.id)}
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
                            <span className="font-medium leading-tight">{g.label}</span>
                            <span className="text-xs text-muted-foreground">{g.description}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Attribution model</label>
                    <Select
                      value={formData.attributionModel}
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
                    <p className="text-xs text-muted-foreground">
                      Applied to landing URLs in analytics integrations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Which catalog?</CardTitle>
                  <CardDescription>
                    Onboarding captures your company profile and website so we can analyze your site, map
                    product feeds, and label categories. You can update this anytime in{" "}
                    <Link to="/settings" className="text-primary underline underline-offset-2">
                      Settings → Company
                    </Link>
                    .
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Company:</span>{" "}
                    {companyProfile.companyName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Website:</span> {companyProfile.website}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Location:</span>{" "}
                    {[companyProfile.city, companyProfile.country].filter(Boolean).join(", ") ||
                      "Not set — add city and country in Settings → Company"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Primary feed:</span>{" "}
                    {companyProfile.catalogSource ?? defaultCompanyProfile.catalogSource}
                  </p>
                </CardContent>
              </Card>
              <div>
                <p className="text-sm text-muted-foreground">
                  Choose catalog scope for this campaign. &quot;All Products&quot; uses the full synced feed;
                  other tiles narrow delivery to those categories.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors",
                        formData.products.includes(cat.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => toggleInArray("products", cat.id)}
                    >
                      <p className="font-medium">{cat.id}</p>
                      <p className="text-xs text-muted-foreground">{cat.count}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">Exclude from campaign (optional)</p>
                <p className="mb-3 text-sm text-muted-foreground">
                  SKUs or groups to never promote in this campaign.
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXCLUSION_OPTIONS.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        formData.productExclusions.includes(ex)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleInArray("productExclusions", ex)}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Multi-select:</span> choose one or more channels.
                For each channel you enable, you can multi-select surfaces (placements) below it.
              </p>
              <div className="grid gap-4">
                {CHANNEL_DEFS.map((channel) => (
                  <div key={channel.id} className="rounded-lg border">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between p-4 text-left transition-colors",
                        formData.channels.includes(channel.id) ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleChannel(channel.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{channel.name}</p>
                          {channel.id === "shopping" && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{channel.desc}</p>
                      </div>
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          formData.channels.includes(channel.id)
                            ? "border-primary bg-primary"
                            : "border-muted"
                        )}
                      >
                        {formData.channels.includes(channel.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                    {formData.channels.includes(channel.id) && (
                      <div className="space-y-2 border-t px-4 py-3">
                        <p className="text-xs font-medium text-muted-foreground">Surfaces</p>
                        <div className="flex flex-wrap gap-2">
                          {channel.surfaces.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className={cn(
                                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                                (formData.channelSurfaces[channel.id] ?? []).includes(s.id)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50"
                              )}
                              onClick={() => toggleSurface(channel.id, s.id)}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Regions are multi-select.</span> Choose every
                country where ads may be served and billed. This is separate from step 1 &quot;Target
                market&quot;—that sets optimization focus; this list controls geo delivery.
              </p>
              <div>
                <p className="mb-3 text-sm font-medium">Regions</p>
                <div className="grid max-h-[min(420px,50vh)] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3">
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border p-4 text-left transition-colors",
                        formData.regions.includes(region)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => toggleInArray("regions", region)}
                    >
                      <span className="flex min-w-0 items-center gap-2 font-medium">
                        <span className="text-lg leading-none" aria-hidden>
                          {regionFlag(region)}
                        </span>
                        <span className="min-w-0">{region}</span>
                      </span>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2",
                          formData.regions.includes(region) ? "border-primary bg-primary" : "border-muted"
                        )}
                      >
                        {formData.regions.includes(region) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-3 text-sm font-medium">Age</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_BANDS.map((age) => (
                    <button
                      key={age}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm",
                        formData.ageBands.includes(age)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleInArray("ageBands", age)}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm",
                        formData.interests.includes(tag)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleInArray("interests", tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium">Devices</p>
                <div className="flex flex-wrap gap-2">
                  {DEVICE_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm",
                        formData.devices.includes(d)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleInArray("devices", d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
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
                  <Button type="button" variant="secondary" size="sm" onClick={applyAiHeadlines}>
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

          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="py-4 text-center">
                <Rocket className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="text-xl font-semibold">Ready to launch</h2>
                <p className="text-muted-foreground">Review settings below, then launch or save as draft.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Goal & budget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <ReviewRow label="Name" value={formData.name || "—"} />
                    <ReviewRow
                      label="Objective"
                      value={optionLabel(CAMPAIGN_OBJECTIVE_OPTIONS, formData.objective)}
                    />
                    <ReviewRow
                      label="Target market"
                      value={optionLabel(TARGET_MARKET_OPTIONS, formData.targetMarket)}
                    />
                    <ReviewRow
                      label="Campaign type"
                      value={optionLabel(CAMPAIGN_TYPE_OPTIONS, formData.campaignType)}
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
                      label="Bid strategy"
                      value={optionLabel(BID_STRATEGY_OPTIONS, formData.bidStrategy)}
                    />
                    <ReviewRow
                      label="Max CPC"
                      value={formData.maxCpc ? `${currencySymbol}${formData.maxCpc}` : "—"}
                    />
                    <ReviewRow
                      label="Schedule"
                      value={[formData.startDate, formData.endDate].filter(Boolean).join(" → ") || "—"}
                    />
                    <ReviewRow
                      label="Conversion goals"
                      value={
                        formData.conversionGoals
                          .map((id) => CONVERSION_GOAL_OPTIONS.find((g) => g.id === id)?.label)
                          .filter(Boolean)
                          .join(", ") || "—"
                      }
                    />
                    <ReviewRow
                      label="Attribution"
                      value={optionLabel(ATTRIBUTION_OPTIONS, formData.attributionModel)}
                    />
                    <ReviewRow label="UTM prefix" value={formData.utmPrefix || "—"} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Products & channels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <ReviewRow label="Categories" value={formData.products.join(", ") || "—"} />
                    <ReviewRow label="Exclusions" value={formData.productExclusions.join(", ") || "None"} />
                    <ReviewRow label="Channels" value={formData.channels.join(", ") || "—"} />
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">Surfaces: </span>
                      {Object.entries(formData.channelSurfaces)
                        .filter(([, v]) => v.length)
                        .map(([k, v]) => `${k}: ${v.join(", ")}`)
                        .join(" · ") || "—"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Audience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <ReviewRow label="Regions" value={formData.regions.join(", ") || "—"} />
                    <ReviewRow label="Age" value={formData.ageBands.join(", ") || "—"} />
                    <ReviewRow label="Interests" value={formData.interests.join(", ") || "—"} />
                    <ReviewRow label="Devices" value={formData.devices.join(", ") || "—"} />
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
