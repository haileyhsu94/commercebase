import { useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Link2,
  MousePointerClick,
  Plus,
  Rocket,
  Save,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Target,
  Trash2,
  UserPlus,
  Video,
  X,
  Zap,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/ui/date-picker"
import { AdPreview } from "@/components/campaigns/AdPreview"
import { CampaignPlanAllowanceBanner } from "@/components/campaigns/CampaignPlanAllowanceBanner"
import { getCompanyProfile, siteHostname } from "@/lib/company-profile"
import { COUNTRIES, CITIES } from "@/lib/location-options"
import { regionFlag } from "@/lib/region-flags"
import { cn } from "@/lib/utils"
import {
  addLaunchedCampaign,
  getMergedCampaigns,
  makeNewCampaignRow,
  wizardFormFromCampaign,
} from "@/lib/campaign-storage"
import {
  BIDDING_FOCUS_OPTIONS,
  CALL_TO_ACTION_OPTIONS,
  CAMPAIGN_OBJECTIVE_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  LISTING_GROUP_CATEGORIES,
  LOCATION_PRESENCE_OPTIONS,
  OBJECTIVE_CONVERSION_GOAL_DEFAULTS,
  initialCampaignWizardForm,
  type CampaignWizardFormData,
} from "@/types/campaign-wizard"

/* ------------------------------------------------------------------ */
/* Step map — mirrors the Google Ads Performance Max setup left-rail. */
/* ------------------------------------------------------------------ */

type StepDef = {
  id: number
  title: string
  /** Short sub-label shown under the step title in the rail. */
  caption: string
  /** Optional scroll-anchor sub-items revealed under the current step. */
  subItems?: string[]
}

const STEPS: StepDef[] = [
  { id: 1, title: "Objective", caption: "Goal, type, products, name" },
  {
    id: 2,
    title: "Bidding",
    caption: "Focus, target, customer acquisition",
    subItems: ["Bidding", "Customer acquisition"],
  },
  {
    id: 3,
    title: "Campaign settings",
    caption: "Locations, languages, more",
    subItems: ["Locations", "Languages", "EU political ads"],
  },
  {
    id: 4,
    title: "Asset generation",
    caption: "Let AI generate assets",
    subItems: ["Asset generation"],
  },
  {
    id: 5,
    title: "Asset group",
    caption: "Assets, brand, audience signal",
    subItems: [
      "Name",
      "Listing groups",
      "Brand guidelines",
      "Assets",
      "Asset optimization",
      "Search themes",
      "Audience signal",
    ],
  },
  { id: 6, title: "Budget", caption: "Average daily budget" },
  { id: 7, title: "Review", caption: "Review and publish" },
]
const STEP_COUNT = STEPS.length

/* ------------------------------------------------------------------ */
/* Static option catalogs                                             */
/* ------------------------------------------------------------------ */

const OBJECTIVE_ICONS = {
  sales: ShoppingBag,
  leads: UserPlus,
  website_traffic: Sparkles,
  app_promotion: Smartphone,
  awareness_consideration: Video,
  local_store_visits: Store,
  no_goal_guidance: CircleHelp,
} as const

const CAMPAIGN_TYPE_ICONS = {
  performance_max: Target,
  shopping: ShoppingCart,
  demand_gen: Zap,
  search: MousePointerClick,
  video: Video,
  display: Eye,
} as const

const CONVERSION_GOAL_CATALOG = [
  {
    id: "purchase",
    label: "Purchase",
    category: "Sales",
    description: "Completed orders and revenue events.",
    actionCount: 2,
    value: "Multiple values",
  },
  {
    id: "add_to_cart",
    label: "Add to cart",
    category: "Sales",
    description: "Cart adds for mid-funnel optimization.",
    actionCount: 1,
    value: "$4.00",
  },
  {
    id: "begin_checkout",
    label: "Begin checkout",
    category: "Sales",
    description: "Shoppers who reached the checkout step.",
    actionCount: 1,
    value: "$8.00",
  },
  {
    id: "lead",
    label: "Submit lead form",
    category: "Leads",
    description: "Qualified leads from forms and CRM goals.",
    actionCount: 1,
    value: "$12.00",
  },
  {
    id: "signup",
    label: "Sign up",
    category: "Leads",
    description: "Newsletter and account subscribers.",
    actionCount: 1,
    value: "$1.00",
  },
  {
    id: "contact",
    label: "Contact",
    category: "Leads",
    description: "Phone calls, emails, and contact events.",
    actionCount: 2,
    value: "Multiple values",
  },
  {
    id: "page_view",
    label: "Page view",
    category: "Website traffic",
    description: "Key landing page and content views.",
    actionCount: 1,
    value: "$0.50",
  },
  {
    id: "app_install",
    label: "App install",
    category: "App",
    description: "First-time application installs.",
    actionCount: 1,
    value: "$2.00",
  },
  {
    id: "store_visit",
    label: "Store visit",
    category: "Local",
    description: "Visits to your physical stores.",
    actionCount: 1,
    value: "$15.00",
  },
] as const

const MERCHANT_ACCOUNTS = [
  { id: "459437978", name: "Realry" },
  { id: "312045721", name: "Realry — Europe" },
  { id: "289104776", name: "Realry — APAC" },
]

/**
 * Mock reach data shown in the Google Ads-style location autocomplete.
 * `kind` differentiates country / state / city for the dropdown badge.
 *
 * The list is built from the curated COUNTRIES and CITIES catalogs in
 * `lib/location-options.ts`, plus a few US states and a handful of
 * realistic real-world reach overrides for the most common picks.
 */
type LocationReach = {
  name: string
  kind: "country" | "state" | "city"
  reach: number | null
  limited?: boolean
}

/** Realistic reach numbers for the most-searched locations. Falls back to deterministic mock for everything else. */
const REACH_OVERRIDES: Record<string, number | null> = {
  "United States": 321_000_000,
  "United Kingdom": 65_300_000,
  Canada: 38_500_000,
  Germany: 83_100_000,
  France: 67_200_000,
  Japan: 125_000_000,
  "South Korea": 51_800_000,
  Singapore: 5_900_000,
  Australia: 25_700_000,
  Mexico: 128_000_000,
  Brazil: 215_000_000,
  India: 1_400_000_000,
  China: 1_400_000_000,
  Indonesia: 273_000_000,
  Italy: 60_400_000,
  Spain: 47_400_000,
  Netherlands: 17_400_000,
  Ireland: 5_000_000,
  "United Arab Emirates": 9_900_000,
  Ukraine: 25_300_000,
  Sweden: 10_400_000,
  Norway: 5_400_000,
  Finland: 5_500_000,
  Denmark: 5_800_000,
  Poland: 38_000_000,
  Switzerland: 8_700_000,
  Austria: 9_000_000,
  Belgium: 11_500_000,
  Portugal: 10_300_000,
  Greece: 10_400_000,
  "South Africa": 60_400_000,
  Argentina: 45_400_000,
  Chile: 19_100_000,
  Colombia: 51_500_000,
  "New Zealand": 5_100_000,
  Israel: 9_400_000,
  Turkey: 84_300_000,
  Thailand: 70_000_000,
  Vietnam: 97_300_000,
  Malaysia: 32_700_000,
  Philippines: 109_000_000,
  Pakistan: 220_000_000,
  Bangladesh: 165_000_000,
  Nigeria: 213_000_000,
  Egypt: 102_000_000,
  "Saudi Arabia": 35_000_000,
  "Hong Kong": 7_500_000,
  Taiwan: 23_800_000,
}

/** Deterministic pseudo-random reach so every location feels populated even without an override. */
function mockReach(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash * 31) + name.charCodeAt(i)) | 0
  }
  const positive = Math.abs(hash)
  return 200_000 + (positive % 80_000_000)
}

function makeLocationEntry(
  name: string,
  kind: "country" | "city" | "state"
): LocationReach {
  const override = name in REACH_OVERRIDES ? REACH_OVERRIDES[name] : undefined
  return {
    name,
    kind,
    reach: override !== undefined ? override : mockReach(name),
  }
}

const LOCATION_REACH_MOCKS: LocationReach[] = [
  ...COUNTRIES.map((c) => makeLocationEntry(c, "country")),
  ...CITIES.map((c) => makeLocationEntry(c, "city")),
  // Common US states to demonstrate sub-national targeting
  ...[
    "California, United States",
    "New York, United States",
    "Texas, United States",
    "Florida, United States",
    "Georgia, United States",
    "Illinois, United States",
    "Massachusetts, United States",
    "Washington, United States",
  ].map((s) => makeLocationEntry(s, "state")),
  // Edge case to surface the "Limited reach" warning UI
  {
    name: "United States Minor Outlying Islands",
    kind: "country",
    reach: null,
    limited: true,
  },
]

/** "Related locations" suggestions in the search dropdown. */
const RELATED_LOCATION_MOCKS = [
  { name: "Bavaria, Germany", kind: "state" as const, reach: 17_000_000 },
  { name: "Udaipur, Rajasthan, India", kind: "city" as const, reach: 7_130_000 },
  { name: "New South Wales, Australia", kind: "state" as const, reach: 10_000_000 },
]

const INTEREST_CATEGORIES = [
  "Fashion & style",
  "Luxury shoppers",
  "Sports & fitness",
  "Streetwear",
  "Sustainability",
  "Travel",
  "Technology",
  "Home & garden",
]

const CUSTOMER_LIST_MOCKS = [
  { id: "all_customers", name: "All customers (12,480)", type: "Customer list" },
  { id: "repeat_buyers", name: "Repeat buyers (3,120)", type: "Customer list" },
  { id: "cart_abandoners", name: "Cart abandoners (890)", type: "Website visitors" },
  { id: "lookback_30d", name: "All visitors · 30 days (28,500)", type: "Website visitors" },
]

const AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]

const HEADLINE_MAX = 30
const LONG_HEADLINE_MAX = 90
const DESCRIPTION_MAX = 90
const BUSINESS_NAME_MAX = 25

/* ------------------------------------------------------------------ */
/* Component props                                                    */
/* ------------------------------------------------------------------ */

export type CampaignCreateProps = {
  embedded?: boolean
  onClose?: () => void
  duplicateSourceId?: string | null
}

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function joined(values: string[], fallback = "—") {
  return values.length ? values.join(", ") : fallback
}

function defaultCampaignName(objective: string, campaignType: string): string {
  if (!objective || !campaignType) return ""
  const obj = labelFor(CAMPAIGN_OBJECTIVE_OPTIONS, objective)
  const type = labelFor(CAMPAIGN_TYPE_OPTIONS, campaignType)
  const suffix = Math.floor(Math.random() * 900 + 100)
  return `${obj}-${type}-${suffix}`
}

/* ================================================================== */
/* CampaignCreate                                                     */
/* ================================================================== */

