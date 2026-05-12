import type { LucideIcon } from "lucide-react"
import type { CampaignWizardFormData } from "@/types/campaign-wizard"
import {
  Home,
  Megaphone,
  DollarSign,
  Activity,
  BarChart3,
  Bot,
  ShoppingCart,
} from "lucide-react"

export interface NavItem {
  title: string
  icon: LucideIcon
  href: string
  isActive?: boolean
}

/** Top-level items before AI Visibility hub + sections; Analytics + Assets use grouped nav in AppSidebar. */
export const navigationItems: NavItem[] = [
  { title: "Home", icon: Home, href: "/" },
  { title: "Campaigns", icon: Megaphone, href: "/campaigns" },
  { title: "AI Visibility", icon: Bot, href: "/ai-presence" },
]

export interface StatCard {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
}

export const statsCards: StatCard[] = [
  {
    title: "Total Revenue",
    value: "$75,800",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "902",
    change: "+12%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Average Order Value",
    value: "$84",
    change: "+2.1%",
    trend: "up",
    icon: Activity,
  },
  {
    title: "ROAS",
    value: "682%",
    change: "-3%",
    trend: "down",
    icon: BarChart3,
  },
]

export interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "draft" | "ended"
  goal?: string
  budget?: string
  spent: string
  clicks?: string
  orders?: number
  revenue: string
  cvr: string
  roas: string
  cpa?: string
  cpc: string
  cps: string
  /** ISO timestamp when the campaign went live (user launches); used for included-campaigns-per-month. */
  launchedAt?: string
  /** Saved when launched from the wizard — used for Duplicate campaign. */
  wizardSnapshot?: CampaignWizardFormData
  /** AI-generated campaign data (brief, tasks, deliverables, chats). */
  aiCampaign?: import("@/lib/campaign-brief-mock").AiCampaignData
}

export const campaigns: Campaign[] = [
  // Active (4)
  { id: "1", name: "SS26 Luxury — Drive Sales", status: "active", goal: "Drive Sales", budget: "$5.0K", spent: "$3.2K", clicks: "6,154", orders: 104, revenue: "$28.6K", cvr: "1.69%", roas: "879%", cpa: "$30.77", cpc: "$0.52", cps: "$18.40" },
  { id: "2", name: "Sneakers Q2 — New Customer", status: "active", goal: "New Customer", budget: "$3.0K", spent: "$1.9K", clicks: "4,634", orders: 115, revenue: "$19.2K", cvr: "2.48%", roas: "1034%", cpa: "$16.52", cpc: "$0.41", cps: "$12.10" },
  { id: "3", name: "FW26 Collection Launch", status: "active", goal: "Product Push", budget: "$8.0K", spent: "$5.1K", clicks: "7,500", orders: 44, revenue: "$15.6K", cvr: "0.59%", roas: "305%", cpa: "$115.91", cpc: "$0.68", cps: "$26.50" },
  { id: "4", name: "Summer Sale — Stock Clearance", status: "active", goal: "Drive Sales", budget: "$1.5K", spent: "$890", clicks: "2,543", orders: 76, revenue: "$12.4K", cvr: "3.00%", roas: "1393%", cpa: "$11.71", cpc: "$0.35", cps: "$9.80" },
  // Paused (2)
  { id: "5", name: "Brand Awareness — Luxury Segment", status: "paused", goal: "Brand Awareness", budget: "$4.0K", spent: "$2.8K", clicks: "5,210", orders: 31, revenue: "$9.3K", cvr: "0.60%", roas: "332%", cpa: "$90.32", cpc: "$0.54", cps: "$22.00" },
  { id: "6", name: "Retargeting — Cart Abandoners", status: "paused", goal: "Drive Sales", budget: "$2.0K", spent: "$1.7K", clicks: "3,880", orders: 62, revenue: "$8.1K", cvr: "1.60%", roas: "476%", cpa: "$27.42", cpc: "$0.44", cps: "$14.50" },
  // Draft (1)
  { id: "7", name: "Back to School 2026", status: "draft", goal: "New Customer", budget: "$6.0K", spent: "$0", clicks: "0", orders: 0, revenue: "$0", cvr: "0.00%", roas: "0%", cpa: "—", cpc: "$0.00", cps: "$0.00" },
  // Ended (4)
  { id: "8", name: "Valentine's Day Gifting", status: "ended", goal: "Drive Sales", budget: "$3.5K", spent: "$3.5K", clicks: "8,920", orders: 189, revenue: "$22.4K", cvr: "2.12%", roas: "640%", cpa: "$18.52", cpc: "$0.39", cps: "$11.80" },
  { id: "9", name: "Spring Sneaker Drop", status: "ended", goal: "Product Push", budget: "$2.5K", spent: "$2.5K", clicks: "4,100", orders: 58, revenue: "$10.7K", cvr: "1.41%", roas: "428%", cpa: "$43.10", cpc: "$0.61", cps: "$19.30" },
  { id: "10", name: "Holiday 2025 — Premium Gifts", status: "ended", goal: "Drive Sales", budget: "$10.0K", spent: "$10.0K", clicks: "18,400", orders: 312, revenue: "$56.2K", cvr: "1.70%", roas: "562%", cpa: "$32.05", cpc: "$0.54", cps: "$17.60" },
  { id: "11", name: "Black Friday Flash Sale", status: "ended", goal: "Drive Sales", budget: "$7.0K", spent: "$7.0K", clicks: "22,300", orders: 485, revenue: "$41.8K", cvr: "2.18%", roas: "597%", cpa: "$14.43", cpc: "$0.31", cps: "$8.90" },
]

