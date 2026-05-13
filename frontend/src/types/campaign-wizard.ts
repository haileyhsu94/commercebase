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
  /** Performance Max-style landing page used for final URL expansion and asset previews. */
  finalUrl: string
  finalUrlExpansion: boolean
  /** Comma-separated search themes that guide automated discovery. */
  searchThemes: string
  /** Freeform audience signal notes until real audience lists exist. */
  audienceSignals: string
  /** Performance Max asset group container name. */
  assetGroupName: string

  // --- Google Ads Performance Max additions ---
  /** Bidding focus: conversions | conversion_value | clicks | impression_share */
  biddingFocus: string
  /** Optional target CPA for conversions focus. */
  biddingTargetCpa: string
  /** Optional target ROAS for conversion-value focus. */
  biddingTargetRoas: string
  /** off | value | only — new-customer acquisition behavior. */
  newCustomerAcquisition: string
  /** presence_interest | presence | interest — location-targeting mode. */
  locationPresence: string
  /** ISO 639-1 language codes (e.g. "en"). */
  languages: string[]
  /** all_day | custom — ad schedule mode. */
  adScheduleMode: string
  /** Freeform comma-separated brand exclusions. */
  brandExclusions: string
  /** PMax short headline, max 30 characters. */
  headline: string
  /** PMax long headline, max 90 characters. */
  longHeadline: string
  /** PMax description line, max 90 characters. */
  adDescription: string
  /** Shown as the business / brand name in ads. */
  businessName: string
  /** See CALL_TO_ACTION_OPTIONS. */
  callToActionText: string
  /** URL display path segment 1. */
  displayPath1: string
  /** URL display path segment 2. */
  displayPath2: string
  /** Marketing image URLs (up to 20). */
  assetImageUrls: string[]
  /** Logo image URLs (up to 5). */
  assetLogoUrls: string[]
  /** YouTube video URLs (up to 5). */
  assetVideoUrls: string[]
  /** Display name for the audience signal (PMax). */
  audienceSignalName: string
  /** Names of selected customer data lists (mock). */
  customerDataLists: string[]
  /** Freeform custom segment keywords / URLs / apps. */
  audienceCustomSegments: string
  /** Merchant Center account id (mock). */
  merchantAccountId: string
  /** Whether to advertise products from a Merchant Center account. */
  advertiseMerchantProducts: boolean
  /** Whether "Set a target return on ad spend" is checked (Conversion value focus). */
  useTargetRoas: boolean
  /** Whether "Set a target cost per action" is checked (Conversions focus). */
  useTargetCpa: boolean
  /** Whether "Adjust your bidding to help acquire new customers" is on. */
  customerAcquisitionEnabled: boolean
  /** Whether the user clicked "Generate assets" on the Asset generation step. */
  assetGenerationEnabled: boolean
  /** Locations selection mode: All countries, home country, or custom search. */
  locationMode: "all" | "home" | "custom"
  /** EU political ads disclosure (required by Google in EU). */
  euPoliticalAds: "" | "yes" | "no"
  /** Demographic exclusions (free-form mock). */
  demographicExclusions: string
  /** "Your data" / audience exclusions (free-form mock). */
  dataExclusions: string

  // --- Asset group: Listing groups ---
  /** "all" = Use all products, "selection" = pick categories. */
  listingGroupsMode: "all" | "selection"
  /** Selected listing-group categories (Google product taxonomy mock). */
  listingGroupCategories: string[]

  // --- Asset group: Brand guidelines ---
  /** Whether the campaign uses a business name (radio in Brand identity). */
  brandIdentityUseBusinessName: boolean
  /** Whether the campaign uses brand logos (radio in Brand identity). */
  brandIdentityUseLogos: boolean
  /** Brand main / accent hex colors (e.g. #ffffff). */
  brandMainColor: string
  brandAccentColor: string
  /** Brand font preference. */
  brandFont: string
  /** Up to 25 term exclusions (Text guidelines). */
  brandTermExclusions: string
  /** Up to 40 messaging restrictions (Text guidelines). */
  brandMessagingRestrictions: string

  // --- Asset group: Asset optimization ---
  /** Use text customization from site/landing pages. */
  assetOptTextCustomization: boolean
  /** Final URL expansion (asset-group level). */
  assetOptUrlExpansion: boolean
  /** Image enhancement (auto crop / format). */
  assetOptImageEnhancement: boolean
  /** Pull images from landing page. */
  assetOptLandingPageImages: boolean
  /** Generate vertical / shorter video versions. */
  assetOptVideoEnhancement: boolean

  // --- Asset group: Sitelinks (count of recommended sitelinks user added) ---
  /** Mock sitelink labels (free text). */
  sitelinks: string[]

  // --- Asset group: More options ---
  /** Whether to use a different final URL for mobile. */
  useMobileFinalUrl: boolean
  /** Mobile-specific final URL. */
  finalUrlMobile: string
  /** Tracking template for the asset group. */
  trackingTemplate: string
  /** Final URL suffix appended to landing page URLs. */
  finalUrlSuffix: string
  /** Custom parameter name (without braces). */
  customParamName: string
  /** Custom parameter value. */
  customParamValue: string
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
  finalUrl: "",
  finalUrlExpansion: true,
  searchThemes: "",
  audienceSignals: "",
  assetGroupName: "Asset group 1",
  biddingFocus: "",
  biddingTargetCpa: "",
  biddingTargetRoas: "",
  newCustomerAcquisition: "off",
  locationPresence: "presence_interest",
  languages: [],
  adScheduleMode: "all_day",
  brandExclusions: "",
  headline: "",
  longHeadline: "",
  adDescription: "",
  businessName: "",
  callToActionText: "",
  displayPath1: "",
  displayPath2: "",
  assetImageUrls: [],
  assetLogoUrls: [],
  assetVideoUrls: [],
  audienceSignalName: "",
  customerDataLists: [],
  audienceCustomSegments: "",
  merchantAccountId: "",
  advertiseMerchantProducts: true,
  useTargetRoas: false,
  useTargetCpa: false,
  customerAcquisitionEnabled: false,
  assetGenerationEnabled: false,
  locationMode: "all",
  euPoliticalAds: "",
  demographicExclusions: "",
  dataExclusions: "",
  listingGroupsMode: "all",
  listingGroupCategories: [],
  brandIdentityUseBusinessName: true,
  brandIdentityUseLogos: false,
  brandMainColor: "",
  brandAccentColor: "",
  brandFont: "",
  brandTermExclusions: "",
  brandMessagingRestrictions: "",
  assetOptTextCustomization: true,
  assetOptUrlExpansion: true,
  assetOptImageEnhancement: true,
  assetOptLandingPageImages: true,
  assetOptVideoEnhancement: true,
  sitelinks: [],
  useMobileFinalUrl: false,
  finalUrlMobile: "",
  trackingTemplate: "",
  finalUrlSuffix: "",
  customParamName: "",
  customParamValue: "",
}