export function CampaignCreate({
  embedded = false,
  onClose,
  duplicateSourceId = null,
}: CampaignCreateProps = {}) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [maxVisited, setMaxVisited] = useState<number>(1)
  const [stepError, setStepError] = useState<string>("")
  const [nameTouched, setNameTouched] = useState<boolean>(false)
  /*
   * Parent re-keys this component on duplicateSourceId, so a lazy initializer
   * is enough to seed from a copied campaign without an effect.
   */
  const [formData, setFormData] = useState<CampaignWizardFormData>(() => {
    const base: CampaignWizardFormData = {
      ...initialCampaignWizardForm,
      campaignType: "performance_max",
      locationPresence: "presence_interest",
      languages: ["en"],
      regions: ["United States"],
    }
    if (!duplicateSourceId) return base
    const source = getMergedCampaigns().find((campaign) => campaign.id === duplicateSourceId)
    if (!source) return base
    return { ...base, ...wizardFormFromCampaign(source) }
  })

  const companyProfile = useMemo(() => getCompanyProfile(), [])

  /* ---------------- derived state ---------------- */

  const currency = CURRENCY_OPTIONS.find((c) => c.value === formData.currency) ??
    CURRENCY_OPTIONS[1]
  const currencySymbol = currency.symbol
  const effectiveFinalUrl = (formData.finalUrl || companyProfile.website || "").trim()
  const hostname = effectiveFinalUrl ? siteHostname(effectiveFinalUrl) : "yourbrand.com"

  const dailyBudgetNumber = Number(formData.budget || 0)
  const monthlyBudgetEstimate = Number.isFinite(dailyBudgetNumber)
    ? Math.round(dailyBudgetNumber * 30.4)
    : 0

  /* ---------------- state helpers ---------------- */

  const update = <K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleInArray = (key: keyof CampaignWizardFormData, value: string) => {
    setFormData((prev) => {
      const list = prev[key] as string[]
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      }
    })
  }

  const addUrl = (key: "assetImageUrls" | "assetLogoUrls" | "assetVideoUrls", url: string) => {
    if (!url.trim()) return
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], url.trim()] }))
  }

  const removeUrl = (
    key: "assetImageUrls" | "assetLogoUrls" | "assetVideoUrls",
    index: number
  ) => {
    setFormData((prev) => {
      const copy = [...prev[key]]
      copy.splice(index, 1)
      return { ...prev, [key]: copy }
    })
  }

  const handleObjectiveChange = (value: string) => {
    setFormData((prev) => {
      const defaults = OBJECTIVE_CONVERSION_GOAL_DEFAULTS[value] ?? []
      const nextGoals =
        prev.conversionGoals.length === 0 && defaults.length ? defaults : prev.conversionGoals
      const nextName =
        !nameTouched && prev.campaignType
          ? defaultCampaignName(value, prev.campaignType)
          : prev.name
      return {
        ...prev,
        objective: value,
        conversionGoals: nextGoals,
        name: nextName,
      }
    })
  }

  const handleCampaignTypeChange = (value: string) => {
    setFormData((prev) => {
      const nextName =
        !nameTouched && prev.objective
          ? defaultCampaignName(prev.objective, value)
          : prev.name
      return {
        ...prev,
        campaignType: value,
        name: nextName,
      }
    })
  }

  const handleNameChange = (value: string) => {
    setNameTouched(true)
    update("name", value)
  }

  /* ---------------- navigation ---------------- */

  const validateStep = (step: number): string => {
    if (step === 1) {
      if (!formData.objective) return "Select a campaign objective to continue."
      if (
        formData.objective !== "no_goal_guidance" &&
        formData.conversionGoals.length === 0
      ) {
        return "Select at least one conversion goal."
      }
      if (!formData.campaignType) return "Select a campaign type to continue."
      if (!formData.name.trim()) return "Enter a campaign name to continue."
    }
    if (step === 2 && !formData.biddingFocus) {
      return "Choose what you want to focus on."
    }
    if (step === 3) {
      if (
        formData.locationMode === "custom" &&
        formData.regions.length === 0
      ) {
        return "Add at least one targeted location."
      }
      if (formData.languages.length === 0) {
        return "Add at least one language."
      }
      if (!formData.euPoliticalAds) {
        return "Answer the EU political ads question."
      }
    }
    if (step === 5) {
      if (!formData.assetGroupName.trim()) return "Give the asset group a name."
      if (
        formData.listingGroupsMode === "selection" &&
        formData.listingGroupCategories.length === 0
      ) {
        return "Pick at least one listing group or switch to all products."
      }
      if (!formData.finalUrl.trim()) return "Add a Final URL for the asset group."
      if (!formData.headline.trim()) return "Add a headline."
      if (!formData.longHeadline.trim()) return "Add a long headline."
      if (!formData.adDescription.trim()) return "Add a description."
      if (formData.brandIdentityUseBusinessName && !formData.businessName.trim()) {
        return "Add a business name (or switch off the Brand identity option)."
      }
    }
    if (step === 6 && (!formData.currency || !formData.budget)) {
      return "Select a currency and set an average daily budget."
    }
    return ""
  }

  const goTo = (id: number) => {
    if (id > maxVisited) return
    setCurrentStep(id)
    setStepError("")
  }

  const next = () => {
    const err = validateStep(currentStep)
    if (err) {
      setStepError(err)
      return
    }
    setStepError("")

    const nextStep = Math.min(STEP_COUNT, currentStep + 1)
    setCurrentStep(nextStep)
    setMaxVisited((m) => Math.max(m, nextStep))
  }

  const back = () => {
    setStepError("")
    setCurrentStep((step) => Math.max(1, step - 1))
  }

  const exit = () => {
    if (embedded) onClose?.()
    else navigate("/campaigns")
  }

  const launch = () => {
    const err = validateStep(6)
    if (err) {
      setStepError(err)
      setCurrentStep(6)
      return
    }
    addLaunchedCampaign(
      makeNewCampaignRow(
        formData.name.trim() || "Untitled campaign",
        currencySymbol,
        { ...formData }
      )
    )
    exit()
  }

  /* ================================================================ */
  /* Render                                                           */
  /* ================================================================ */

  return (
    <>
      {/* -------- Header -------- */}
      <div
        className={cn(
          "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
          embedded && "pt-0"
        )}
      >
        <div className="flex items-center gap-3">
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
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              New campaign
            </p>
            <h1
              className={cn(
                "font-semibold tracking-tight",
                embedded ? "text-xl" : "text-2xl"
              )}
            >
              {formData.name.trim() || "Untitled campaign"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exit}>
            <Save className="mr-2 h-4 w-4" />
            Save draft
          </Button>
        </div>
      </div>

      <CampaignPlanAllowanceBanner compact />

      {/* -------- Two-pane layout -------- */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Left rail (desktop) */}
        <aside className="hidden lg:block">
          <StepperRail
            steps={STEPS}
            currentStep={currentStep}
            maxVisited={maxVisited}
            onSelect={goTo}
          />
        </aside>

        {/* Main column */}
        <div className="min-w-0">
          {/* Mobile progress */}
          <MobileStepper
            steps={STEPS}
            currentStep={currentStep}
            className="mb-4 lg:hidden"
          />

          {stepError && (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {stepError}
            </p>
          )}

          <Card className="mb-4">
            <CardContent className="space-y-8">
              {currentStep === 1 && (
                <StepObjective
                  objective={formData.objective}
                  campaignType={formData.campaignType}
                  conversionGoals={formData.conversionGoals}
                  merchantAccountId={formData.merchantAccountId}
                  advertiseMerchantProducts={formData.advertiseMerchantProducts}
                  name={formData.name}
                  onObjectiveChange={handleObjectiveChange}
                  onCampaignTypeChange={handleCampaignTypeChange}
                  onToggleConversionGoal={(id) => toggleInArray("conversionGoals", id)}
                  onMerchantAccountChange={(v) => update("merchantAccountId", v)}
                  onAdvertiseMerchantChange={(v) => update("advertiseMerchantProducts", v)}
                  onNameChange={handleNameChange}
                />
              )}

              {currentStep === 2 && (
                <StepBidding
                  focus={formData.biddingFocus}
                  targetCpa={formData.biddingTargetCpa}
                  targetRoas={formData.biddingTargetRoas}
                  newCustomer={formData.newCustomerAcquisition}
                  useTargetCpa={formData.useTargetCpa}
                  useTargetRoas={formData.useTargetRoas}
                  customerAcquisitionEnabled={formData.customerAcquisitionEnabled}
                  currencySymbol={currencySymbol}
                  onFocusChange={(v) => update("biddingFocus", v)}
                  onTargetCpaChange={(v) => update("biddingTargetCpa", v)}
                  onTargetRoasChange={(v) => update("biddingTargetRoas", v)}
                  onNewCustomerChange={(v) => update("newCustomerAcquisition", v)}
                  onUseTargetCpaChange={(v) => update("useTargetCpa", v)}
                  onUseTargetRoasChange={(v) => update("useTargetRoas", v)}
                  onCustomerAcquisitionEnabledChange={(v) =>
                    update("customerAcquisitionEnabled", v)
                  }
                />
              )}

              {currentStep === 3 && (
                <StepCampaignSettings
                  locationMode={formData.locationMode}
                  locations={formData.regions}
                  locationPresence={formData.locationPresence}
                  languages={formData.languages}
                  euPoliticalAds={formData.euPoliticalAds}
                  finalUrl={formData.finalUrl}
                  finalUrlExpansion={formData.finalUrlExpansion}
                  adScheduleMode={formData.adScheduleMode}
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  devices={formData.devices}
                  brandExclusions={formData.brandExclusions}
                  demographicExclusions={formData.demographicExclusions}
                  dataExclusions={formData.dataExclusions}
                  utmPrefix={formData.utmPrefix}
                  companySite={companyProfile.website}
                  homeCountry={companyProfile.country || "United States"}
                  onLocationModeChange={(v) => update("locationMode", v)}
                  onToggleLocation={(v) => toggleInArray("regions", v)}
                  onLocationPresenceChange={(v) => update("locationPresence", v)}
                  onToggleLanguage={(v) => toggleInArray("languages", v)}
                  onEuPoliticalAdsChange={(v) => update("euPoliticalAds", v)}
                  onFinalUrlChange={(v) => update("finalUrl", v)}
                  onFinalUrlExpansionChange={(v) => update("finalUrlExpansion", v)}
                  onAdScheduleModeChange={(v) => update("adScheduleMode", v)}
                  onStartDateChange={(v) => update("startDate", v)}
                  onEndDateChange={(v) => update("endDate", v)}
                  onToggleDevice={(v) => toggleInArray("devices", v)}
                  onBrandExclusionsChange={(v) => update("brandExclusions", v)}
                  onDemographicExclusionsChange={(v) => update("demographicExclusions", v)}
                  onDataExclusionsChange={(v) => update("dataExclusions", v)}
                  onUtmChange={(v) => update("utmPrefix", v)}
                />
              )}

              {currentStep === 4 && (
                <StepAssetGeneration
                  finalUrl={formData.finalUrl}
                  generated={formData.assetGenerationEnabled}
                  hostname={hostname}
                  onFinalUrlChange={(v) => update("finalUrl", v)}
                  onGenerate={() => {
                    update("assetGenerationEnabled", true)
                    next()
                  }}
                  onSkip={() => {
                    update("assetGenerationEnabled", false)
                    next()
                  }}
                  onBack={back}
                />
              )}

              {currentStep === 5 && (
                <StepAssetGroup
                  formData={formData}
                  hostname={hostname}
                  merchantAccountId={formData.merchantAccountId}
                  update={update}
                  toggleInArray={toggleInArray}
                  addUrl={addUrl}
                  removeUrl={removeUrl}
                />
              )}

              {currentStep === 6 && (
                <StepBudget
                  currency={formData.currency}
                  budget={formData.budget}
                  monthlyEstimate={monthlyBudgetEstimate}
                  currencySymbol={currencySymbol}
                  onCurrencyChange={(v) => update("currency", v)}
                  onBudgetChange={(v) => update("budget", v)}
                />
              )}

              {currentStep === 7 && (
                <StepSummary
                  formData={formData}
                  hostname={hostname}
                  currencySymbol={currencySymbol}
                  onEdit={(step) => goTo(step)}
                />
              )}
            </CardContent>
          </Card>

          {/* -------- Footer actions --------
              Step 4 (Asset generation) provides its own footer
              (Skip / Back / Generate assets) inside the step content. */}
          {currentStep !== 4 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" onClick={back} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button variant="ghost" onClick={exit}>
                  Cancel
                </Button>
                {currentStep < STEP_COUNT ? (
                  <Button onClick={next}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={launch}>
                    <Rocket className="mr-2 h-4 w-4" />
                    Publish campaign
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ================================================================== */
/* Stepper rail                                                       */
/* ================================================================== */

function StepperRail({
  steps,
  currentStep,
  maxVisited,
  onSelect,
}: {
  steps: StepDef[]
  currentStep: number
  maxVisited: number
  onSelect: (id: number) => void
}) {
  return (
    <ol className="space-y-1">
      {steps.map((step) => {
        const isCurrent = step.id === currentStep
        const isCompleted = step.id < currentStep
        const isClickable = step.id <= maxVisited
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => isClickable && onSelect(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                isCurrent && "bg-primary/5",
                isClickable && !isCurrent && "hover:bg-muted",
                !isClickable && "cursor-not-allowed opacity-60"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary/40 bg-primary/10 text-primary",
                  !isCurrent && !isCompleted && "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm",
                    isCurrent ? "font-semibold text-foreground" : "text-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {step.caption}
                </span>
              </span>
            </button>

            {/* Sub-items (scroll anchors) for the current step */}
            {isCurrent && step.subItems && step.subItems.length > 0 && (
              <ol className="ml-6 mt-1 space-y-0.5 border-l border-border pl-3">
                {step.subItems.map((label, i) => (
                  <li key={label}>
                    <a
                      href={`#step-sub-${step.id}-${i}`}
                      className={cn(
                        "block rounded-md px-2 py-1 text-xs",
                        i === 0
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function MobileStepper({
  steps,
  currentStep,
  className,
}: {
  steps: StepDef[]
  currentStep: number
  className?: string
}) {
  const progress = (currentStep / steps.length) * 100
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
        </span>
        <span className="font-medium text-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

/* ================================================================== */
/* Step 1 · Objective (Google Ads progressive-disclosure setup page)  */
/* ================================================================== */

function StepObjective({
  objective,
  campaignType,
  conversionGoals,
  merchantAccountId,
  advertiseMerchantProducts,
  name,
  onObjectiveChange,
  onCampaignTypeChange,
  onToggleConversionGoal,
  onMerchantAccountChange,
  onAdvertiseMerchantChange,
  onNameChange,
}: {
  objective: string
  campaignType: string
  conversionGoals: string[]
  merchantAccountId: string
  advertiseMerchantProducts: boolean
  name: string
  onObjectiveChange: (value: string) => void
  onCampaignTypeChange: (value: string) => void
  onToggleConversionGoal: (id: string) => void
  onMerchantAccountChange: (value: string) => void
  onAdvertiseMerchantChange: (value: boolean) => void
  onNameChange: (value: string) => void
}) {
  const objectiveLabel = labelFor(CAMPAIGN_OBJECTIVE_OPTIONS, objective) || "your goal"
  /* Reveal sections one at a time, matching Google Ads. */
  const showGoals = Boolean(objective) && objective !== "no_goal_guidance"
  const showCampaignType = Boolean(objective)
  const showProducts =
    Boolean(campaignType) &&
    (campaignType === "performance_max" || campaignType === "shopping")
  const showName = Boolean(campaignType)

  return (
    <div className="space-y-8">
      {/* ---- Choose your objective ---- */}
      <SetupCard
        title="Choose your objective"
        subtitle="Select an objective to tailor your experience to the goals and settings that will work best for your campaign"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPAIGN_OBJECTIVE_OPTIONS.map((option) => {
            const Icon =
              OBJECTIVE_ICONS[option.value as keyof typeof OBJECTIVE_ICONS] ?? CircleHelp
            const selected = objective === option.value
            const note = "note" in option ? option.note : undefined
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onObjectiveChange(option.value)}
                className={cn(
                  "relative flex flex-col rounded-lg border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40"
                )}
              >
                {selected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <Icon className={cn("mb-3 h-5 w-5", selected ? "text-primary" : "text-foreground")} />
                <p className={cn("font-medium", selected && "text-primary")}>{option.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
              </button>
            )
          })}
        </div>
      </SetupCard>

      {/* ---- Conversion goals (revealed after objective) ---- */}
      {showGoals && (
        <SetupCard title={`Use these conversion goals to improve ${objectiveLabel}`}>
          <p className="text-sm text-muted-foreground">
            Conversion goals labeled as account default will use data from all of your campaigns to
            improve your bid strategy and campaign performance, even if they don't seem directly
            related to {objectiveLabel}.
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border">
            <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="col-span-5">Conversion Goals</span>
              <span className="col-span-2">Conversion Source</span>
              <span className="col-span-2">Conversion Actions</span>
              <span className="col-span-2">Value</span>
              <span className="col-span-1" aria-hidden="true" />
            </div>
            {CONVERSION_GOAL_CATALOG.map((goal) => {
              const included = conversionGoals.includes(goal.id)
              return (
                <div
                  key={goal.id}
                  className={cn(
                    "grid grid-cols-12 items-center gap-2 border-b px-4 py-3 text-sm last:border-b-0",
                    included && "bg-primary/5"
                  )}
                >
                  <div className="col-span-5">
                    <p className="font-medium">
                      {goal.label}{" "}
                      <span className="font-normal text-muted-foreground">(account default)</span>
                    </p>
                  </div>
                  <div className="col-span-2 text-muted-foreground">Website</div>
                  <div className="col-span-2 text-primary underline-offset-2 hover:underline cursor-default">
                    {goal.actionCount} action{goal.actionCount === 1 ? "" : "s"}
                  </div>
                  <div className="col-span-2 text-muted-foreground">{goal.value}</div>
                  <div className="col-span-1 flex justify-end">
                    <Switch
                      checked={included}
                      onCheckedChange={() => onToggleConversionGoal(goal.id)}
                      aria-label={`Include ${goal.label}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Add goal
          </button>
        </SetupCard>
      )}

      {/* ---- Campaign type (revealed after objective) ---- */}
      {showCampaignType && (
        <SetupCard title="Select a campaign type">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAMPAIGN_TYPE_OPTIONS.map((option) => {
              const Icon =
                CAMPAIGN_TYPE_ICONS[option.value as keyof typeof CAMPAIGN_TYPE_ICONS] ?? Target
              const selected = campaignType === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onCampaignTypeChange(option.value)}
                  className={cn(
                    "relative flex flex-col rounded-lg border p-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <Icon className={cn("mb-3 h-5 w-5", selected ? "text-primary" : "text-foreground")} />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("font-medium", selected && "text-primary")}>{option.label}</p>
                    {option.value === "performance_max" && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                </button>
              )
            })}
          </div>
        </SetupCard>
      )}

      {/* ---- Add products (revealed after campaign type, only for PMax/Shopping) ---- */}
      {showProducts && (
        <SetupCard title="Add products to this campaign">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              checked={advertiseMerchantProducts}
              onChange={(e) => onAdvertiseMerchantChange(e.target.checked)}
            />
            <span className="text-sm">Advertise products from a Merchant Center account</span>
          </label>

          {advertiseMerchantProducts && (
            <div className="mt-4 space-y-2 pl-7">
              <label className="flex items-center gap-1 text-sm text-muted-foreground">
                Select a Merchant Center account <CircleHelp className="h-3.5 w-3.5" />
              </label>
              <Select
                value={merchantAccountId}
                onValueChange={(v) => onMerchantAccountChange(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {MERCHANT_ACCOUNTS.map((acct) => (
                    <SelectItem key={acct.id} value={acct.id}>
                      {acct.id} - {acct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All products from the selected account will be available to advertise in this
                campaign.{" "}
                <button type="button" className="text-primary hover:underline">
                  Select a feed label
                </button>
              </p>
            </div>
          )}
        </SetupCard>
      )}

      {/* ---- Campaign name (revealed after campaign type) ---- */}
      {showName && (
        <SetupCard title="Campaign name">
          <label htmlFor="campaign-name" className="sr-only">
            Campaign name
          </label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </SetupCard>
      )}
    </div>
  )
}

/** Sub-card matching Google Ads' nested panels in the objective setup page. */
function SetupCard({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 rounded-xl border bg-card">
      <header className="border-b px-5 py-4">
        <h3 className="text-base font-medium">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

/* ================================================================== */
/* Step 4 · Bidding                                                   */
/* ================================================================== */

function StepBidding({
  focus,
  targetCpa,
  targetRoas,
  newCustomer,
  useTargetCpa,
  useTargetRoas,
  customerAcquisitionEnabled,
  currencySymbol,
  onFocusChange,
  onTargetCpaChange,
  onTargetRoasChange,
  onNewCustomerChange,
  onUseTargetCpaChange,
  onUseTargetRoasChange,
  onCustomerAcquisitionEnabledChange,
}: {
  focus: string
  targetCpa: string
  targetRoas: string
  newCustomer: string
  useTargetCpa: boolean
  useTargetRoas: boolean
  customerAcquisitionEnabled: boolean
  currencySymbol: string
  onFocusChange: (v: string) => void
  onTargetCpaChange: (v: string) => void
  onTargetRoasChange: (v: string) => void
  onNewCustomerChange: (v: string) => void
  onUseTargetCpaChange: (v: boolean) => void
  onUseTargetRoasChange: (v: boolean) => void
  onCustomerAcquisitionEnabledChange: (v: boolean) => void
}) {
  const isConversions = focus === "conversions"
  const isConversionValue = focus === "conversion_value"

  return (
    <div className="space-y-6">
      {/* ---- Bidding card ---- */}
      <SetupCard id="step-sub-2-0" title="Bidding">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium">
              What do you want to focus on? <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
            </label>
            <Select value={focus} onValueChange={(v) => onFocusChange(v ?? "")}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="conversion_value">Conversion value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional target-CPA / target-ROAS checkbox + input */}
          {isConversions && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={useTargetCpa}
                  onChange={(e) => onUseTargetCpaChange(e.target.checked)}
                />
                Set a target cost per action (optional)
              </label>
              {useTargetCpa && (
                <div className="pl-6">
                  <label className="flex items-center gap-1 text-sm text-muted-foreground">
                    Target CPA <CircleHelp className="h-3.5 w-3.5" />
                  </label>
                  <div className="mt-1 flex items-center">
                    <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted/30 px-3 text-sm text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      placeholder="25.00"
                      value={targetCpa}
                      onChange={(event) => onTargetCpaChange(event.target.value)}
                      className="max-w-[180px] rounded-l-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {isConversionValue && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={useTargetRoas}
                  onChange={(e) => onUseTargetRoasChange(e.target.checked)}
                />
                Set a target return on ad spend (optional)
              </label>
              {useTargetRoas && (
                <div className="pl-6">
                  <label className="flex items-center gap-1 text-sm text-muted-foreground">
                    Target ROAS <CircleHelp className="h-3.5 w-3.5" />
                  </label>
                  <div className="mt-1 flex items-center">
                    <Input
                      type="number"
                      min={0}
                      placeholder="195"
                      value={targetRoas}
                      onChange={(event) => onTargetRoasChange(event.target.value)}
                      className="max-w-[140px] rounded-r-none"
                    />
                    <span className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted/30 px-3 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendation callout */}
          {isConversionValue && !useTargetRoas && (
            <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <p className="text-sm">
                  <span className="font-medium">Set a target ROAS:</span> Get more conversion value
                  at a similar ROAS by setting a target and staying unconstrained by budget{" "}
                  <CircleHelp className="inline h-3.5 w-3.5 text-muted-foreground" />
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUseTargetRoasChange(true)}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                Apply
              </button>
            </div>
          )}
          {isConversions && !useTargetCpa && (
            <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <p className="text-sm">
                  <span className="font-medium">Set a target CPA:</span> Get more conversions at a
                  similar cost per action by setting a target{" "}
                  <CircleHelp className="inline h-3.5 w-3.5 text-muted-foreground" />
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUseTargetCpaChange(true)}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </SetupCard>

      {/* ---- Customer acquisition card ---- */}
      <SetupCard id="step-sub-2-1" title="Customer acquisition">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={customerAcquisitionEnabled}
                onChange={(e) => onCustomerAcquisitionEnabledChange(e.target.checked)}
              />
              <span>Adjust your bidding to help acquire new customers</span>
            </label>

            {customerAcquisitionEnabled && (
              <div className="mt-4 space-y-3 pl-6">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                    newCustomer === "value"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40"
                  )}
                >
                  <input
                    type="radio"
                    name="newCustomer"
                    value="value"
                    checked={newCustomer === "value"}
                    onChange={() => onNewCustomerChange("value")}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Bid higher for new customers (recommended)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your campaign will help you acquire new customers, while driving overall
                      purchases by reaching all customers
                    </p>
                    {newCustomer === "value" && (
                      <div className="mt-3 space-y-3">
                        <Select defaultValue="account">
                          <SelectTrigger className="w-[240px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account">Using account level settings</SelectItem>
                            <SelectItem value="campaign">Custom value for this campaign</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="overflow-hidden rounded-lg border">
                          <div className="grid grid-cols-2 gap-2 border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                            <span>Customer type</span>
                            <span className="text-right">Incremental conversion value</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-b px-4 py-2 text-sm">
                            <span>New customers</span>
                            <span className="text-right">{currencySymbol}282</span>
                          </div>
                          <div className="grid grid-cols-2 items-center gap-2 px-4 py-2 text-sm">
                            <span className="flex items-center gap-2">
                              New customers (high value)
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                New
                              </Badge>
                            </span>
                            <span className="text-right text-muted-foreground">Not set</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Edit account level settings
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                    newCustomer === "only"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40"
                  )}
                >
                  <input
                    type="radio"
                    name="newCustomer"
                    value="only"
                    checked={newCustomer === "only"}
                    onChange={() => onNewCustomerChange("only")}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Only bid for new customers</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your campaign will be limited to only new customers, regardless of your bid
                      strategy
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <aside className="rounded-lg bg-muted/20 p-4 text-xs text-muted-foreground lg:bg-transparent lg:p-0">
            By default, your campaign bids equally for new and existing customers. However, you can
            configure your customer acquisition settings to optimize for acquiring new customers.{" "}
            <a href="#" className="text-primary hover:underline">
              Learn more about customer acquisition
            </a>
          </aside>
        </div>
      </SetupCard>
    </div>
  )
}

function RadioRow({
  name,
  value,
  selected,
  title,
  description,
  onChange,
}: {
  name: string
  value: string
  selected: string
  title: string
  description?: string
  onChange: (v: string) => void
}) {
  const checked = value === selected
  const id = `${name}-${value}`
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-primary bg-primary/5" : "hover:border-primary/50"
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
    </label>
  )
}

/* ================================================================== */
/* Step 5 · Campaign settings                                         */
/* ================================================================== */

function StepCampaignSettings({
  locationMode,
  locations,
  locationPresence,
  languages,
  euPoliticalAds,
  finalUrl,
  finalUrlExpansion,
  adScheduleMode,
  startDate,
  endDate,
  devices,
  brandExclusions,
  demographicExclusions,
  dataExclusions,
  utmPrefix,
  companySite,
  homeCountry,
  onLocationModeChange,
  onToggleLocation,
  onLocationPresenceChange,
  onToggleLanguage,
  onEuPoliticalAdsChange,
  onFinalUrlChange,
  onFinalUrlExpansionChange,
  onAdScheduleModeChange,
  onStartDateChange,
  onEndDateChange,
  onToggleDevice,
  onBrandExclusionsChange,
  onDemographicExclusionsChange,
  onDataExclusionsChange,
  onUtmChange,
}: {
  locationMode: "all" | "home" | "custom"
  locations: string[]
  locationPresence: string
  languages: string[]
  euPoliticalAds: "" | "yes" | "no"
  finalUrl: string
  finalUrlExpansion: boolean
  adScheduleMode: string
  startDate: string
  endDate: string
  devices: string[]
  brandExclusions: string
  demographicExclusions: string
  dataExclusions: string
  utmPrefix: string
  companySite: string
  homeCountry: string
  onLocationModeChange: (v: "all" | "home" | "custom") => void
  onToggleLocation: (v: string) => void
  onLocationPresenceChange: (v: string) => void
  onToggleLanguage: (v: string) => void
  onEuPoliticalAdsChange: (v: "yes" | "no") => void
  onFinalUrlChange: (v: string) => void
  onFinalUrlExpansionChange: (v: boolean) => void
  onAdScheduleModeChange: (v: string) => void
  onStartDateChange: (v: string) => void
  onEndDateChange: (v: string) => void
  onToggleDevice: (v: string) => void
  onBrandExclusionsChange: (v: string) => void
  onDemographicExclusionsChange: (v: string) => void
  onDataExclusionsChange: (v: string) => void
  onUtmChange: (v: string) => void
}) {
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false)
  const [locationInput, setLocationInput] = useState("")
  const [locationFocused, setLocationFocused] = useState(false)
  const [languageInput, setLanguageInput] = useState("")
  const [languageOpen, setLanguageOpen] = useState(false)

  const filteredLocations = (() => {
    const q = locationInput.trim().toLowerCase()
    // When the user hasn't typed anything yet, surface a few popular picks so
    // the dropdown isn't empty on first focus.
    if (!q) {
      const popular = [
        homeCountry,
        "United States",
        "United Kingdom",
        "Canada",
        "Germany",
        "France",
        "Japan",
        "Australia",
      ]
      return popular
        .map((p) => LOCATION_REACH_MOCKS.find((l) => l.name === p))
        .filter((l): l is LocationReach => Boolean(l))
        .slice(0, 8)
    }
    return LOCATION_REACH_MOCKS.filter((loc) =>
      loc.name.toLowerCase().includes(q)
    ).slice(0, 12)
  })()

  const filteredLanguages = LANGUAGE_OPTIONS.filter((lang) =>
    lang.label.toLowerCase().includes(languageInput.trim().toLowerCase())
  )

  const addLocation = (name: string) => {
    if (!locations.includes(name)) onToggleLocation(name)
    setLocationInput("")
    setLocationFocused(false)
  }

  return (
    <div className="space-y-6">
      {/* ---- Page header ---- */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Campaign settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          To reach the right people, start by defining key settings for your campaign
        </p>
      </div>

      {/* ---- Locations ---- */}
      <SetupCard id="step-sub-3-0" title="Locations">
        <div className="space-y-4">
          <div className="flex items-center gap-1 text-sm">
            Select locations for this campaign{" "}
            <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <RadioRow
              name="locationMode"
              value="all"
              selected={locationMode}
              title="All countries and territories"
              onChange={(v) => onLocationModeChange(v as "all" | "home" | "custom")}
            />
            <RadioRow
              name="locationMode"
              value="home"
              selected={locationMode}
              title={homeCountry}
              onChange={(v) => onLocationModeChange(v as "all" | "home" | "custom")}
            />
            <RadioRow
              name="locationMode"
              value="custom"
              selected={locationMode}
              title="Enter another location"
              onChange={(v) => onLocationModeChange(v as "all" | "home" | "custom")}
            />
          </div>

          {locationMode === "custom" && (
            <div className="relative space-y-2 pl-7">
              <div className="flex items-start gap-3">
                <div className="relative flex-1 max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </span>
                  <Input
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onFocus={() => setLocationFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setLocationFocused(false), 150)
                    }
                    placeholder="Search for a location"
                    className="pl-9"
                  />

                  {locationFocused && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-96 overflow-auto rounded-lg border bg-popover shadow-lg">
                      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
                        <span>Matches</span>
                        <span className="flex items-center gap-1">
                          Reach <CircleHelp className="h-3 w-3" />
                        </span>
                      </div>
                      <ul className="py-1">
                        {filteredLocations.map((loc) => (
                          <li key={loc.name}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addLocation(loc.name)}
                              className="group flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-muted/50"
                            >
                              <span className="min-w-0 flex-1 truncate">
                                <span className="font-medium">{loc.name}</span>{" "}
                                <span className="text-xs text-muted-foreground">
                                  {loc.kind}
                                </span>
                                {loc.limited && (
                                  <span className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                                    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-100 text-[10px]">
                                      !
                                    </span>
                                    Limited reach
                                  </span>
                                )}
                              </span>
                              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                {loc.reach !== null
                                  ? loc.reach.toLocaleString()
                                  : "—"}
                              </span>
                              <span className="ml-3 hidden shrink-0 gap-3 text-xs font-medium text-primary group-hover:flex">
                                <span>Include</span>
                                <span>Exclude</span>
                                <span>Nearby</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                        Related locations
                      </div>
                      <ul className="pb-1">
                        {RELATED_LOCATION_MOCKS.map((loc) => (
                          <li key={loc.name}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addLocation(loc.name)}
                              className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-muted/50"
                            >
                              <span className="min-w-0 flex-1 truncate">
                                <span className="font-medium">{loc.name}</span>{" "}
                                <span className="text-xs text-muted-foreground">
                                  {loc.kind}
                                </span>
                              </span>
                              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                                {loc.reach.toLocaleString()}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                  Advanced search
                </button>
              </div>

              {locations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {locations.map((loc) => (
                    <span
                      key={loc}
                      className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-xs"
                    >
                      {regionFlag(loc)} {loc}
                      <button
                        type="button"
                        onClick={() => onToggleLocation(loc)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/10"
                        aria-label={`Remove ${loc}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Location options collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setLocationOptionsOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {locationOptionsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Location options
            </button>
            {locationOptionsOpen && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-1 text-sm">
                  Include <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {LOCATION_PRESENCE_OPTIONS.map((option) => (
                    <RadioRow
                      key={option.value}
                      name="locationPresence"
                      value={option.value}
                      selected={locationPresence}
                      title={option.label}
                      onChange={onLocationPresenceChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SetupCard>

      {/* ---- Languages ---- */}
      <SetupCard id="step-sub-3-1" title="Languages">
        <div className="space-y-3">
          <label className="flex items-center gap-1 text-sm">
            Select the languages your customers speak.{" "}
            <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
          </label>
          <div className="relative max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <Input
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onFocus={() => setLanguageOpen(true)}
              onBlur={() => setTimeout(() => setLanguageOpen(false), 150)}
              placeholder="Start typing or select a language"
              className="pl-9"
            />
            {languageOpen && filteredLanguages.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-lg border bg-popover shadow-lg">
                <ul className="py-1">
                  {filteredLanguages.map((lang) => {
                    const checked = languages.includes(lang.value)
                    return (
                      <li key={lang.value}>
                        <label
                          onMouseDown={(e) => e.preventDefault()}
                          className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleLanguage(lang.value)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          {lang.label}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languages.map((value) => {
                const lang = LANGUAGE_OPTIONS.find((l) => l.value === value)
                return (
                  <span
                    key={value}
                    className="flex items-center gap-1 rounded-full border bg-muted/30 px-3 py-1 text-xs"
                  >
                    {lang?.label ?? value}
                    <button
                      type="button"
                      onClick={() => onToggleLanguage(value)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/10"
                      aria-label={`Remove ${lang?.label ?? value}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </SetupCard>

      {/* ---- EU political ads ---- */}
      <SetupCard id="step-sub-3-2" title="EU political ads">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-3">
            <div>
              <p className="text-sm">Does your campaign have European Union political ads?</p>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
            <div className="space-y-2">
              <RadioRow
                name="euPoliticalAds"
                value="yes"
                selected={euPoliticalAds}
                title="Yes, this campaign has EU political ads"
                onChange={(v) => onEuPoliticalAdsChange(v as "yes" | "no")}
              />
              <RadioRow
                name="euPoliticalAds"
                value="no"
                selected={euPoliticalAds}
                title="No, this campaign doesn't have EU political ads"
                onChange={(v) => onEuPoliticalAdsChange(v as "yes" | "no")}
              />
            </div>
          </div>
          <aside className="border-l pl-4 text-xs text-muted-foreground lg:block">
            EU regulation requires Google to ask this question{" "}
            <a href="#" className="block text-primary hover:underline">
              Learn how an EU political ad is defined
            </a>
          </aside>
        </div>
      </SetupCard>

      {/* ---- More settings ---- */}
      <MoreSettings
        finalUrl={finalUrl}
        finalUrlExpansion={finalUrlExpansion}
        adScheduleMode={adScheduleMode}
        startDate={startDate}
        endDate={endDate}
        devices={devices}
        brandExclusions={brandExclusions}
        demographicExclusions={demographicExclusions}
        dataExclusions={dataExclusions}
        utmPrefix={utmPrefix}
        companySite={companySite}
        onFinalUrlChange={onFinalUrlChange}
        onFinalUrlExpansionChange={onFinalUrlExpansionChange}
        onAdScheduleModeChange={onAdScheduleModeChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onToggleDevice={onToggleDevice}
        onBrandExclusionsChange={onBrandExclusionsChange}
        onDemographicExclusionsChange={onDemographicExclusionsChange}
        onDataExclusionsChange={onDataExclusionsChange}
        onUtmChange={onUtmChange}
      />
    </div>
  )
}

/* -- "More settings" Google-Ads style table with expandable rows -- */
const ALL_DEVICES = ["computers", "mobile_phones", "tablets", "tv_screens"]
const DEVICE_LABEL: Record<string, string> = {
  computers: "computers",
  mobile_phones: "mobile phones",
  tablets: "tablets",
  tv_screens: "TV screens",
}

function MoreSettings({
  finalUrl,
  finalUrlExpansion,
  adScheduleMode,
  startDate,
  endDate,
  devices,
  brandExclusions,
  demographicExclusions,
  dataExclusions,
  utmPrefix,
  companySite,
  onFinalUrlChange,
  onFinalUrlExpansionChange,
  onAdScheduleModeChange,
  onStartDateChange,
  onEndDateChange,
  onToggleDevice,
  onBrandExclusionsChange,
  onDemographicExclusionsChange,
  onDataExclusionsChange,
  onUtmChange,
}: {
  finalUrl: string
  finalUrlExpansion: boolean
  adScheduleMode: string
  startDate: string
  endDate: string
  devices: string[]
  brandExclusions: string
  demographicExclusions: string
  dataExclusions: string
  utmPrefix: string
  companySite: string
  onFinalUrlChange: (v: string) => void
  onFinalUrlExpansionChange: (v: boolean) => void
  onAdScheduleModeChange: (v: string) => void
  onStartDateChange: (v: string) => void
  onEndDateChange: (v: string) => void
  onToggleDevice: (v: string) => void
  onBrandExclusionsChange: (v: string) => void
  onDemographicExclusionsChange: (v: string) => void
  onDataExclusionsChange: (v: string) => void
  onUtmChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeRow, setActiveRow] = useState<string | null>(null)

  const toggleRow = (key: string) =>
    setActiveRow((cur) => (cur === key ? null : key))

  const allDevicesActive =
    devices.length === 0 || devices.length === ALL_DEVICES.length
  const deviceSummary = allDevicesActive
    ? "Ads will show on computers, mobile phones, tablets, and TV screens"
    : devices.map((d) => DEVICE_LABEL[d] ?? d).join(", ")

  const startSummary = startDate ? formatDate(startDate) : "Today"
  const endSummary = endDate ? formatDate(endDate) : "Not set"

  const rows: {
    key: string
    label: string
    summary: string
    body: ReactNode
  }[] = [
    {
      key: "ad_schedule",
      label: "Ad schedule",
      summary: adScheduleMode === "all_day" ? "All day" : "Specific hours",
      body: (
        <div className="space-y-2">
          <RadioRow
            name="adSchedule"
            value="all_day"
            selected={adScheduleMode}
            title="All day"
            description="Your ads can run any time of day."
            onChange={onAdScheduleModeChange}
          />
          <RadioRow
            name="adSchedule"
            value="custom"
            selected={adScheduleMode}
            title="Specific hours"
            description="Restrict ads to specific days and hours."
            onChange={onAdScheduleModeChange}
          />
        </div>
      ),
    },
    {
      key: "dates",
      label: "Start and end dates",
      summary: `Start date: ${startSummary}    End date: ${endSummary}`,
      body: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start date</label>
            <DatePickerField value={startDate} onChange={onStartDateChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End date (optional)</label>
            <DatePickerField value={endDate} onChange={onEndDateChange} />
          </div>
        </div>
      ),
    },
    {
      key: "url_options",
      label: "Campaign URL options",
      summary: utmPrefix || finalUrl ? "Set" : "No options set",
      body: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Final URL</label>
            <Input
              placeholder={companySite || "https://yourbrand.com"}
              value={finalUrl}
              onChange={(event) => onFinalUrlChange(event.target.value)}
            />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Final URL expansion</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Send traffic to the most relevant page on your site when it can improve performance.
              </p>
            </div>
            <Switch
              checked={finalUrlExpansion}
              onCheckedChange={onFinalUrlExpansionChange}
              aria-label="Final URL expansion"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tracking template / UTM</label>
            <Input
              placeholder="utm_source=google&utm_medium=cpc"
              value={utmPrefix}
              onChange={(event) => onUtmChange(event.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      key: "devices",
      label: "Devices",
      summary: deviceSummary,
      body: (
        <div className="grid gap-2 sm:grid-cols-2">
          {ALL_DEVICES.map((d) => {
            const checked = devices.includes(d)
            return (
              <label
                key={d}
                className="flex items-center gap-2 rounded-md border p-2 text-sm capitalize"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleDevice(d)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                {DEVICE_LABEL[d]}
              </label>
            )
          })}
        </div>
      ),
    },
    {
      key: "brand_exclusions",
      label: "Brand exclusions",
      summary: brandExclusions ? "Set" : "No brand lists excluded",
      body: (
        <Textarea
          rows={3}
          value={brandExclusions}
          onChange={(event) => onBrandExclusionsChange(event.target.value)}
          placeholder="Add brands you don't want to associate with (comma-separated)"
        />
      ),
    },
    {
      key: "demographic_exclusions",
      label: "Demographic exclusions",
      summary: demographicExclusions ? "Set" : "No demographic exclusions",
      body: (
        <Textarea
          rows={3}
          value={demographicExclusions}
          onChange={(event) => onDemographicExclusionsChange(event.target.value)}
          placeholder="e.g., 18-24 male, parents, household income top 10%"
        />
      ),
    },
    {
      key: "data_exclusions",
      label: "Your data exclusions",
      summary: dataExclusions ? "Set" : "No audiences",
      body: (
        <Textarea
          rows={3}
          value={dataExclusions}
          onChange={(event) => onDataExclusionsChange(event.target.value)}
          placeholder="Audience lists to exclude (comma-separated)"
        />
      ),
    },
  ]

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-5 py-3 text-left"
      >
        {open ? (
          <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-primary" />
        )}
        <Settings className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">More settings</span>
      </button>

      {open && (
        <div className="border-t">
          {rows.map((row) => {
            const expanded = activeRow === row.key
            return (
              <div
                key={row.key}
                className={cn(
                  "border-b last:border-b-0",
                  expanded && "bg-muted/10"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleRow(row.key)}
                  className="grid w-full grid-cols-[180px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 text-left text-sm hover:bg-muted/20"
                >
                  <span className="font-medium">{row.label}</span>
                  <span className="truncate text-muted-foreground">
                    {row.summary}
                  </span>
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expanded && (
                  <div className="px-5 pb-5 pt-1">{row.body}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatDate(value: string): string {
  if (!value) return ""
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return value
  }
}

/* ================================================================== */
/* Step 4 · Asset generation                                          */
/* ================================================================== */

function StepAssetGeneration({
  finalUrl,
  generated,
  hostname,
  onFinalUrlChange,
  onGenerate,
  onSkip,
  onBack,
}: {
  finalUrl: string
  generated: boolean
  hostname: string
  onFinalUrlChange: (v: string) => void
  onGenerate: () => void
  onSkip: () => void
  onBack: () => void
}) {
  const canGenerate = finalUrl.trim().length > 0

  return (
    <div className="space-y-6">
      {/* ---- Page header ---- */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Asset generation</h2>
      </div>

      <SetupCard id="step-sub-4-0" title="Asset generation">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground" />
              <h3 className="text-sm font-medium">
                Let Google AI help you generate assets
              </h3>
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
              >
                Beta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Tell us about your campaign to generate new images, enhance existing assets and write
              text using Google AI.{" "}
              <a href="#" className="text-primary hover:underline">
                Learn more about generating assets
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Where will people go when they click your ad?
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Link2 className="h-4 w-4" />
              </span>
              <Input
                value={finalUrl}
                onChange={(e) => onFinalUrlChange(e.target.value)}
                placeholder={`Final URL (e.g. https://${hostname || "yourbrand.com"})`}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Asset generation is not available in all languages
            </p>
          </div>

          {generated && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-sm text-emerald-900">
              <Sparkles className="mt-0.5 h-4 w-4 text-emerald-700" />
              <div>
                <p className="font-medium">Assets generated</p>
                <p className="mt-0.5 text-xs text-emerald-800/80">
                  Google AI prepared draft headlines, descriptions, and image variants from your
                  final URL. You can review and remove anything in the next step.
                </p>
              </div>
            </div>
          )}
        </div>
      </SetupCard>

      {/* ---- Custom footer for this step (Skip / Back / Generate assets) ---- */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onGenerate} disabled={!canGenerate}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate assets
        </Button>
      </div>
    </div>
  )
}

/* ================================================================== */
/* Step 5 · Asset group                                               */
/* ================================================================== */

function StepAssetGroup({
  formData,
  hostname,
  merchantAccountId,
  update,
  toggleInArray,
  addUrl,
  removeUrl,
}: {
  formData: CampaignWizardFormData
  hostname: string
  merchantAccountId: string
  update: <K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K]
  ) => void
  toggleInArray: (key: keyof CampaignWizardFormData, value: string) => void
  addUrl: (key: "assetImageUrls" | "assetLogoUrls" | "assetVideoUrls", url: string) => void
  removeUrl: (key: "assetImageUrls" | "assetLogoUrls" | "assetVideoUrls", index: number) => void
}) {
  const [imageInput, setImageInput] = useState("")
  const [logoInput, setLogoInput] = useState("")
  const [videoInput, setVideoInput] = useState("")
  const previewHeadline = formData.headline.trim() || "Your primary ad headline"
  const previewDescription =
    formData.adDescription.trim() || "A short description that sells the offer."

  const merchantAccountLabel = MERCHANT_ACCOUNTS.find(
    (a) => a.id === merchantAccountId
  )
  const merchantAccountSummary = merchantAccountLabel
    ? `${merchantAccountId} - ${merchantAccountLabel.name}`
    : merchantAccountId || "459437978 - Realry"

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Asset group</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Show high quality ads to the right people. Start by adding your assets, the building
          blocks of every ad. Google will test different combinations to create high performing
          ads across the formats and networks that work best for your goals and the audiences
          you want to reach.
        </p>
      </div>

      {/* 1 · Asset group name */}
      <SetupCard id="asset-name" title="Asset group name">
        <Input
          value={formData.assetGroupName}
          onChange={(event) => update("assetGroupName", event.target.value)}
          placeholder="Asset Group 1"
          className="max-w-sm"
        />
      </SetupCard>

      {/* 2 · Listing groups */}
      <ListingGroupsCard
        merchantAccountSummary={merchantAccountSummary}
        mode={formData.listingGroupsMode}
        selected={formData.listingGroupCategories}
        onModeChange={(v) => update("listingGroupsMode", v)}
        onToggleCategory={(id) => toggleInArray("listingGroupCategories", id)}
        onClearAll={() => update("listingGroupCategories", [])}
      />

      {/* 3 · Brand guidelines */}
      <BrandGuidelinesCard
        useBusinessName={formData.brandIdentityUseBusinessName}
        useLogos={formData.brandIdentityUseLogos}
        businessName={formData.businessName}
        logoCount={formData.assetLogoUrls.length}
        mainColor={formData.brandMainColor}
        accentColor={formData.brandAccentColor}
        font={formData.brandFont}
        termExclusions={formData.brandTermExclusions}
        messagingRestrictions={formData.brandMessagingRestrictions}
        onToggleBusinessName={(v) => update("brandIdentityUseBusinessName", v)}
        onToggleLogos={(v) => update("brandIdentityUseLogos", v)}
        onBusinessNameChange={(v) => update("businessName", v)}
        onMainColorChange={(v) => update("brandMainColor", v)}
        onAccentColorChange={(v) => update("brandAccentColor", v)}
        onFontChange={(v) => update("brandFont", v)}
        onTermExclusionsChange={(v) => update("brandTermExclusions", v)}
        onMessagingRestrictionsChange={(v) => update("brandMessagingRestrictions", v)}
      />

      {/* 4 · Assets */}
      <AssetsCard
        formData={formData}
        hostname={hostname}
        previewHeadline={previewHeadline}
        previewDescription={previewDescription}
        imageInput={imageInput}
        logoInput={logoInput}
        videoInput={videoInput}
        setImageInput={setImageInput}
        setLogoInput={setLogoInput}
        setVideoInput={setVideoInput}
        update={update}
        addUrl={addUrl}
        removeUrl={removeUrl}
      />

      {/* 5 · Asset optimization */}
      <AssetOptimizationCard
        textCustomization={formData.assetOptTextCustomization}
        urlExpansion={formData.assetOptUrlExpansion}
        imageEnhancement={formData.assetOptImageEnhancement}
        landingPageImages={formData.assetOptLandingPageImages}
        videoEnhancement={formData.assetOptVideoEnhancement}
        onTextChange={(v) => update("assetOptTextCustomization", v)}
        onUrlExpansionChange={(v) => update("assetOptUrlExpansion", v)}
        onImageEnhancementChange={(v) => update("assetOptImageEnhancement", v)}
        onLandingPageImagesChange={(v) => update("assetOptLandingPageImages", v)}
        onVideoEnhancementChange={(v) => update("assetOptVideoEnhancement", v)}
      />

      {/* 6 · Search themes */}
      <SetupCard
        id="search-themes"
        title="Search themes"
        subtitle="What words or phrases would people use to search for your business?"
      >
        <Textarea
          rows={3}
          value={formData.searchThemes}
          onChange={(event) => update("searchThemes", event.target.value)}
          placeholder="Add search themes (up to 50)"
        />
      </SetupCard>

      {/* 7 · Audience signal */}
      <AudienceSignalCard
        audienceName={formData.audienceSignalName}
        customerLists={formData.customerDataLists}
        customSegments={formData.audienceCustomSegments}
        interests={formData.interests}
        ageBands={formData.ageBands}
        onAudienceNameChange={(v) => update("audienceSignalName", v)}
        onToggleCustomerList={(v) => toggleInArray("customerDataLists", v)}
        onCustomSegmentsChange={(v) => update("audienceCustomSegments", v)}
        onToggleInterest={(v) => toggleInArray("interests", v)}
        onToggleAge={(v) => toggleInArray("ageBands", v)}
      />
    </div>
  )
}

/* ----------------------- Listing groups card ----------------------- */

function ListingGroupsCard({
  merchantAccountSummary,
  mode,
  selected,
  onModeChange,
  onToggleCategory,
  onClearAll,
}: {
  merchantAccountSummary: string
  mode: "all" | "selection"
  selected: string[]
  onModeChange: (v: "all" | "selection") => void
  onToggleCategory: (id: string) => void
  onClearAll: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState("")

  const selectedLabels = selected
    .map((id) => LISTING_GROUP_CATEGORIES.find((c) => c.id === id)?.label ?? id)
    .filter(Boolean)

  const filtered = LISTING_GROUP_CATEGORIES.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SetupCard id="listing-groups" title="Listing groups">
      <p className="text-sm">
        <span className="font-medium">Merchant center account:</span>{" "}
        {merchantAccountSummary}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose which products to show in your ads. Some of your ads will use images, headlines
        and descriptions from Merchant Center.
      </p>

      {!editing ? (
        <div className="mt-4 flex items-center gap-3">
          {mode === "all" || selectedLabels.length === 0 ? (
            <span className="text-sm">All products</span>
          ) : (
            <span className="text-sm">
              <span className="font-medium">Category:</span>{" "}
              {selectedLabels.length <= 3
                ? selectedLabels.join(", ")
                : `${selectedLabels.slice(0, 3).join(", ")}, and ${selectedLabels.length - 3} more`}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => setEditing(true)}
            aria-label="Edit listing groups"
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">Edit listing groups</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(false)}
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <RadioRow
              name="listingGroupsMode"
              value="all"
              selected={mode}
              title="Use all products"
              onChange={(v) => onModeChange(v as "all" | "selection")}
            />
            <RadioRow
              name="listingGroupsMode"
              value="selection"
              selected={mode}
              title="Use a selection of products"
              onChange={(v) => onModeChange(v as "all" | "selection")}
            />
          </div>

          {mode === "selection" && (
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-md border bg-background">
                <div className="flex items-center gap-2 border-b px-3 py-2 text-sm">
                  <span className="font-medium">Select products by:</span>
                  <Select value="category" onValueChange={() => {}}>
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="item_id">Item ID</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 border-b px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-7 border-0 px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Listing group</span>
                  <span>Listings submitted</span>
                </div>
                <ul className="max-h-[260px] overflow-y-auto">
                  {filtered.map((c) => {
                    const checked = selected.includes(c.id)
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0",
                          checked && "bg-primary/5"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleCategory(c.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span>{c.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {c.listings.toLocaleString()}
                        </span>
                      </li>
                    )
                  })}
                  {filtered.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No matches.
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-md border bg-background">
                <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                  <span className="font-medium">
                    {selected.length === 0
                      ? "None selected"
                      : `${selected.length} selected`}
                  </span>
                  {selected.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearAll}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <ul className="max-h-[260px] space-y-1 overflow-y-auto p-2">
                  {selectedLabels.map((label, idx) => (
                    <li
                      key={label + idx}
                      className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm"
                    >
                      <span className="truncate">{label}</span>
                      <button
                        type="button"
                        onClick={() => onToggleCategory(selected[idx])}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${label}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                  {selectedLabels.length === 0 && (
                    <li className="px-2 py-6 text-center text-xs text-muted-foreground">
                      Select categories on the left.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Button onClick={() => setEditing(false)}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </SetupCard>
  )
}

/* ----------------------- Brand guidelines card --------------------- */

function BrandGuidelinesCard({
  useBusinessName,
  useLogos,
  businessName,
  logoCount,
  mainColor,
  accentColor,
  font,
  termExclusions,
  messagingRestrictions,
  onToggleBusinessName,
  onToggleLogos,
  onBusinessNameChange,
  onMainColorChange,
  onAccentColorChange,
  onFontChange,
  onTermExclusionsChange,
  onMessagingRestrictionsChange,
}: {
  useBusinessName: boolean
  useLogos: boolean
  businessName: string
  logoCount: number
  mainColor: string
  accentColor: string
  font: string
  termExclusions: string
  messagingRestrictions: string
  onToggleBusinessName: (v: boolean) => void
  onToggleLogos: (v: boolean) => void
  onBusinessNameChange: (v: string) => void
  onMainColorChange: (v: string) => void
  onAccentColorChange: (v: string) => void
  onFontChange: (v: string) => void
  onTermExclusionsChange: (v: string) => void
  onMessagingRestrictionsChange: (v: string) => void
}) {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <SetupCard
      id="brand-guidelines"
      title="Brand guidelines"
      subtitle="Control how your brand appears in ads for this campaign."
    >
      <div className="space-y-5">
        {/* Business name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="radio"
              checked={useBusinessName}
              onChange={() => onToggleBusinessName(true)}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            Business name
            <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
          </label>
          <div className="ml-6 max-w-sm">
            <Input
              value={businessName}
              maxLength={BUSINESS_NAME_MAX}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              placeholder="Business name"
              disabled={!useBusinessName}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Required</span>
              <span>{businessName.length} / {BUSINESS_NAME_MAX}</span>
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="radio"
              checked={useLogos}
              onChange={() => onToggleLogos(true)}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            Logos {logoCount}/5
            <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
          </label>
          <button
            type="button"
            className="ml-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add logos
          </button>
        </div>

        {/* More options (collapsible visual + text guidelines) */}
        <div className="rounded-lg border bg-muted/20">
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-medium">More options</p>
              <p className="text-xs text-muted-foreground">
                Add visual and text guidelines
              </p>
            </div>
            {moreOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {moreOpen && (
            <div className="space-y-6 border-t bg-background px-4 py-5">
              {/* Visual guidelines */}
              <section className="space-y-3">
                <h4 className="text-sm font-semibold">Visual guidelines</h4>
                <p className="text-xs text-muted-foreground">
                  Add your brand colors and fonts to help Google AI generate on-brand videos and
                  responsive display ads.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Main color</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={mainColor}
                        onChange={(e) => onMainColorChange(e.target.value)}
                        placeholder="#ffffff"
                      />
                      <span
                        className="h-8 w-8 rounded-full border"
                        style={{ background: mainColor || "transparent" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Example: #ffffff</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Accent color</label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={accentColor}
                        onChange={(e) => onAccentColorChange(e.target.value)}
                        placeholder="#4285f4"
                      />
                      <span
                        className="h-8 w-8 rounded-full border"
                        style={{ background: accentColor || "transparent" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Example: #4285f4</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Font</label>
                  <Select value={font || "any"} onValueChange={(v) => onFontChange(v ?? "")}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Any font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any font</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Geist">Geist</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>

              {/* Text guidelines */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">Text guidelines</h4>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    BETA
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tell Google AI the rules it needs to follow when it creates relevant, on-brand
                  headlines and descriptions for you.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Term exclusions ({termExclusions.split(/[,\n]/).filter(Boolean).length}/25)
                  </label>
                  <Textarea
                    rows={2}
                    value={termExclusions}
                    onChange={(e) => onTermExclusionsChange(e.target.value)}
                    placeholder="Add word or phrase"
                  />
                  <p className="text-xs text-muted-foreground">
                    For example: Cheap, free shipping, etc. Press Enter after each word or phrase.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Messaging restrictions ({
                      messagingRestrictions
                        .split(/\n/)
                        .filter((s) => s.trim().length > 0).length
                    }/40)
                  </label>
                  <Textarea
                    rows={3}
                    value={messagingRestrictions}
                    onChange={(e) => onMessagingRestrictionsChange(e.target.value)}
                    placeholder={`Example: Don't mention competitor names, such as Acme Corp or Plants 4 You\nExample: Don't use specific prices, such as $550 per night or $99 intro offer`}
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </SetupCard>
  )
}

/* ----------------------- Assets card ------------------------------- */

function AssetSingleLineField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  maxLength: number
  placeholder: string
}) {
  const n = value.length
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-primary" aria-hidden />
        {label}
        <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-8"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Required</span>
        <span>
          {n} / {maxLength}
        </span>
      </div>
    </div>
  )
}

function AssetsCard({
  formData,
  hostname,
  previewHeadline,
  previewDescription,
  imageInput,
  logoInput,
  videoInput,
  setImageInput,
  setLogoInput,
  setVideoInput,
  update,
  addUrl,
  removeUrl,
}: {
  formData: CampaignWizardFormData
  hostname: string
  previewHeadline: string
  previewDescription: string
  imageInput: string
  logoInput: string
  videoInput: string
  setImageInput: (v: string) => void
  setLogoInput: (v: string) => void
  setVideoInput: (v: string) => void
  update: <K extends keyof CampaignWizardFormData>(
    key: K,
    value: CampaignWizardFormData[K]
  ) => void
  addUrl: (key: "assetImageUrls" | "assetLogoUrls" | "assetVideoUrls", url: string) => void
  removeUrl: (key: "assetImageUrls" | "assetLogoUrls" | "assetVideoUrls", index: number) => void
}) {
  const checks = [
    { label: "Images", done: formData.assetImageUrls.length > 0 },
    { label: "Headlines", done: formData.headline.trim().length > 0 },
    { label: "Products", done: true },
    { label: "Videos", done: formData.assetVideoUrls.length > 0 },
    { label: "Descriptions", done: formData.adDescription.trim().length > 0 },
    { label: "Sitelinks", done: formData.sitelinks.length > 0 },
  ]
  const completionScore = checks.filter((c) => c.done).length
  const adStrengthLabel =
    completionScore >= 5
      ? "Excellent"
      : completionScore >= 4
        ? "Good"
        : completionScore >= 2
          ? "Average"
          : "Poor"

  return (
    <SetupCard id="assets" title="Assets">
      {/* Top blue strip */}
      <div className="-mx-5 -mt-4 mb-5 grid gap-3 border-b bg-sky-50 px-5 py-4 sm:grid-cols-[1fr_auto_1fr] dark:bg-sky-950/40">
        <p className="text-sm">
          <Info className="mr-1 inline h-4 w-4 text-sky-600" />
          Advertisers who have <strong>Excellent</strong> ad strength see an average of 6% more
          conversions
        </p>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative h-8 w-8">
            <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(completionScore / checks.length) * 94.2} 94.2`}
                className="text-primary"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Ad strength</p>
            <p className="text-xs text-muted-foreground">{adStrengthLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {checks.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              {c.done ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
              )}
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-6">
          {/* Final URL */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Final URL</label>
            <Input
              value={formData.finalUrl}
              onChange={(e) => update("finalUrl", e.target.value)}
              placeholder="Final URL"
            />
            <p className="text-xs text-muted-foreground">Required</p>
          </div>

          <AssetSingleLineField
            label="Headline"
            value={formData.headline}
            onChange={(v) => update("headline", v)}
            maxLength={HEADLINE_MAX}
            placeholder="Headline"
          />
          <div className="-mt-1 flex items-center gap-4 text-sm">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              Generate headlines
            </button>
          </div>

          <AssetSingleLineField
            label="Long headline"
            value={formData.longHeadline}
            onChange={(v) => update("longHeadline", v)}
            maxLength={LONG_HEADLINE_MAX}
            placeholder="Long headline"
          />
          <div className="-mt-1 flex items-center gap-4 text-sm">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              Generate long headlines
            </button>
          </div>

          <AssetSingleLineField
            label="Description"
            value={formData.adDescription}
            onChange={(v) => update("adDescription", v)}
            maxLength={DESCRIPTION_MAX}
            placeholder="Description"
          />
          <div className="-mt-1 flex items-center gap-4 text-sm">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              Generate descriptions
            </button>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Images ({formData.assetImageUrls.length})</p>
            <AssetUrlList
              label="Images"
              description="Add up to 20 marketing images — landscape, square, and portrait."
              icon={<ImageIcon className="h-4 w-4 text-primary" />}
              urls={formData.assetImageUrls}
              inputValue={imageInput}
              onInputChange={setImageInput}
              onAdd={() => {
                addUrl("assetImageUrls", imageInput)
                setImageInput("")
              }}
              onRemove={(index) => removeUrl("assetImageUrls", index)}
              placeholder="https://…/hero.jpg"
              hideHeader
            />
          </div>

          {/* Logos */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Logos ({formData.assetLogoUrls.length})</p>
            <AssetUrlList
              label="Logos"
              description="Add up to 5 logo images (square 1:1 recommended)."
              icon={<Sparkles className="h-4 w-4 text-primary" />}
              urls={formData.assetLogoUrls}
              inputValue={logoInput}
              onInputChange={setLogoInput}
              onAdd={() => {
                addUrl("assetLogoUrls", logoInput)
                setLogoInput("")
              }}
              onRemove={(index) => removeUrl("assetLogoUrls", index)}
              placeholder="https://…/logo.svg"
              hideHeader
            />
          </div>

          {/* Videos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Videos ({formData.assetVideoUrls.length})</p>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Sparkles className="h-4 w-4" />
                Generate videos
              </button>
            </div>
            <AssetUrlList
              label="Videos"
              description="Add up to 5 YouTube video URLs."
              icon={<Video className="h-4 w-4 text-primary" />}
              urls={formData.assetVideoUrls}
              inputValue={videoInput}
              onInputChange={setVideoInput}
              onAdd={() => {
                addUrl("assetVideoUrls", videoInput)
                setVideoInput("")
              }}
              onRemove={(index) => removeUrl("assetVideoUrls", index)}
              placeholder="https://www.youtube.com/watch?v=…"
              hideHeader
            />
          </div>

          {/* Call to action */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Check className="h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
              Call to action
              <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
            </p>
            <Select
              value={formData.callToActionText || "automated"}
              onValueChange={(v) => update("callToActionText", v ?? "")}
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Automated" />
              </SelectTrigger>
              <SelectContent>
                {CALL_TO_ACTION_OPTIONS.map((cta) => (
                  <SelectItem key={cta.value} value={cta.value}>
                    {cta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* More asset types */}
          <MoreAssetTypesSection />

          {/* More options */}
          <MoreOptionsSection formData={formData} hostname={hostname} update={update} />
        </div>

        {/* Preview */}
        <aside className="lg:sticky lg:top-4">
          <div className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Preview
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <button type="button" className="hover:underline">Share</button>
                <button type="button" className="hover:underline">View more</button>
              </div>
            </div>
            <AdPreview
              headline={previewHeadline}
              headlineSecondary={formData.longHeadline.trim()}
              description={previewDescription}
              imageUrl={formData.assetImageUrls[0] ?? ""}
              aspectRatioValue="1.91:1"
              domainLabel={hostname}
            />
          </div>
        </aside>
      </div>
    </SetupCard>
  )
}

/* --------------------- Asset optimization card --------------------- */

function AssetOptimizationCard({
  textCustomization,
  urlExpansion,
  imageEnhancement,
  landingPageImages,
  videoEnhancement,
  onTextChange,
  onUrlExpansionChange,
  onImageEnhancementChange,
  onLandingPageImagesChange,
  onVideoEnhancementChange,
}: {
  textCustomization: boolean
  urlExpansion: boolean
  imageEnhancement: boolean
  landingPageImages: boolean
  videoEnhancement: boolean
  onTextChange: (v: boolean) => void
  onUrlExpansionChange: (v: boolean) => void
  onImageEnhancementChange: (v: boolean) => void
  onLandingPageImagesChange: (v: boolean) => void
  onVideoEnhancementChange: (v: boolean) => void
}) {
  const allOn =
    textCustomization &&
    urlExpansion &&
    imageEnhancement &&
    landingPageImages &&
    videoEnhancement

  return (
    <SetupCard id="asset-optimization" title="Asset optimization">
      <p className="text-sm text-muted-foreground">
        To show more relevant ads, Google AI can enhance or generate assets using the information
        you've provided. This can help improve performance by increasing asset variety and
        improving matches to customer intents.{" "}
        <a className="text-primary hover:underline" href="#">
          Learn more about asset optimization
        </a>
      </p>

      {allOn && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100">
          <Check className="h-4 w-4" />
          All recommended asset optimization settings are on
        </div>
      )}

      <div className="mt-4 space-y-3">
        {/* Text */}
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <span className="text-sm font-bold text-muted-foreground">Tt</span>
            <span className="text-sm font-medium">Text</span>
          </div>
          <div className="space-y-4 px-4 py-3 text-sm">
            <CheckboxRow
              checked={textCustomization}
              onChange={onTextChange}
              title="Customization:"
              description="Use text from your site, landing pages, ads, and provided assets to create customized ad copy."
              link="Add text guidelines"
            />
            <CheckboxRow
              checked={urlExpansion}
              onChange={onUrlExpansionChange}
              title="Final URL expansion:"
              description="If you choose to subdivide inventory in the next step, Final URL expansion will only send traffic to landing pages related to the campaign's product inventory."
              hint="Requires text customization to be turned on to ensure ad copy matches landing page."
              link="Add URL exclusions"
            />
          </div>
        </div>

        {/* Image */}
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Image</span>
          </div>
          <div className="space-y-4 px-4 py-3 text-sm">
            <CheckboxRow
              checked={imageEnhancement}
              onChange={onImageEnhancementChange}
              title="Enhancement:"
              description="Enhance and adjust images for better appearance, formatting, and layout."
              link="Add visual guidelines"
            />
            <CheckboxRow
              checked={landingPageImages}
              onChange={onLandingPageImagesChange}
              title="Landing page images:"
              description="Get images from your landing page to use in your ads."
              hint="By turning on landing page images, you confirm that you own all legal rights to the images and have permission to share them with Google for use on your behalf for advertising or other commercial purposes."
            />
          </div>
        </div>

        {/* Video */}
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Video</span>
          </div>
          <div className="space-y-4 px-4 py-3 text-sm">
            <CheckboxRow
              checked={videoEnhancement}
              onChange={onVideoEnhancementChange}
              title="Enhancement:"
              description="Allow Google to enhance your uploaded videos by creating additional vertical and square versions, as well as additional shorter versions."
              link="Add visual guidelines"
            />
          </div>
        </div>
      </div>
    </SetupCard>
  )
}

/* ─────────────────── More asset types section ─────────────────── */

const MORE_ASSET_TYPES = [
  { id: "promotions", label: "Promotions", subtitle: "Add promotions" },
  { id: "prices", label: "Prices", subtitle: "Add prices" },
  { id: "calls", label: "Calls", subtitle: "Add a phone number" },
  { id: "messages", label: "Messages", subtitle: "Add a message", addLabel: "Message" },
  { id: "snippets", label: "Structured snippets", subtitle: "Add snippets of text" },
  { id: "lead_forms", label: "Lead forms", subtitle: "Add a form" },
  { id: "callouts", label: "Callouts", subtitle: "Add more business information", addLabel: "Callouts" },
] as const

function MoreAssetTypesSection() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="border-t pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        More asset types (0/7)
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        Improve your ad performance and make your ad more interactive by adding more details
        about your business and website
      </p>

      {open && (
        <div className="mt-3 divide-y rounded-lg border">
          {MORE_ASSET_TYPES.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/40" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={expanded[item.id] ? "Collapse" : "Expand"}
                >
                  {expanded[item.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              {expanded[item.id] && "addLabel" in item && (
                <div className="border-t bg-muted/20 px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="text-base leading-none">+</span> {item.addLabel}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────── More options section ─────────────────── */

function MoreOptionsSection({
  formData,
  hostname,
  update,
}: {
  formData: CampaignWizardFormData
  hostname: string
  update: <K extends keyof CampaignWizardFormData>(key: K, value: CampaignWizardFormData[K]) => void
}) {
  const [open, setOpen] = useState(false)
  const [html5Open, setHtml5Open] = useState(true)
  const [urlRulesOpen, setUrlRulesOpen] = useState(true)

  return (
    <div className="border-t pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        More options
      </button>

      {open && (
        <div className="mt-4 space-y-0 divide-y rounded-lg border">
          {/* HTML5 */}
          <div>
            <button
              type="button"
              onClick={() => setHtml5Open((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="text-left">
                <p className="text-sm font-semibold">HTML5</p>
                <p className="text-xs text-muted-foreground">
                  HTML5 ads are advanced interactive ads that give you more control over your
                  creatives.
                </p>
              </div>
              {html5Open ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {html5Open && (
              <div className="border-t px-4 py-3">
                <p className="mb-2 text-xs text-muted-foreground">Add up to 1 HTML5 file</p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <span className="text-base leading-none">+</span> HTML5
                </button>
              </div>
            )}
          </div>

          {/* Display path */}
          <div className="px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Display path</p>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mb-2 text-xs text-muted-foreground">{hostname || "www.realry.com"}</p>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">/</span>
              <div className="flex flex-col">
                <Input
                  value={formData.displayPath1}
                  onChange={(e) => update("displayPath1", e.target.value.slice(0, 15))}
                  placeholder=""
                  className="h-8 w-28 text-sm"
                  maxLength={15}
                />
                <span className="mt-0.5 text-right text-xs text-muted-foreground">
                  {formData.displayPath1.length} / 15
                </span>
              </div>
              <span className="text-muted-foreground">/</span>
              <div className="flex flex-col">
                <Input
                  value={formData.displayPath2}
                  onChange={(e) => update("displayPath2", e.target.value.slice(0, 15))}
                  placeholder=""
                  className="h-8 w-28 text-sm"
                  maxLength={15}
                />
                <span className="mt-0.5 text-right text-xs text-muted-foreground">
                  {formData.displayPath2.length} / 15
                </span>
              </div>
            </div>
          </div>

          {/* Final URL for mobile */}
          <div className="px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Final URL for mobile</p>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.useMobileFinalUrl}
                onChange={(e) => update("useMobileFinalUrl", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Use a different final URL for mobile
            </label>
            {formData.useMobileFinalUrl && (
              <Input
                className="mt-3"
                value={formData.finalUrlMobile}
                onChange={(e) => update("finalUrlMobile", e.target.value)}
                placeholder="Mobile final URL"
              />
            )}
          </div>

          {/* Asset group URL options */}
          <div className="px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Asset group URL options</p>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-sm font-medium">
                  Tracking template
                  <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                <Input
                  value={formData.trackingTemplate}
                  onChange={(e) => update("trackingTemplate", e.target.value)}
                  placeholder="Tracking template"
                />
                <p className="text-xs text-muted-foreground">
                  Example: https://www.trackingtemplate.foo/?url={"{lpurl}"}&id=5
                </p>
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-sm font-medium">
                  Final URL suffix
                  <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                <Input
                  value={formData.finalUrlSuffix}
                  onChange={(e) => update("finalUrlSuffix", e.target.value)}
                  placeholder="Final URL suffix"
                />
                <p className="text-xs text-muted-foreground">
                  Example: param1=value1&param2=value2
                </p>
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-sm font-medium">
                  Custom parameter
                  <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {"{"}
                    </span>
                    <Input
                      value={formData.customParamName}
                      onChange={(e) => update("customParamName", e.target.value)}
                      placeholder="_Name"
                      className="pl-5 pr-5"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {"}"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">=</span>
                  <Input
                    value={formData.customParamValue}
                    onChange={(e) => update("customParamValue", e.target.value)}
                    placeholder="Value"
                    className="flex-[2]"
                  />
                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    aria-label="Add parameter"
                  >
                    <span className="text-lg leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* URL rules */}
          <div>
            <button
              type="button"
              onClick={() => setUrlRulesOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="text-left">
                <p className="text-sm font-semibold">URL rules</p>
                <p className="text-xs text-muted-foreground">
                  Specify pages with URLs that contain a certain piece of text
                </p>
              </div>
              {urlRulesOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {urlRulesOpen && (
              <div className="border-t px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <span className="text-base leading-none">+</span> URL rules
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckboxRow({
  checked,
  onChange,
  title,
  description,
  hint,
  link,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  description: string
  hint?: string
  link?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <div className="space-y-1">
        <p>
          <span className="font-medium">{title}</span> {description}{" "}
          <a className="text-primary hover:underline" href="#">
            Learn more
          </a>
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        {link && (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            {link}
          </button>
        )}
      </div>
    </div>
  )
}

/* ----------------------- Audience signal card ---------------------- */

function AudienceSignalCard({
  audienceName,
  customerLists,
  customSegments,
  interests,
  ageBands,
  onAudienceNameChange,
  onToggleCustomerList,
  onCustomSegmentsChange,
  onToggleInterest,
  onToggleAge,
}: {
  audienceName: string
  customerLists: string[]
  customSegments: string
  interests: string[]
  ageBands: string[]
  onAudienceNameChange: (v: string) => void
  onToggleCustomerList: (v: string) => void
  onCustomSegmentsChange: (v: string) => void
  onToggleInterest: (v: string) => void
  onToggleAge: (v: string) => void
}) {
  const [yourDataOpen, setYourDataOpen] = useState(true)
  const [additionalOpen, setAdditionalOpen] = useState(false)
  const [audienceNameOpen, setAudienceNameOpen] = useState(true)
  const [customerListSearch, setCustomerListSearch] = useState("")

  const filteredLists = CUSTOMER_LIST_MOCKS.filter((l) =>
    l.name.toLowerCase().includes(customerListSearch.toLowerCase())
  )

  return (
    <SetupCard id="audience-signal" title="Audience signal">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Reach the right customers faster across Google with an audience signal.{" "}
          <CircleHelp className="inline h-3.5 w-3.5" />
        </p>
        <Button variant="outline" size="sm" type="button">
          Add saved audience signal
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {/* Your data */}
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => setYourDataOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="text-sm font-medium">Your data</span>
            {yourDataOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {yourDataOpen && (
            <div className="space-y-3 border-t px-4 py-4">
              <p className="text-sm text-muted-foreground">
                First-party data can help us reach your customers{" "}
                <CircleHelp className="inline h-3.5 w-3.5" />
              </p>
              <div className="flex items-center gap-2 rounded-md border bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={customerListSearch}
                  onChange={(e) => setCustomerListSearch(e.target.value)}
                  placeholder="Add your data"
                  className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {customerListSearch && (
                <ul className="rounded-md border bg-background">
                  {filteredLists.map((list) => {
                    const selected = customerLists.includes(list.id)
                    return (
                      <li
                        key={list.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-2 border-b px-3 py-2 text-sm last:border-b-0",
                          selected && "bg-primary/5"
                        )}
                        onClick={() => onToggleCustomerList(list.id)}
                      >
                        <span>
                          <span className="block font-medium">{list.name}</span>
                          <span className="text-xs text-muted-foreground">{list.type}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => onToggleCustomerList(list.id)}
                          className="h-4 w-4 accent-primary"
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
              {customerLists.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {customerLists.map((id) => {
                    const list = CUSTOMER_LIST_MOCKS.find((l) => l.id === id)
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1.5 bg-primary/10 text-primary"
                      >
                        {list?.name ?? id}
                        <button
                          type="button"
                          onClick={() => onToggleCustomerList(id)}
                          aria-label="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional signals (collapsible) */}
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => setAdditionalOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Settings className="h-4 w-4" />
              Additional signals
            </span>
            {additionalOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {additionalOpen && (
            <div className="space-y-4 border-t px-4 py-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Custom segments
                </p>
                <Textarea
                  rows={2}
                  value={customSegments}
                  onChange={(e) => onCustomSegmentsChange(e.target.value)}
                  placeholder="sustainable sneakers, luxury handbags, visits to competitor.com"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Interests &amp; detailed demographics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_CATEGORIES.map((interest) => {
                    const selected = interests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => onToggleInterest(interest)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:border-primary/50"
                        )}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Age
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AGE_BANDS.map((age) => {
                    const selected = ageBands.includes(age)
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => onToggleAge(age)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:border-primary/50"
                        )}
                      >
                        {age}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audience name */}
        <div className="rounded-lg border ring-1 ring-amber-300">
          <button
            type="button"
            onClick={() => setAudienceNameOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="text-sm font-medium">Audience name</span>
            {audienceNameOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {audienceNameOpen && (
            <div className="space-y-2 border-t px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Add a name for your audience to save it to your library (optional)
              </p>
              <Input
                value={audienceName}
                onChange={(e) => onAudienceNameChange(e.target.value)}
                placeholder="Enter audience name"
              />
            </div>
          )}
        </div>
      </div>
    </SetupCard>
  )
}

function AssetUrlList({
  label,
  description,
  icon,
  urls,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
  hideHeader = false,
}: {
  label: string
  description: string
  icon: ReactNode
  urls: string[]
  inputValue: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  placeholder: string
  hideHeader?: boolean
}) {
  return (
    <div className="space-y-3">
      {!hideHeader && (
        <>
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="text-sm font-semibold">{label}</h4>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onAdd()
            }
          }}
          placeholder={placeholder}
          className="max-w-sm"
        />
        <Button variant="outline" type="button" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
      {urls.length > 0 && (
        <ul className="space-y-1">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span className="truncate">{url}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ================================================================== */
/* Step 6 · Budget                                                    */
/* ================================================================== */

function StepBudget({
  currency,
  budget,
  monthlyEstimate,
  currencySymbol,
  onCurrencyChange,
  onBudgetChange,
}: {
  currency: string
  budget: string
  monthlyEstimate: number
  currencySymbol: string
  onCurrencyChange: (v: string) => void
  onBudgetChange: (v: string) => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Budget</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter an average daily budget to get started. You can change this any time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <Select value={currency} onValueChange={(v) => onCurrencyChange(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.symbol} {option.value} · {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Average daily budget</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currencySymbol}</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={budget}
              onChange={(event) => onBudgetChange(event.target.value)}
              placeholder="100.00"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
          <div className="space-y-1 text-sm">
            <p className="font-medium">
              This campaign will spend on average{" "}
              {currencySymbol}
              {Number(budget || 0).toLocaleString()} per day.
            </p>
            <p className="text-muted-foreground">
              Some days you may spend less, and on others up to 2× your daily budget. Over a
              calendar month, you won't pay more than{" "}
              <span className="font-medium text-foreground">
                {currencySymbol}
                {(monthlyEstimate * 2).toLocaleString()}
              </span>
              . The expected monthly charge is around{" "}
              <span className="font-medium text-foreground">
                {currencySymbol}
                {monthlyEstimate.toLocaleString()}
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/* Step 7 · Summary                                                   */
/* ================================================================== */

function StepSummary({
  formData,
  hostname,
  currencySymbol,
  onEdit,
}: {
  formData: CampaignWizardFormData
  hostname: string
  currencySymbol: string
  onEdit: (step: number) => void
}) {
  const languageLabels = formData.languages.map(
    (code) => LANGUAGE_OPTIONS.find((l) => l.value === code)?.label ?? code
  )
  const budgetLine = formData.budget
    ? `${currencySymbol}${Number(formData.budget).toLocaleString()} / day`
    : "—"
  const summaryHomeCountry = getCompanyProfile().country || "United States"
  const locationsSummary =
    formData.locationMode === "all"
      ? "All countries and territories"
      : formData.locationMode === "home"
        ? summaryHomeCountry
        : formData.regions.length > 0
          ? formData.regions.join(", ")
          : "—"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Publish your campaign</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Review every section before you publish. Changes can still be made after launch.
        </p>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">Performance Max learning period</p>
            <p className="mt-1 text-sm text-muted-foreground">
              After publishing, the campaign will enter a short review and learning period. Keep
              budget, bidding, and signal changes gradual while automation gathers conversion data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          title="Objective & campaign"
          step={1}
          onEdit={onEdit}
          rows={[
            ["Objective", labelFor(CAMPAIGN_OBJECTIVE_OPTIONS, formData.objective)],
            ["Campaign type", labelFor(CAMPAIGN_TYPE_OPTIONS, formData.campaignType)],
            ["Name", formData.name || "—"],
            [
              "Conversion goals",
              formData.conversionGoals
                .map((id) => CONVERSION_GOAL_CATALOG.find((g) => g.id === id)?.label ?? id)
                .join(", ") || "—",
            ],
            [
              "Merchant Center",
              formData.advertiseMerchantProducts
                ? MERCHANT_ACCOUNTS.find((a) => a.id === formData.merchantAccountId)
                  ? `${formData.merchantAccountId} - ${MERCHANT_ACCOUNTS.find((a) => a.id === formData.merchantAccountId)!.name}`
                  : "—"
                : "Not used",
            ],
          ]}
        />
        <SummaryCard
          title="Bidding"
          step={2}
          onEdit={onEdit}
          rows={[
            ["Focus", labelFor(BIDDING_FOCUS_OPTIONS, formData.biddingFocus) || "—"],
            ["Target CPA", formData.biddingTargetCpa ? `${currencySymbol}${formData.biddingTargetCpa}` : "—"],
            ["Target ROAS", formData.biddingTargetRoas || "—"],
            [
              "New customers",
              formData.newCustomerAcquisition === "off"
                ? "Bid equally"
                : formData.newCustomerAcquisition === "value"
                  ? "Bid higher for new customers"
                  : "Only new customers",
            ],
          ]}
        />
        <SummaryCard
          title="Campaign settings"
          step={3}
          onEdit={onEdit}
          rows={[
            ["Locations", locationsSummary],
            [
              "Location options",
              labelFor(LOCATION_PRESENCE_OPTIONS, formData.locationPresence) || "—",
            ],
            ["Languages", joined(languageLabels)],
            ["Final URL", formData.finalUrl || `https://${hostname}`],
            ["URL expansion", formData.finalUrlExpansion ? "Enabled" : "Off"],
            ["Ad schedule", formData.adScheduleMode === "all_day" ? "All day" : "Custom"],
            [
              "Start – End",
              `${formData.startDate || "—"} → ${formData.endDate || "—"}`,
            ],
          ]}
        />
        <SummaryCard
          title="Asset generation"
          step={4}
          onEdit={onEdit}
          rows={[
            [
              "AI generation",
              formData.assetGenerationEnabled ? "Generated" : "Skipped",
            ],
            ["Final URL", formData.finalUrl || "—"],
          ]}
        />
        <SummaryCard
          title="Asset group"
          step={5}
          onEdit={onEdit}
          rows={[
            ["Name", formData.assetGroupName || "—"],
            [
              "Listing groups",
              formData.listingGroupsMode === "all"
                ? "All products"
                : formData.listingGroupCategories
                    .map(
                      (id) =>
                        LISTING_GROUP_CATEGORIES.find((c) => c.id === id)?.label ?? id
                    )
                    .join(", ") || "—",
            ],
            ["Final URL", formData.finalUrl || "—"],
            ["Headline", formData.headline || "—"],
            ["Long headline", formData.longHeadline || "—"],
            ["Description", formData.adDescription || "—"],
            ["Images", `${formData.assetImageUrls.length}`],
            ["Logos", `${formData.assetLogoUrls.length}`],
            ["Videos", `${formData.assetVideoUrls.length}`],
            ["Business name", formData.businessName || "—"],
            [
              "Call-to-action",
              labelFor(CALL_TO_ACTION_OPTIONS, formData.callToActionText) || "Automated",
            ],
            [
              "Asset optimization",
              formData.assetOptTextCustomization &&
              formData.assetOptUrlExpansion &&
              formData.assetOptImageEnhancement &&
              formData.assetOptLandingPageImages &&
              formData.assetOptVideoEnhancement
                ? "All recommended on"
                : "Customized",
            ],
            ["Search themes", formData.searchThemes ? "Set" : "—"],
            ["Audience signal", formData.audienceSignalName || "—"],
            [
              "Customer data",
              formData.customerDataLists
                .map((id) => CUSTOMER_LIST_MOCKS.find((c) => c.id === id)?.name ?? id)
                .join(", ") || "—",
            ],
          ]}
        />
        <SummaryCard
          title="Budget"
          step={6}
          onEdit={onEdit}
          rows={[["Average daily", budgetLine]]}
        />
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  step,
  onEdit,
  rows,
}: {
  title: string
  step: number
  onEdit: (step: number) => void
  rows: [string, string][]
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="max-w-[60%] break-words text-right font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