/** Default company context for catalog, AI copy, and onboarding (override in Settings). */
export const defaultCompanyProfile = {
  companyName: "Realry Inc.",
  website: "https://realry.com",
  primaryEmail: "john@realry.com",
  industry: "Fashion & apparel",
  companySize: "51-200",
  timeZone: "America/New_York",
  country: "United States",
  city: "New York",
  catalogSource: "Primary product feed (Google Merchant Center)",
}

export interface Alert {
  id: string
  type: "success" | "warning" | "info"
  title: string
  description: string
  time: string
  actionLabel?: string
  actionHref?: string
}

export const alerts: Alert[] = [
  {
    id: "1",
    type: "success",
    title: "Sneakers Q2 hit 1,034% ROAS",
    description: "Exceeding target by 2x",
    time: "2h ago",
    actionLabel: "View Campaign",
    actionHref: "/campaigns/2",
  },
  {
    id: "2",
    type: "warning",
    title: "FW26 Collection CVR dropped below 1%",
    description: "Consider audience refinement",
    time: "5h ago",
    actionLabel: "Investigate",
    actionHref: "/campaigns/3",
  },
  {
    id: "3",
    type: "info",
    title: "Missing from 38% of AI shopping conversations",
    description: "Improve your share of voice in AI shopping answers",
    time: "1d ago",
    actionLabel: "View AI Visibility",
    actionHref: "/ai-presence",
  },
]

/** Simple Icons SVGs (monochrome brand marks) via jsDelivr — see https://simpleicons.org */
export const SIMPLE_ICONS_CDN =
  "https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons" as const

export function simpleIconSvgUrl(slug: string): string {
  return `${SIMPLE_ICONS_CDN}/${slug}.svg`
}

export interface AIVisibilityData {
  /** Overall share of voice (SoV), 0–100 — mention share & position in AI shopping answers */
  overallScore: number
  platforms: {
    name: string
    /** Fallback initial if logo fails to load */
    shortName: string
    /** SoV for this AI platform */
    score: number
    color: string
    /** Simple Icons slug — https://github.com/simple-icons/simple-icons/blob/develop/slugs.md */
    iconSlug: string
  }[]
  shoppingQueries: number
  missedOpportunities: number
}

export const aiVisibilityData: AIVisibilityData = {
  overallScore: 64,
  platforms: [
    { name: "ChatGPT", shortName: "C", score: 78, color: "bg-green-500", iconSlug: "openai" },
    { name: "Perplexity", shortName: "P", score: 72, color: "bg-purple-500", iconSlug: "perplexity" },
    { name: "Gemini", shortName: "G", score: 65, color: "bg-blue-500", iconSlug: "googlegemini" },
    { name: "Claude", shortName: "C", score: 58, color: "bg-orange-500", iconSlug: "anthropic" },
    /* Simple Icons has no MS Copilot; GitHub Copilot mark is the closest stock slug */
    { name: "Copilot", shortName: "C", score: 45, color: "bg-cyan-500", iconSlug: "githubcopilot" },
    /* No grok slug yet; X brand mark (Grok ships inside X) */
    { name: "Grok", shortName: "X", score: 62, color: "bg-zinc-900", iconSlug: "x" },
  ],
  shoppingQueries: 42500,
  missedOpportunities: 3,
}

