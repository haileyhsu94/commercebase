import type { SkillType } from "@/types/agent"

const RULES: Array<{ type: SkillType; patterns: RegExp[] }> = [
  {
    type: "autopilot",
    patterns: [
      /\b(autopilot|flow|automation|workflow|drip|sequence|nurture|bootcamp|onboarding email)\b/i,
      /\bwhen .* (signs?|subscribes?|registers?)\b/i,
    ],
  },
  {
    type: "widget",
    patterns: [
      /\b(chart|graph|widget|kpi|visualiz|dashboard tile|metric|trend by|breakdown of|pie|bar chart|line chart)\b/i,
      /\b(plot|show me a) .*\b/i,
    ],
  },
  {
    type: "campaign",
    patterns: [
      /\b(campaign|launch|drive sales|thought leadership|content program|awareness|growth campaign)\b/i,
      /\b(grow .* audience|6.week|content calendar)\b/i,
    ],
  },
]

export function detectSkill(prompt: string): SkillType {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(prompt))) return rule.type
  }
  return "chat"
}

export function describeSkill(type: SkillType): string {
  switch (type) {
    case "campaign":
      return "Campaign Skill"
    case "autopilot":
      return "Autopilot Skill"
    case "widget":
      return "Widget Skill"
    default:
      return "Conversation"
  }
}

export function defaultMemoryItems(type: SkillType): string[] {
  switch (type) {
    case "campaign":
      return ["Author Profiles", "Competitive Battlecards", "ICP", "Messaging & Positioning"]
    case "autopilot":
      return ["Lifecycle Triggers", "Audience Segments", "Email Templates"]
    case "widget":
      return ["Analytics Sources", "Metric Definitions"]
    default:
      return ["Brand Voice"]
  }
}
