/** Local-only form state for the campaign creation wizard (mock; no API). */

export interface CampaignWizardFormData {
  name: string
  /** Primary region or market cluster the campaign optimizes for */
  targetMarket: string
  /** ISO 4217; used for budgets, bids, and reporting */
  currency: string
  objective: string
  campaignType: string
  budget: string
  /** daily | total | lifetime | monthly | shared — aligns with common ad platforms */
  budgetType: string
  bidStrategy: string
  maxCpc: string
  startDate: string
  endDate: string
  products: string[]
  productExclusions: string[]
  channels: string[]
  /** Selected surfaces per channel id (e.g. shopping → ["ai-search"]) */
  channelSurfaces: Record<string, string[]>
  regions: string[]
  ageBands: string[]
  interests: string[]
  devices: string[]
  headlinePrimary: string
  headlineSecondary: string
  description: string
  /** One or more fixed ratios — networks need matching crops per placement */
  imageAspectRatios: string[]
  imageUrl: string
  conversionGoals: string[]
  attributionModel: string
  utmPrefix: string
}

export const initialCampaignWizardForm: CampaignWizardFormData = {
  name: "",
  targetMarket: "",
  currency: "",
  objective: "",
  campaignType: "",
  budget: "",
  budgetType: "daily",
  bidStrategy: "",
  maxCpc: "",
  startDate: "",
  endDate: "",
  products: [],
  productExclusions: [],
  channels: [],
  channelSurfaces: {},
  regions: [],
  ageBands: [],
  interests: [],
  devices: [],
  headlinePrimary: "",
  headlineSecondary: "",
  description: "",
  imageAspectRatios: ["1.91:1"],
  imageUrl: "",
  conversionGoals: [],
  attributionModel: "",
  utmPrefix: "",
}

export const TARGET_MARKET_OPTIONS = [
  {
    value: "uk_ie",
    label: "UK & Ireland",
    description: "Prioritize GB and IE demand",
  },
  {
    value: "north_america",
    label: "North America",
    description: "US, Canada, and Mexico",
  },
  {
    value: "eu",
    label: "European Union",
    description: "EU single-market focus",
  },
  {
    value: "apac",
    label: "Asia-Pacific",
    description: "APAC growth markets",
  },
  {
    value: "global",
    label: "Global",
    description: "All supported regions",
  },
] as const