export interface ChannelPerformance {
  name: string
  description: string
  impressions: string
  clicks: string
  conversions: number
  revenue: string
  cvr: string
  roas: string
  share: number
  model: string
}

export const channelPerformance: ChannelPerformance[] = [
  {
    name: "Shopping",
    description: "AI Search & Price Comparison",
    impressions: "2.1M",
    clicks: "28.4K",
    conversions: 412,
    revenue: "$32.8K",
    cvr: "1.45%",
    roas: "872%",
    share: 38,
    model: "CPC + CPS",
  },
  {
    name: "Creator",
    description: "StylMatch Creator Network",
    impressions: "1.4M",
    clicks: "18.2K",
    conversions: 298,
    revenue: "$21.6K",
    cvr: "1.64%",
    roas: "1120%",
    share: 25,
    model: "CPS",
  },
  {
    name: "Commerce Network",
    description: "DailyClick & Partner Publishers",
    impressions: "1.6M",
    clicks: "19.0K",
    conversions: 192,
    revenue: "$21.4K",
    cvr: "1.01%",
    roas: "510%",
    share: 25,
    model: "CPC",
  },
  {
    name: "Vertical",
    description: "Sneakers123, Flex Dog",
    impressions: "650K",
    clicks: "8.1K",
    conversions: 85,
    revenue: "$9.4K",
    cvr: "1.05%",
    roas: "410%",
    share: 12,
    model: "CPC + CPS",
  },
]

export interface RegionRevenue {
  name: string
  revenue: number
}

// Top 20 countries by revenue with mock data
export const regionRevenueDistribution: RegionRevenue[] = [
  { name: "United States of America", revenue: 15400 },
  { name: "United Kingdom", revenue: 12100 },
  { name: "Germany", revenue: 8500 },
  { name: "Canada", revenue: 6400 },
  { name: "France", revenue: 5200 },
  { name: "Australia", revenue: 4100 },
  { name: "Japan", revenue: 3800 },
  { name: "China", revenue: 3500 },
  { name: "Italy", revenue: 3100 },
  { name: "Spain", revenue: 2900 },
  { name: "Brazil", revenue: 2700 },
  { name: "Netherlands", revenue: 2500 },
  { name: "Sweden", revenue: 2200 },
  { name: "Switzerland", revenue: 1900 },
  { name: "South Korea", revenue: 1700 },
  { name: "Mexico", revenue: 1500 },
  { name: "India", revenue: 1400 },
  { name: "Russia", revenue: 1200 },
  { name: "Singapore", revenue: 1100 },
  { name: "United Arab Emirates", revenue: 950 },
]


export interface Product {
  id: string
  name: string
  category: string
  sales: number
  cvr: string
  revenue: string
  image?: string
  /** Sync / listing state for catalog views */
  status?: string
}

export const topProducts: Product[] = [
  { id: "1", name: "Nike Air Max 97 Silver Bullet", category: "Sneakers", sales: 142, cvr: "3.2%", revenue: "$18.5K" },
  { id: "2", name: "Gucci GG Marmont Mini Bag", category: "Luxury", sales: 87, cvr: "2.1%", revenue: "$15.7K" },
  { id: "3", name: "Adidas Samba OG White", category: "Sneakers", sales: 198, cvr: "4.8%", revenue: "$13.9K" },
  { id: "4", name: "Moncler Maya Down Jacket", category: "Luxury", sales: 34, cvr: "1.4%", revenue: "$11.6K" },
  { id: "5", name: "New Balance 530 Silver Navy", category: "Sneakers", sales: 156, cvr: "3.6%", revenue: "$10.9K" },
]

export interface RegionData {
  name: string
  revenue: string
  change: string
  trend: "up" | "down"
}

export const regionData: RegionData[] = [
  { name: "United Kingdom", revenue: "$28.8K", change: "+12%", trend: "up" },
  { name: "United States", revenue: "$22.6K", change: "+8%", trend: "up" },
  { name: "Germany", revenue: "$9.1K", change: "+22%", trend: "up" },
  { name: "France", revenue: "$7.6K", change: "-3%", trend: "down" },
  { name: "Others", revenue: "$7.7K", change: "+5%", trend: "up" },
]

