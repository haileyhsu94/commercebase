import {
  Gift,
  Megaphone,
  PartyPopper,
  Rocket,
  Sparkles,
  Users,
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
    name: "Product launch",
    description: "Coordinate a 4-week launch across email, social, and paid.",
    category: "Launch",
    icon: Rocket,
    iconColor: "#7C3AED",
    prompt:
      "Build a 4-week product launch campaign across email, Instagram, and paid social — include a teaser, launch day, and follow-up retargeting.",
  },
  {
    id: "seasonal-promo",
    name: "Seasonal promotion",
    description: "Drive sales for an upcoming holiday or seasonal moment.",
    category: "Promotion",
    icon: PartyPopper,
    iconColor: "#F97316",
    prompt:
      "Create a 2-week seasonal promotion campaign with a 20% off offer — email blast, social posts, and a landing page push.",
  },
  {
    id: "re-engagement",
    name: "Re-engage lapsed buyers",
    description: "Win back customers who haven't purchased in 90+ days.",
    category: "Retention",
    icon: Users,
    iconColor: "#0EA5E9",
    prompt:
      "Build a re-engagement campaign for customers who haven't purchased in 90+ days — personalized email with a comeback offer.",
  },
  {
    id: "brand-awareness",
    name: "Thought leadership",
    description: "6-week content series to grow audience and authority.",
    category: "Awareness",
    icon: Megaphone,
    iconColor: "#10B981",
    prompt:
      "Create a 6-week thought leadership campaign with weekly blog posts, LinkedIn articles, and an email digest to grow our audience.",
  },
  {
    id: "vip-rewards",
    name: "VIP rewards",
    description: "Reward top customers with early access and exclusive perks.",
    category: "Loyalty",
    icon: Gift,
    iconColor: "#EC4899",
    prompt:
      "Launch a VIP rewards campaign offering early access and an exclusive discount to my top-tier loyalty segment.",
  },
  {
    id: "new-arrivals",
    name: "New arrivals digest",
    description: "Weekly AI-curated picks sent to high-intent shoppers.",
    category: "Always-on",
    icon: Sparkles,
    iconColor: "#EAB308",
    prompt:
      "Set up a weekly new arrivals campaign — AI picks 5 fresh products and sends a personalized digest to high-intent shoppers.",
  },
]