/** Common ISO 4217 currencies for campaign budgets (extend as needed). */
export const CURRENCY_OPTIONS = [
  { value: "GBP", label: "British pound", symbol: "£" },
  { value: "USD", label: "US dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "CAD", label: "Canadian dollar", symbol: "CA$" },
  { value: "AUD", label: "Australian dollar", symbol: "A$" },
  { value: "NZD", label: "New Zealand dollar", symbol: "NZ$" },
  { value: "JPY", label: "Japanese yen", symbol: "¥" },
  { value: "CNY", label: "Chinese yuan", symbol: "¥" },
  { value: "HKD", label: "Hong Kong dollar", symbol: "HK$" },
  { value: "SGD", label: "Singapore dollar", symbol: "S$" },
  { value: "KRW", label: "South Korean won", symbol: "₩" },
  { value: "INR", label: "Indian rupee", symbol: "₹" },
  { value: "THB", label: "Thai baht", symbol: "฿" },
  { value: "MYR", label: "Malaysian ringgit", symbol: "RM" },
  { value: "IDR", label: "Indonesian rupiah", symbol: "Rp" },
  { value: "PHP", label: "Philippine peso", symbol: "₱" },
  { value: "CHF", label: "Swiss franc", symbol: "CHF" },
  { value: "SEK", label: "Swedish krona", symbol: "kr" },
  { value: "NOK", label: "Norwegian krone", symbol: "kr" },
  { value: "DKK", label: "Danish krone", symbol: "kr" },
  { value: "PLN", label: "Polish złoty", symbol: "zł" },
  { value: "CZK", label: "Czech koruna", symbol: "Kč" },
  { value: "HUF", label: "Hungarian forint", symbol: "Ft" },
  { value: "RON", label: "Romanian leu", symbol: "lei" },
  { value: "TRY", label: "Turkish lira", symbol: "₺" },
  { value: "ILS", label: "Israeli shekel", symbol: "₪" },
  { value: "AED", label: "UAE dirham", symbol: "د.إ" },
  { value: "SAR", label: "Saudi riyal", symbol: "﷼" },
  { value: "ZAR", label: "South African rand", symbol: "R" },
  { value: "MXN", label: "Mexican peso", symbol: "MX$" },
  { value: "BRL", label: "Brazilian real", symbol: "R$" },
  { value: "CLP", label: "Chilean peso", symbol: "CL$" },
  { value: "COP", label: "Colombian peso", symbol: "COL$" },
  { value: "ARS", label: "Argentine peso", symbol: "AR$" },
] as const

export const CAMPAIGN_OBJECTIVE_OPTIONS = [
  {
    value: "sales",
    label: "Drive sales",
    description: "Revenue and completed purchases",
  },
  {
    value: "traffic",
    label: "More site visits",
    description: "Clicks and sessions to your store",
  },
  {
    value: "awareness",
    label: "Brand awareness",
    description: "Reach and consideration",
  },
  {
    value: "newcustomer",
    label: "New customers",
    description: "First-time buyers and sign-ups",
  },
  {
    value: "creator_commerce",
    label: "Creator Commerce",
    description:
      "via StylMatch — Partner with fashion creators for authentic product discovery and social-first sales.",
  },
] as const

export const CAMPAIGN_TYPE_OPTIONS = [
  {
    value: "performance",
    label: "Performance",
    description: "Cross-channel optimization",
  },
  {
    value: "shopping",
    label: "Shopping",
    description: "Product and catalog-led",
  },
  {
    value: "remarketing",
    label: "Remarketing",
    description: "Re-engage past visitors",
  },
] as const

/** Budget delivery: daily caps, full-flight totals, pacing, and shared pools (Google/Meta-style patterns). */
export const BUDGET_TYPE_OPTIONS = [
  {
    value: "daily",
    label: "Daily budget",
    description: "Average daily spend cap; platform may pace delivery across the day.",
  },
  {
    value: "total",
    label: "Total campaign budget",
    description: "Fixed spend for the entire campaign flight.",
  },
  {
    value: "lifetime",
    label: "Lifetime pacing",
    description: "Total budget spread evenly between start and end dates.",
  },
  {
    value: "monthly",
    label: "Monthly limit",
    description: "Cap per calendar month; renews each month.",
  },
  {
    value: "shared",
    label: "Shared budget pool",
    description: "Spend from a portfolio pool shared with other campaigns.",
  },
] as const

export const BID_STRATEGY_OPTIONS = [
  {
    value: "maximize_conversions",
    label: "Maximize conversions",
    description: "Automated bids to get the most conversions within budget.",
  },
  {
    value: "target_roas",
    label: "Target ROAS",
    description: "Optimize toward a target return on ad spend.",
  },
  {
    value: "target_cpa",
    label: "Target CPA",
    description: "Aim for a target cost per acquisition.",
  },
  {
    value: "manual_cpc",
    label: "Manual CPC",
    description: "You set max CPC; full control per auction.",
  },
] as const

export const IMAGE_ASPECT_RATIOS = [
  { value: "1.91:1", label: "Landscape 1.91:1", description: "Feed & search placements" },
  { value: "1:1", label: "Square 1:1", description: "Grid and shopping surfaces" },
  { value: "4:5", label: "Portrait 4:5", description: "Mobile feed" },
  { value: "9:16", label: "Vertical 9:16", description: "Stories and short video" },
] as const

export const ATTRIBUTION_OPTIONS = [
  { value: "data_driven", label: "Data-driven" },
  { value: "last_click", label: "Last click" },
  { value: "linear", label: "Linear" },
  { value: "position_based", label: "Position-based" },
] as const
