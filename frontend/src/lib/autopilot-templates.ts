/** Template catalog for Autopilot creation (mock). */

export interface AutopilotTemplate {
  id: string
  name: string
  description: string
  category: string
}

export const AUTOPILOT_TEMPLATES: AutopilotTemplate[] = [
  {
    id: "catalog_ai_activate",
    name: "New product → AI optimise → activate",
    description:
      "When a new product is added to the catalog, trigger Aeris to enrich attributes, then auto-activate across channels.",
    category: "Catalog",
  },
  {
    id: "roas_rebalance",
    name: "ROAS drop → rebalance budget",
    description:
      "When any channel ROAS dips below target for 24 hours, rebalance toward higher-performing channels and notify stakeholders.",
    category: "Optimisation",
  },
  {
    id: "audience_retarget",
    name: "High-intent audience → retarget campaign",
    description:
      "When a shopper enters the high-intent pool, add them to a retargeting campaign with personalised bid uplift.",
    category: "Audiences",
  },
  {
    id: "competitor_gap_agent",
    name: "Competitor gap → opportunity → agent",
    description:
      "When a competitor gap is detected, create an opportunity and route to Auto Agent for draft response.",
    category: "AI Visibility",
  },
]
