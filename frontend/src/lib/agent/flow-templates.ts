import type { AutopilotArtifact } from "@/types/agent"

export interface FlowTemplate {
  id: string
  name: string
  description: string
  category: string
  iconLetter: string
  iconColor: string
  prompt: string
}

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: "welcome-series",
    name: "Welcome Series",
    description: "5-email onboarding for new subscribers with engagement branching.",
    category: "Lifecycle",
    iconLetter: "W",
    iconColor: "#0F172A",
    prompt: "Set up an autopilot welcome flow for new email subscribers.",
  },
  {
    id: "abandoned-cart",
    name: "Abandoned Cart Recovery",
    description: "Trigger when a checkout starts but doesn't complete in 1 hour.",
    category: "Recovery",
    iconLetter: "A",
    iconColor: "#0F172A",
    prompt: "Recover abandoned carts with a 3-step email + SMS reminder.",
  },
  {
    id: "post-purchase",
    name: "Post-Purchase Nurture",
    description: "Thank you, review request, and upsell over 14 days.",
    category: "Retention",
    iconLetter: "P",
    iconColor: "#0F172A",
    prompt: "Build a post-purchase nurture flow with thank-you, review ask, and upsell.",
  },
  {
    id: "winback",
    name: "Win-Back Inactive Customers",
    description: "Re-engage customers who haven't ordered in 90+ days.",
    category: "Retention",
    iconLetter: "B",
    iconColor: "#0F172A",
    prompt: "Win back customers inactive for 90+ days with a discount ladder.",
  },
  {
    id: "vip-flow",
    name: "VIP Tier Promotion",
    description: "Detect top spenders and route to a private VIP onboarding.",
    category: "Loyalty",
    iconLetter: "V",
    iconColor: "#0F172A",
    prompt: "Promote top customers into a VIP tier with private perks.",
  },
  {
    id: "browse-abandonment",
    name: "Browse Abandonment",
    description: "Reach shoppers who browsed but didn't add to cart.",
    category: "Recovery",
    iconLetter: "B",
    iconColor: "#0F172A",
    prompt: "Reach shoppers who browsed key collections but didn't add to cart.",
  },
  {
    id: "low-inventory",
    name: "Low Inventory Alert",
    description: "Slack ping when SKUs drop below threshold, then a back-in-stock email.",
    category: "Ops",
    iconLetter: "L",
    iconColor: "#0F172A",
    prompt: "Alert me on Slack when inventory drops below 20 units.",
  },
  {
    id: "review-request",
    name: "Review Request Drip",
    description: "Ask for reviews 14 days post-delivery, gated on order value.",
    category: "Lifecycle",
    iconLetter: "R",
    iconColor: "#0F172A",
    prompt: "Send a review request 14 days after delivery with a follow-up.",
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
    name: "Welcome Series — Realry email subscribers",
    status: "active",
    createdBy: "Hailey Hsu",
    lastModified: "2026-05-08T14:22:00Z",
    templateId: "welcome-series",
  },
  {
    id: "placeholder-2",
    name: "Abandoned Cart Recovery — checkout > $80",
    status: "active",
    createdBy: "Aeris",
    lastModified: "2026-05-05T10:01:00Z",
    templateId: "abandoned-cart",
  },
  {
    id: "placeholder-3",
    name: "VIP Tier — top 5% LTV",
    status: "draft",
    createdBy: "Hailey Hsu",
    lastModified: "2026-04-28T18:40:00Z",
    templateId: "vip-flow",
  },
  {
    id: "placeholder-4",
    name: "Low Inventory Slack alerts",
    status: "paused",
    createdBy: "Hailey Hsu",
    lastModified: "2026-04-20T09:12:00Z",
    templateId: "low-inventory",
  },
]