export const revenueChartData = [
  { date: "Mar 19", revenue: 4200 },
  { date: "Mar 20", revenue: 3800 },
  { date: "Mar 21", revenue: 5100 },
  { date: "Mar 22", revenue: 4600 },
  { date: "Mar 23", revenue: 5800 },
  { date: "Mar 24", revenue: 6200 },
  { date: "Mar 25", revenue: 5400 },
  { date: "Mar 26", revenue: 4900 },
  { date: "Mar 27", revenue: 5700 },
  { date: "Mar 28", revenue: 6100 },
  { date: "Mar 29", revenue: 5300 },
  { date: "Mar 30", revenue: 6400 },
  { date: "Mar 31", revenue: 5900 },
]

export const spendChartData = [
  { date: "Mar 19", spend: 680 },
  { date: "Mar 20", spend: 720 },
  { date: "Mar 21", spend: 810 },
  { date: "Mar 22", spend: 750 },
  { date: "Mar 23", spend: 820 },
  { date: "Mar 24", spend: 880 },
  { date: "Mar 25", spend: 790 },
  { date: "Mar 26", spend: 760 },
  { date: "Mar 27", spend: 830 },
  { date: "Mar 28", spend: 870 },
  { date: "Mar 29", spend: 800 },
  { date: "Mar 30", spend: 910 },
  { date: "Mar 31", spend: 850 },
]

/** Daily efficiency metrics; same calendar span as revenue/spend charts. */
export interface EfficiencyChartRow {
  date: string
  /** Average CPC in USD */
  cpc: number
  /** Cost per sale (order) in USD */
  cps: number
  /** Click-through rate, 0–1 (e.g. 0.024 = 2.4%) */
  ctr: number
  /** Conversion rate, 0–1 (e.g. 0.0172 = 1.72%) */
  cvr: number
}

export const efficiencyChartData: EfficiencyChartRow[] = [
  { date: "Mar 19", cpc: 0.58, cps: 18.4, ctr: 0.021, cvr: 0.0165 },
  { date: "Mar 20", cpc: 0.61, cps: 19.1, ctr: 0.02, cvr: 0.0158 },
  { date: "Mar 21", cpc: 0.55, cps: 17.2, ctr: 0.022, cvr: 0.017 },
  { date: "Mar 22", cpc: 0.57, cps: 17.8, ctr: 0.0215, cvr: 0.0162 },
  { date: "Mar 23", cpc: 0.54, cps: 16.9, ctr: 0.023, cvr: 0.0175 },
  { date: "Mar 24", cpc: 0.52, cps: 16.2, ctr: 0.0235, cvr: 0.018 },
  { date: "Mar 25", cpc: 0.56, cps: 17.5, ctr: 0.0225, cvr: 0.0168 },
  { date: "Mar 26", cpc: 0.59, cps: 18.0, ctr: 0.021, cvr: 0.016 },
  { date: "Mar 27", cpc: 0.53, cps: 16.5, ctr: 0.024, cvr: 0.0178 },
  { date: "Mar 28", cpc: 0.51, cps: 15.9, ctr: 0.0245, cvr: 0.0182 },
  { date: "Mar 29", cpc: 0.55, cps: 17.0, ctr: 0.023, cvr: 0.017 },
  { date: "Mar 30", cpc: 0.5, cps: 15.4, ctr: 0.025, cvr: 0.0188 },
  { date: "Mar 31", cpc: 0.52, cps: 16.0, ctr: 0.024, cvr: 0.018 },
]

/** Sparkline + headline for the Efficiency Metrics card (last point vs mock prior-period delta). */
export type EfficiencyMetricKey = "cpc" | "cps" | "ctr" | "cvr"

export interface EfficiencyMetricSummary {
  key: EfficiencyMetricKey
  label: string
  value: string
  change: string
  trend: "up" | "down"
}

export const efficiencyMetricSummaries: EfficiencyMetricSummary[] = [
  { key: "cpc", label: "CPC", value: "$0.52", change: "-10.3%", trend: "down" },
  { key: "cps", label: "CPS", value: "$16.00", change: "-13.0%", trend: "down" },
  { key: "ctr", label: "CTR", value: "2.40%", change: "+0.3pp", trend: "up" },
  { key: "cvr", label: "Conv. rate", value: "1.80%", change: "+0.2pp", trend: "up" },
]

export const currentUser = {
  name: "John Doe",
  email: "john@realry.com",
  avatar: "https://github.com/shadcn.png",
  initials: "JD",
  company: "Realry Inc.",
}

