import { 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Globe, 
  Users, 
  Zap, 
  ShoppingBag,
  TrendingUp,
  BarChart3
} from "lucide-react"

// ─── Catalogs Mock Data ───────────────────────────────────────────────────────

export const catalogMetrics = [
  { 
    title: "Total Products", 
    value: "124,892", 
    description: "Total items in master catalog", 
    icon: Database,
    trend: "up",
    change: "+1.2%",
    percentage: 85
  },
  { 
    title: "Active Listings", 
    value: "124,410", 
    description: "Successfully synced to partners", 
    icon: CheckCircle2,
    trend: "up",
    change: "+0.8%",
    percentage: 99.6
  },
  { 
    title: "Issues Found", 
    value: "482", 
    description: "Items requiring data fixes", 
    icon: AlertCircle,
    trend: "down",
    change: "-12%",
    percentage: 45
  },
  { 
    title: "Sync Health", 
    value: "99.6%", 
    description: "Overall success rate (24h)", 
    icon: Zap,
    trend: "up",
    change: "+0.2%",
    percentage: 99.6
  },
]

export const productFeeds = [
  {
    id: "f1",
    name: "Master Product Feed",
    source: "Shopify / GMC",
    status: "healthy",
    items: 124892,
    syncProgress: 100,
    lastSync: "32 min ago",
    schedule: "Every 2 hours",
    issues: 0,
  },
  {
    id: "f2",
    name: "FlexDog Luxury Feed",
    source: "Custom Export",
    status: "warning",
    items: 12500,
    syncProgress: 100,
    lastSync: "1 hour ago",
    schedule: "Daily at 04:00",
    issues: 382,
  },
  {
    id: "f3",
    name: "Sneakers123 Vertical",
    source: "API Push",
    status: "syncing",
    items: 45200,
    syncProgress: 68,
    lastSync: "Syncing now...",
    schedule: "Continuous",
    issues: 100,
  },
]

export const feedIssues = [
  {
    id: "i1",
    title: "Missing / Low-res Image",
    count: 312,
    impact: "High",
    description: "Items missing a primary image or resolution < 800px. High impact on CTR.",
    category: "Media",
  },
  {
    id: "i2",
    title: "Invalid / Missing GTIN",
    count: 145,
    impact: "Medium",
    description: "Items missing global trade identifiers. Affects visibility in shopping comparison.",
    category: "Identifiers",
  },
  {
    id: "i3",
    title: "Missing Brand Attribute",
    count: 25,
    impact: "Low",
    description: "Items missing brand name. Recommended for better search filtering.",
    category: "Attributes",
  },
]

export const catalogCategoryPerformance = [
  { name: "Luxury Bags", roas: "12.4x", cvr: "4.2%", revenue: "$45.2K", trend: "up" },
  { name: "Mens Sneakers", roas: "8.9x", cvr: "3.2%", revenue: "$38.1K", trend: "up" },
  { name: "Womens Apparel", roas: "6.2x", cvr: "2.1%", revenue: "$22.4K", trend: "down" },
  { name: "Accessories", roas: "4.5x", cvr: "1.8%", revenue: "$12.8K", trend: "up" },
]

// ─── Publishers Mock Data ─────────────────────────────────────────────────────

export const publisherMetrics = [
  { 
    title: "Total Publishers", 
    value: "47", 
    description: "Active network partners", 
    icon: Globe,
    trend: "up",
    change: "+2"
  },
  { 
    title: "Total Impressions", 
    value: "5.15M", 
    description: "Aggregate reach (30d)", 
    icon: BarChart3,
    trend: "up",
    change: "+18%"
  },
  { 
    title: "Network Revenue", 
    value: "$72.4K", 
    description: "Last 30 days total", 
    icon: TrendingUp,
    trend: "up",
    change: "+15%"
  },
  { 
    title: "Avg. Publisher CVR", 
    value: "1.84%", 
    description: "Baseline conversion", 
    icon: Zap,
    trend: "up",
    change: "+0.12pp"
  },
]

export const networkSegments = [
  {
    name: "Shopping",
    impressions: "2.1M",
    roas: "8.7x",
    status: "active",
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    name: "Creator",
    impressions: "1.4M",
    roas: "11.2x",
    status: "active",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/30",
  },
  {
    name: "Open Web",
    impressions: "1.0M",
    roas: "5.1x",
    status: "active",
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    name: "Vertical",
    impressions: "650K",
    roas: "4.1x",
    status: "active",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
]

export const publishersList = [
  {
    id: "p1",
    name: "DailyClick Network",
    type: "Owned",
    impressions: "1.2M",
    cvr: "2.1%",
    revenue: "$28.4K",
    roas: "9.2x",
    status: "active",
  },
  {
    id: "p2",
    name: "StyleWire Editorial",
    type: "Partner",
    impressions: "850K",
    cvr: "1.8%",
    revenue: "$15.6K",
    roas: "6.4x",
    status: "active",
  },
  {
    id: "p3",
    name: "FlexDog Comparison",
    type: "Vertical",
    impressions: "420K",
    cvr: "4.5%",
    revenue: "$12.1K",
    roas: "11.8x",
    status: "active",
  },
  {
    id: "p4",
    name: "Metro Deals",
    type: "Aggregator",
    impressions: "310K",
    cvr: "1.2%",
    revenue: "$8.4K",
    roas: "4.2x",
    status: "paused",
  },
  {
    id: "p5",
    name: "LuxMedia Network",
    type: "Partner",
    impressions: "280K",
    cvr: "0.9%",
    revenue: "$7.9K",
    roas: "3.8x",
    status: "active",
  },
]
