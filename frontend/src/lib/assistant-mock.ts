/** Mock assistant replies — shared by the panel and global search (GA4-style NL). */

import type { AssistantCard } from "@/lib/assistant-cards"

export interface AssistantReply {
  content: string
  cards?: AssistantCard[]
  /**
   * True when the request is an action / multi-step task the sidebar can't
   * finish on its own — the panel surfaces a "Continue in Agent" handoff.
   */
  handoff?: boolean
}

/** Action verbs that signal real, multi-step work better handled in the Agent. */
function isAgentTask(input: string): boolean {
  return /\b(create|launch|build|set ?up|automat\w*|schedule|optimi[sz]e|draft|fix|resume)\b/.test(
    input
  )
}

const mockResponses: Record<string, string> = {
  default: `I can help you with:
• Campaign performance analysis
• AI visibility optimization
• Budget recommendations
• Product catalog management

What would you like to know?`,
  performance: `Your campaigns are performing well overall:

**Top Performer:** Sneakers Q2 with 1,034% ROAS
**Needs Attention:** FW26 Collection at 305% ROAS (below target)

Total revenue this week: $75.8K (+15% vs last week)

Would you like me to suggest optimizations for the underperforming campaign?`,
  aiPresence: `Your **share of voice (SoV)** is **64/100** in AI shopping answers for your category.

You're missing from **38%** of conversations where competitors earn mentions.

**Top gaps:**
1. "luxury handbags" — competitors dominate 68% of mentions
2. "designer sneakers" — your SoV is only 23%

I can help tune catalog copy and attributes to lift SoV. Want recommendations?`,
}

/** Last 7 days of revenue (in $K) — drives the trend chart card. */
const weeklyRevenueSeries = [
  { label: "Mon", value: 9.2 },
  { label: "Tue", value: 11.4 },
  { label: "Wed", value: 8.7 },
  { label: "Thu", value: 12.1 },
  { label: "Fri", value: 13.6 },
  { label: "Sat", value: 10.3 },
  { label: "Sun", value: 10.5 },
]

const sovGapSeries = [
  { label: "Handbags", value: 32 },
  { label: "Sneakers", value: 23 },
  { label: "Outerwear", value: 51 },
  { label: "Denim", value: 44 },
]

const performanceCards: AssistantCard[] = [
  {
    kind: "metric",
    title: "Revenue",
    subtitle: "This week vs. last week",
    label: "Total revenue",
    value: "$75.8K",
    delta: { value: "+15%", direction: "up" },
    action: { label: "View Performance", href: "/analytics" },
  },
  {
    kind: "chart",
    title: "Daily revenue trend",
    subtitle: "Last 7 days",
    chartType: "line",
    series: weeklyRevenueSeries,
    unitPrefix: "$",
    unitSuffix: "K",
    action: { label: "View Performance", href: "/analytics" },
  },
]

const aiPresenceCards: AssistantCard[] = [
  {
    kind: "metric",
    title: "Share of voice",
    subtitle: "AI shopping answers, your category",
    label: "SoV score",
    value: "64/100",
    delta: { value: "-8 pts", direction: "down" },
    action: { label: "View AI Visibility", href: "/ai-presence" },
  },
  {
    kind: "chart",
    title: "SoV by category",
    subtitle: "Your share of mentions (%)",
    chartType: "bar",
    series: sovGapSeries,
    unitSuffix: "%",
    action: { label: "View AI Visibility", href: "/ai-presence" },
  },
]

export function getMockReply(input: string): AssistantReply {
  const lowerInput = input.toLowerCase()

  if (
    lowerInput.includes("pause my campaign") ||
    lowerInput.includes("pause campaign") ||
    lowerInput.includes("stop campaign") ||
    (lowerInput.includes("pause") && lowerInput.includes("campaign"))
  ) {
    return {
      content: `Pausing campaigns from chat would use the **Manage Campaigns** connector, which isn’t connected yet.

**What this will do:** safely pause or resume campaigns from Aeris once the connector is on.

**Coming soon** — you’ll see a “Connect” prompt here when the campaigns connector ships. For now, use **Campaigns** in the sidebar to pause manually.`,
      handoff: true,
    }
  }

  if (isAgentTask(lowerInput)) {
    return {
      content: `That sounds like a multi-step task — I can set it up for you in the **Agent**, where I can work through it step by step and save the result for you to review.

Want me to continue this in the Agent?`,
      handoff: true,
    }
  }

  if (
    lowerInput.includes("perform") ||
    lowerInput.includes("roas") ||
    lowerInput.includes("revenue") ||
    lowerInput.includes("spend") ||
    lowerInput.includes("campaign")
  ) {
    return { content: mockResponses.performance, cards: performanceCards }
  }
  if (
    lowerInput.includes("ai") ||
    lowerInput.includes("presence") ||
    lowerInput.includes("visibility") ||
    lowerInput.includes("sov") ||
    lowerInput.includes("chatgpt")
  ) {
    return { content: mockResponses.aiPresence, cards: aiPresenceCards }
  }

  return { content: mockResponses.default }
}
