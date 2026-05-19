import {
  AlertTriangle,
  BarChart3,
  Mail,
  PackageX,
  Radar,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { AutopilotArtifact } from "@/types/agent"

export interface FlowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: LucideIcon
  iconColor: string
  prompt: string
}

// Commerce-media-aligned templates. Categories mirror the product surfaces in
// PRODUCT_VISION.md (§3 Campaigns, §4 Analytics, §5 AI Presence, §6 Catalog).
export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: "ai-email-digest",
    name: "AI Email — daily digest",
    description: "Schedule → AI picks 5 products → personalized email to VIPs at 9am.",
    category: "Campaigns",
    icon: Mail,
    iconColor: "#7C3AED",
    prompt: "Send a daily AI-curated product digest to my VIP segment at 9am.",
  },
  {
    id: "catalog-ai-activate",
    name: "Catalog → AI Activation",
    description: "When a catalog syncs, enrich attributes and push to publishers.",
    category: "Catalog",
    icon: Sparkles,
    iconColor: "#0EA5E9",
    prompt: "When my catalog syncs, enrich attributes with AI and activate to publishers.",
  },
  {
    id: "roas-rebalance",
    name: "ROAS Rebalance",
    description: "Detect a ROAS drop on any channel and shift budget to top performers.",
    category: "Optimisation",
    icon: TrendingUp,
    iconColor: "#10B981",
    prompt: "If ROAS drops below 2.0 on any channel, rebalance budget toward top performers.",
  },
  {
    id: "audience-retarget",
    name: "High-Intent Retarget",
    description: "Build a retargeting campaign when AI shoppers show high purchase intent.",
    category: "Audiences",
    icon: Target,
    iconColor: "#F97316",
    prompt: "Spin up a retargeting campaign for high-intent shoppers detected by AI.",
  },
  {
    id: "competitor-gap",
    name: "Competitor Gap Agent",
    description: "Watch share-of-voice and draft an Auto Agent playbook when a competitor pulls ahead.",
    category: "AI Visibility",
    icon: Radar,
    iconColor: "#A855F7",
    prompt: "Monitor competitor share of voice and draft a response playbook on regression.",
  },
  {
    id: "out-of-stock-exclude",
    name: "Out-of-Stock Exclusion",
    description: "Pause publisher placements within 5 minutes of a SKU going out of stock.",
    category: "Catalog",
    icon: PackageX,
    iconColor: "#EF4444",
    prompt: "When a SKU goes out of stock, pause it across all publisher placements.",
  },
  {
    id: "promo-creative-refresh",
    name: "Promo Creative Refresh",
    description: "When a price drop fires, regenerate ad creative and queue for review.",
    category: "Campaigns",
    icon: RefreshCw,
    iconColor: "#EC4899",
    prompt: "When a product goes on sale, refresh its ad creative and queue for approval.",
  },
  {
    id: "prompt-monitor",
    name: "AI Prompt Monitor",
    description: "Track branded prompts in AI search; alert when ranking drops 3+ positions.",
    category: "AI Visibility",
    icon: AlertTriangle,
    iconColor: "#6366F1",
    prompt: "Track our brand in AI search prompts daily and alert me on rank drops.",
  },
  {
    id: "budget-pacing",
    name: "Cross-Channel Budget Pacing",
    description: "Reforecast daily and reshape pacing to hit monthly spend targets.",
    category: "Optimisation",
    icon: BarChart3,
    iconColor: "#0F172A",
    prompt: "Reforecast spend daily and adjust pacing to hit our monthly budget.",
  },
]

export interface FlowTableRow {
  id: string
  name: string
  status: AutopilotArtifact["status"]
  createdBy: string
  lastModified: string
  templateId?: string
}

export const FLOW_TABLE_PLACEHOLDERS: FlowTableRow[] = [
  {
    id: "placeholder-1",
    name: "Catalog → AI Activation — SS26 collection",
    status: "active",
    createdBy: "Hailey Hsu",
    lastModified: "2026-05-08T14:22:00Z",
    templateId: "catalog-ai-activate",
  },
  {
    id: "placeholder-2",
    name: "ROAS Rebalance — Meta + Google",
    status: "active",
    createdBy: "Aeris",
    lastModified: "2026-05-05T10:01:00Z",
    templateId: "roas-rebalance",
  },
  {
    id: "placeholder-3",
    name: "High-Intent Retarget — luxury denim",
    status: "draft",
    createdBy: "Hailey Hsu",
    lastModified: "2026-04-28T18:40:00Z",
    templateId: "audience-retarget",
  },
  {
    id: "placeholder-4",
    name: "Out-of-Stock Exclusion — full catalog",
    status: "paused",
    createdBy: "Hailey Hsu",
    lastModified: "2026-04-20T09:12:00Z",
    templateId: "out-of-stock-exclude",
  },
]
