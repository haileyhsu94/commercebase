/** Grouped starter prompts for Aeris empty state (PRD AERIS-08). */

import type { LucideIcon } from "lucide-react"
import { Megaphone, Bot, Package } from "lucide-react"

export type AerisExamplePromptGroup = {
  category: string
  icon: LucideIcon
  prompts: string[]
}

export const AERIS_EXAMPLE_PROMPT_GROUPS: AerisExamplePromptGroup[] = [
  {
    category: "Campaigns",
    icon: Megaphone,
    prompts: [
      "Which campaigns have the lowest ROAS?",
      "Summarize spend and revenue for active campaigns.",
    ],
  },
  {
    category: "AI Visibility",
    icon: Bot,
    prompts: ["Where am I losing to competitors in AI search?"],
  },
  {
    category: "Catalog",
    icon: Package,
    prompts: ["What catalog fixes would lift visibility fastest?"],
  },
]

export const AERIS_EXAMPLE_PROMPTS_FLAT = AERIS_EXAMPLE_PROMPT_GROUPS.flatMap((g) => g.prompts)