/** PMax asset text: merge single fields with legacy wizard snapshots that used string arrays. */
export function assetTextFromLegacySnapshot(
  raw: Partial<CampaignWizardFormData> & {
    headlines?: string[]
    longHeadlines?: string[]
    descriptions?: string[]
  }
): Pick<CampaignWizardFormData, "headline" | "longHeadline" | "adDescription"> {
  return {
    headline: raw.headline?.trim() || raw.headlines?.[0]?.trim() || "",
    longHeadline: raw.longHeadline?.trim() || raw.longHeadlines?.[0]?.trim() || "",
    adDescription: raw.adDescription?.trim() || raw.descriptions?.[0]?.trim() || "",
  }
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
    label: "Sales",
    description: "Drive sales online, in app, by phone, or in store",
  },
  {
    value: "leads",
    label: "Leads",
    description: "Get leads and other conversions by encouraging customers to take action",
  },
  {
    value: "website_traffic",
    label: "Website traffic",
    description: "Get the right people to visit your website",
  },
  {
    value: "app_promotion",
    label: "App promotion",
    description: "Get more installs, engagement and pre-registration for your app",
  },
  {
    value: "awareness_consideration",
    label: "YouTube reach, views, and engagements",
    description: "Drive awareness and consideration of your product or brand",
    note: "Previously known as \u201CAwareness and consideration\u201D",
  },
  {
    value: "local_store_visits",
    label: "Local store visits and promotions",
    description: "Drive visits to local stores, including restaurants and dealerships.",
  },
  {
    value: "no_goal_guidance",
    label: "Create a campaign without guidance",
    description: "You'll choose a campaign next",
  },
] as const

