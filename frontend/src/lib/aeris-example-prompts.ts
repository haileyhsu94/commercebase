/** Grouped starter prompts for Aeris empty state (PRD AERIS-08). */

export type AerisExamplePromptGroup = {
  category: string
  prompts: string[]
}

export const AERIS_EXAMPLE_PROMPT_GROUPS: AerisExamplePromptGroup[] = [
  {
    category: "Campaigns",
    prompts: [
      "Which campaigns have the lowest ROAS?",
      "Summarize spend and revenue for active campaigns.",
      "What should I pause or scale this week?",
      "Copy my last campaign with a higher daily budget.",
      "Start from my Summer Sale campaign but target the US.",
    ],
  },
  {
    category: "AI Visibility",
    prompts: [
      "Where am I losing to competitors in AI search?",
      "Which shopping prompts have the biggest SoV gap?",
      "How can I improve citations on ChatGPT and Perplexity?",
    ],
  },
  {
    category: "Catalog",
    prompts: [
      "Which product attributes are weakest for AI answers?",
      "What catalog fixes would lift visibility fastest?",
    ],
  },
]

export const AERIS_EXAMPLE_PROMPTS_FLAT = AERIS_EXAMPLE_PROMPT_GROUPS.flatMap((g) => g.prompts)
