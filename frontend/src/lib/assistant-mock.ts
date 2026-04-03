/** Mock assistant replies — shared by the panel and global search (GA4-style NL). */

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
  pause: `To pause campaigns, I need the **Manage Campaigns** permission.

This will allow me to:
• Pause and resume campaigns
• Edit campaign settings
• Create new campaigns

Would you like to grant this permission?`,
}

export function getMockResponse(input: string): string {
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("perform") || lowerInput.includes("roas") || lowerInput.includes("campaign")) {
    return mockResponses.performance
  }
  if (
    lowerInput.includes("ai") ||
    lowerInput.includes("presence") ||
    lowerInput.includes("visibility") ||
    lowerInput.includes("chatgpt")
  ) {
    return mockResponses.aiPresence
  }
  if (lowerInput.includes("pause") || lowerInput.includes("stop")) {
    return mockResponses.pause
  }

  return mockResponses.default
}