export const CAMPAIGN_TYPE_OPTIONS = [
  {
    value: "performance_max",
    label: "Performance Max",
    description:
      "Drive sales by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more.",
  },
  {
    value: "shopping",
    label: "Shopping",
    description: "Promote your products from Merchant Center on Google Search with Shopping ads",
  },
  {
    value: "demand_gen",
    label: "Demand Gen",
    description:
      "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads",
  },
  {
    value: "search",
    label: "Search",
    description: "Drive sales on Google Search with text ads",
  },
  {
    value: "video",
    label: "Video",
    description: "Drive sales on YouTube with your video ads",
  },
  {
    value: "display",
    label: "Display",
    description: "Reach potential customers across 3 million sites and apps with your creative",
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

/** Google Ads Performance Max bidding focus. */
export const BIDDING_FOCUS_OPTIONS = [
  {
    value: "conversions",
    label: "Conversions",
    description: "Smart Bidding drives the most conversions within budget.",
  },
  {
    value: "conversion_value",
    label: "Conversion value",
    description: "Optimize toward highest total conversion value.",
  },
  {
    value: "clicks",
    label: "Clicks",
    description: "Maximize clicks to the Final URL.",
  },
  {
    value: "impression_share",
    label: "Impression share",
    description: "Target a share of eligible impressions.",
  },
] as const

/** Locations targeting behavior (matches Google Ads advanced location options). */
export const LOCATION_PRESENCE_OPTIONS = [
  {
    value: "presence_interest",
    label: "Presence or interest",
    description: "People in, regularly in, or who've shown interest in your targeted locations (recommended).",
  },
  {
    value: "presence",
    label: "Presence",
    description: "People in or regularly in your targeted locations.",
  },
  {
    value: "interest",
    label: "Interest",
    description: "People searching for your targeted locations.",
  },
] as const

/**
 * Languages ads are eligible to appear in.
 * Mirrors the Google Ads supported language list (alphabetical).
 */
export const LANGUAGE_OPTIONS = [
  { value: "ar", label: "Arabic" },
  { value: "bn", label: "Bengali" },
  { value: "bg", label: "Bulgarian" },
  { value: "ca", label: "Catalan" },
  { value: "zh-CN", label: "Chinese (simplified)" },
  { value: "zh-TW", label: "Chinese (traditional)" },
  { value: "hr", label: "Croatian" },
  { value: "cs", label: "Czech" },
  { value: "da", label: "Danish" },
  { value: "nl", label: "Dutch" },
  { value: "en", label: "English" },
  { value: "et", label: "Estonian" },
  { value: "fil", label: "Filipino" },
  { value: "fi", label: "Finnish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "el", label: "Greek" },
  { value: "gu", label: "Gujarati" },
  { value: "he", label: "Hebrew" },
  { value: "hi", label: "Hindi" },
  { value: "hu", label: "Hungarian" },
  { value: "is", label: "Icelandic" },
  { value: "id", label: "Indonesian" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "kn", label: "Kannada" },
  { value: "ko", label: "Korean" },
  { value: "lv", label: "Latvian" },
  { value: "lt", label: "Lithuanian" },
  { value: "ms", label: "Malay" },
  { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" },
  { value: "no", label: "Norwegian" },
  { value: "fa", label: "Persian" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "pa", label: "Punjabi" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "sr", label: "Serbian" },
  { value: "sk", label: "Slovak" },
  { value: "sl", label: "Slovenian" },
  { value: "es", label: "Spanish" },
  { value: "sv", label: "Swedish" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "th", label: "Thai" },
  { value: "tr", label: "Turkish" },
  { value: "uk", label: "Ukrainian" },
  { value: "ur", label: "Urdu" },
  { value: "vi", label: "Vietnamese" },
] as const

/** Google Ads call-to-action text options for Performance Max. */
export const CALL_TO_ACTION_OPTIONS = [
  { value: "automated", label: "Automated" },
  { value: "apply_now", label: "Apply now" },
  { value: "book_now", label: "Book now" },
  { value: "contact_us", label: "Contact us" },
  { value: "download", label: "Download" },
  { value: "get_quote", label: "Get a quote" },
  { value: "get_offer", label: "Get offer" },
  { value: "learn_more", label: "Learn more" },
  { value: "order_now", label: "Order now" },
  { value: "see_more", label: "See more" },
  { value: "shop_now", label: "Shop now" },
  { value: "sign_up", label: "Sign up" },
  { value: "subscribe", label: "Subscribe" },
  { value: "visit_site", label: "Visit site" },
] as const

/**
 * Mock Google Merchant Center "Listing groups" used in the Asset group step.
 * Numbers approximate the categories shown in the Google Ads UI screenshots
 * (Animals & Pet Supplies, Apparel & Accessories, Cameras & Optics, etc.).
 */
export const LISTING_GROUP_CATEGORIES = [
  { id: "animals_pet_supplies", label: "Animals & Pet Supplies", listings: 9408 },
  { id: "arts_entertainment", label: "Arts & Entertainment", listings: 19251 },
  { id: "business_industrial", label: "Business & Industrial", listings: 3907 },
  { id: "cameras_optics", label: "Cameras & Optics", listings: 5355 },
  { id: "apparel_accessories", label: "Apparel & Accessories", listings: 6050467 },
  { id: "electronics", label: "Electronics", listings: 32362 },
  { id: "food_beverages_tobacco", label: "Food, Beverages & Tobacco", listings: 14820 },
  { id: "furniture", label: "Furniture", listings: 9230 },
  { id: "hardware", label: "Hardware", listings: 5180 },
  { id: "health_beauty", label: "Health & Beauty", listings: 122005 },
  { id: "home_garden", label: "Home & Garden", listings: 87412 },
  { id: "luggage_bags", label: "Luggage & Bags", listings: 18430 },
  { id: "media", label: "Media", listings: 7211 },
  { id: "office_supplies", label: "Office Supplies", listings: 4502 },
  { id: "software", label: "Software", listings: 1023 },
  { id: "sporting_goods", label: "Sporting Goods", listings: 24790 },
  { id: "toys_games", label: "Toys & Games", listings: 16390 },
  { id: "vehicles_parts", label: "Vehicles & Parts", listings: 3580 },
] as const

/** Objective-specific conversion goal suggestions (simplified account defaults). */
export const OBJECTIVE_CONVERSION_GOAL_DEFAULTS: Record<string, string[]> = {
  sales: ["purchase", "add_to_cart"],
  leads: ["lead", "signup"],
  website_traffic: ["page_view"],
  app_promotion: ["app_install"],
  awareness_consideration: ["page_view"],
  local_store_visits: ["store_visit"],
  no_goal_guidance: [],
}
