import {
  Rocket,
  Tag,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

export interface CampaignTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: LucideIcon
  iconColor: string
  prompt: string
}

// Campaign launchpad templates. Each `prompt` is fed into
// activateSkillFromPrompt() to spin up a draft CampaignArtifact + chat.
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "product-launch",
    name: "New product launch",
    description: "Drive first-week sales for a new product or collection.",
    category: "Launch",
    icon: Rocket,
    iconColor: "#7C3AED",
    prompt:
      "Launch a new product across our publisher network to drive first-week sales — prospecting plus retargeting, optimized for cost per sale.",
  },
  {
    id: "seasonal-sale",
    name: "Seasonal sale",
    description: "Push a limited-time offer during a sale moment.",
    category: "Promotion",
    icon: Tag,
    iconColor: "#F97316",
    prompt:
      "Run a seasonal sale campaign around a limited-time offer to drive sales across high-traffic publishers, pacing budget toward the peak days.",
  },
  {
    id: "retarget-recover",
    name: "Retarget & recover",
    description: "Win back visitors and cart abandoners who didn't buy.",
    category: "Retargeting",
    icon: Target,
    iconColor: "#0EA5E9",
    prompt:
      "Set up a retargeting campaign to recover sales from shoppers who visited or abandoned cart but didn't purchase, optimized for cost per sale.",
  },
  {
    id: "best-sellers",
    name: "Always-on best sellers",
    description: "Keep top sellers in front of high-intent shoppers for steady revenue.",
    category: "Always-on",
    icon: TrendingUp,
    iconColor: "#10B981",
    prompt:
      "Create an always-on campaign promoting our best-selling products to high-intent shoppers across the publisher network to drive steady sales.",
  },
]
