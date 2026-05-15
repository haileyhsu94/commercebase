import type {
  AutopilotArtifact,
  CampaignArtifact,
  WidgetArtifact,
} from "@/types/agent"

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function buildSampleCampaign(
  _prompt: string,
  chatId: string,
  overrides?: Partial<CampaignArtifact>,
): CampaignArtifact {
  const id = newId("camp")
  const start = new Date()
  const end = new Date(start.getTime() + 42 * 24 * 60 * 60 * 1000)
  return {
    id,
    name: overrides?.name ?? "Audience Growth — 6-Week Thought Leadership",
    status: "draft",
    dateRange: { start: start.toISOString(), end: end.toISOString() },
    owner: "Hailey Hsu",
    overview:
      "A 6-week content program designed to grow an engaged audience by establishing the brand as the authoritative voice at the intersection of AI and commerce. Content runs weekly across blog, newsletter, LinkedIn, and X — organized around a deliberate narrative arc that moves from problem definition through vision.",
    cadence: "1 blog post + 1 newsletter + 1 LinkedIn post + 1 X post per week",
    goals: [
      "Build a credible, consistent public voice across LinkedIn and X",
      "Grow the newsletter subscriber base through high-value weekly sends",
      "Establish the founder as a recognized thought leader",
      "Drive organic brand awareness via blog SEO and social sharing",
      "Lay the narrative groundwork for future product announcements",
    ],
    audience: "Founders, marketers, and operators in DTC and ecommerce",
    channels: ["Blog", "Newsletter", "LinkedIn", "X"],
    tasks: buildCampaignTasks(),
    deliverables: buildCampaignDeliverables(),
    activation: [
      { channel: "LinkedIn", status: "Ready", reachEstimate: "~12K weekly impressions" },
      { channel: "X", status: "Ready", reachEstimate: "~8K weekly impressions" },
      { channel: "Blog (SEO)", status: "Ready", reachEstimate: "Indexed in 7–14 days" },
      { channel: "Newsletter", status: "Ready", reachEstimate: "~4.2K subscribers" },
    ],
    chatId,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function buildCampaignTasks() {
  const weeks = 6
  const channels: Array<{ channel: "blog" | "linkedin" | "x" | "email"; label: string; deliv: string }> = [
    { channel: "linkedin", label: "Write LinkedIn post", deliv: "LinkedIn post" },
    { channel: "x", label: "Write X post", deliv: "X post" },
    { channel: "blog", label: "Write blog", deliv: "Blog article" },
    { channel: "email", label: "Create email broadcast", deliv: "Newsletter" },
  ]
  const tasks: ReturnType<typeof tmpl>[] = []
  const today = new Date()
  function tmpl(args: {
    title: string
    daysFromNow: number
    priority: "low" | "medium" | "high"
    channel: "blog" | "linkedin" | "x" | "email"
    deliverable: string
  }) {
    const due = new Date(today.getTime() + args.daysFromNow * 86400000)
    return {
      id: newId("task"),
      title: args.title,
      dueDate: due.toISOString(),
      priority: args.priority,
      owner: "Hailey Hsu",
      deliverable: args.deliverable,
      status: "todo" as const,
      channel: args.channel,
    }
  }
  for (let w = 0; w < weeks; w++) {
    channels.forEach((c, idx) => {
      tasks.push(
        tmpl({
          title: `${c.label}: Week ${w + 1} — ${["The opening POV", "Behind-the-scenes proof", "Tactical insight", "Roundup + recap"][idx % 4]}`,
          daysFromNow: w * 7 + idx,
          priority: c.channel === "blog" || c.channel === "email" ? "high" : "medium",
          channel: c.channel,
          deliverable: c.deliv,
        }),
      )
    })
  }
  return tasks
}

function buildCampaignDeliverables() {
  const titles = [
    "The Kayak Moment for Fashion",
    "Why We Said No to 21,000 SKUs",
    "From Search to Discovery: A New Pattern",
    "Inside Our AI Curation Stack",
    "What Marni Taught Us About Trust",
    "Closing the Loop: Discovery → Purchase",
  ]
  const today = new Date()
  return titles.map((title, i) => ({
    id: newId("deliv"),
    title,
    type: "blog" as const,
    status: (i < 2 ? "draft" : i < 4 ? "review" : "approved") as "draft" | "review" | "approved",
    publishAt: new Date(today.getTime() + (i + 1) * 7 * 86400000).toISOString(),
    body: `Draft for "${title}" — opens with a hook, supports with 2–3 specific examples, closes with a CTA to the newsletter.`,
  }))
}

export function buildSampleFlow(_prompt: string, chatId: string): AutopilotArtifact {
  return {
    id: newId("flow"),
    name: "AEO-Optimized FAQ Generator",
    status: "draft",
    trigger: { type: "webhook" },
    audience: { mode: "all", filters: [] },
    inputs: [{ id: "in_url", name: "Article URL", type: "text", placeholder: "https://…" }],
    nodes: [
      { id: "n_start", type: "start", title: "Start", subtitle: "Inputs" },
      {
        id: "n_scrape",
        type: "web-scrape",
        title: "Web Page Scrape",
        outputLabel: "Article Content",
        outputType: "text",
        parentId: "n_start",
      },
      {
        id: "n_query",
        type: "prompt-llm",
        title: "Determine Core Search Query",
        outputLabel: "User Search Query",
        outputType: "text",
        parentId: "n_scrape",
      },
      {
        id: "n_exa",
        type: "exa-search",
        title: "Answer",
        outputLabel: "Exa Search FAQs",
        outputType: "json",
        parentId: "n_query",
      },
      {
        id: "n_google",
        type: "google-search",
        title: "Google Search",
        outputLabel: "People Also Asked",
        outputType: "json",
        parentId: "n_exa",
      },
      {
        id: "n_fanout",
        type: "call-api",
        title: "Query Fanout Estimator",
        outputLabel: "Query Fanouts",
        outputType: "json",
        parentId: "n_google",
      },
      {
        id: "n_write",
        type: "prompt-llm",
        title: "Write FAQs",
        outputLabel: "Final FAQ Section",
        outputType: "text",
        parentId: "n_fanout",
      },
      { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_write" },
    ],
    chatId,
    createdAt: new Date().toISOString(),
  }
}

// Starter flows for the commerce-media templates in flow-templates.ts.
// Each returns a fully wired AutopilotArtifact so the editor opens with
// realistic, template-appropriate nodes instead of the AEO sample.
export function buildCommerceFlow(
  templateId: string,
  prompt: string,
  chatId: string,
): AutopilotArtifact | null {
  const base = (
    name: string,
    nodes: AutopilotArtifact["nodes"],
    inputs: AutopilotArtifact["inputs"] = [],
  ): AutopilotArtifact => ({
    id: newId("flow"),
    name,
    status: "draft",
    trigger: { type: "webhook" },
    audience: { mode: "all", filters: [] },
    inputs,
    nodes,
    chatId,
    createdAt: new Date().toISOString(),
  })

  switch (templateId) {
    case "catalog-ai-activate":
      return base("Catalog → AI Activation", [
        { id: "n_start", type: "start", title: "Catalog sync", subtitle: "Trigger", config: { kind: "event", event: "catalog.synced" } },
        { id: "n_diff", type: "call-api", title: "Diff catalog changes", outputLabel: "Changed SKUs", outputType: "list", parentId: "n_start", config: { method: "GET", url: "/api/catalog/diff?since={{last_sync}}" } },
        { id: "n_enrich", type: "prompt-llm", title: "Enrich attributes with AI", outputLabel: "Enriched products", outputType: "json", parentId: "n_diff", config: { model: "claude-sonnet-4-6", prompt: "For each SKU in {{Changed SKUs}}, infer category, materials, occasion, and 5 SEO keywords. Return JSON.", outputVar: "enriched" } },
        { id: "n_activate", type: "call-api", title: "Push to publishers", outputLabel: "Activation IDs", outputType: "list", parentId: "n_enrich", config: { method: "POST", url: "/api/publishers/activate", body: '{ "products": {{enriched}} }' } },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_activate" },
      ])
    case "roas-rebalance":
      return base("ROAS Rebalance", [
        { id: "n_start", type: "start", title: "Daily check", subtitle: "Schedule", config: { kind: "schedule", minute: 0, hour: 7, dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
        { id: "n_metric", type: "call-api", title: "Pull channel ROAS", outputLabel: "Channel ROAS", outputType: "json", parentId: "n_start", config: { method: "GET", url: "/api/analytics/roas?window=24h" } },
        { id: "n_cond", type: "conditional", title: "ROAS < 2.0?", outputLabel: "Branch", outputType: "boolean", parentId: "n_metric", config: { left: "{{Channel ROAS.min}}", op: "<", right: "2.0" } },
        { id: "n_rebalance", type: "call-api", title: "Shift budget", outputLabel: "New allocations", outputType: "json", parentId: "n_cond", branch: "true", config: { method: "POST", url: "/api/campaigns/rebalance" } },
        { id: "n_hold", type: "prompt-llm", title: "Hold and log reason", outputLabel: "Note", outputType: "text", parentId: "n_cond", branch: "false", config: { model: "claude-haiku-4-5", prompt: "Explain why no rebalance is needed in one sentence.", outputVar: "note" } },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_rebalance" },
      ])
    case "ai-email-digest":
      return base("AI Email — daily product digest", [
        { id: "n_start", type: "start", title: "Schedule", subtitle: "Trigger", config: { kind: "schedule", minute: 0, hour: 9, dayOfMonth: "*", month: "*", dayOfWeek: "*" } },
        { id: "n_pick", type: "prompt-llm", title: "Pick today's products", outputLabel: "Picks", outputType: "list", parentId: "n_start", config: { model: "claude-sonnet-4-6", prompt: "Choose 5 trending products for the VIP segment based on yesterday's signals.", outputVar: "picks" } },
        { id: "n_email", type: "send-email", title: "AI Email", outputLabel: "Sent", outputType: "text", parentId: "n_pick", config: { audience: "vip", from: "hello@brand.com", subject: "Your daily picks", body: "Hi {{first_name}},\n\nHere are today's picks:\n{{picks}}" } },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_email" },
      ])
    case "audience-retarget":
      return base("High-Intent Retarget", [
        { id: "n_start", type: "start", title: "High-intent signal", subtitle: "Trigger" },
        { id: "n_segment", type: "call-api", title: "Build retarget segment", outputLabel: "Audience", outputType: "list", parentId: "n_start" },
        { id: "n_creative", type: "prompt-llm", title: "Draft creative variants", outputLabel: "Ad copy", outputType: "json", parentId: "n_segment" },
        { id: "n_launch", type: "call-api", title: "Launch campaign", outputLabel: "Campaign ID", outputType: "text", parentId: "n_creative" },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_launch" },
      ])
    case "competitor-gap":
      return base("Competitor Gap Agent", [
        { id: "n_start", type: "start", title: "Daily SOV check", subtitle: "Schedule" },
        { id: "n_scrape", type: "web-scrape", title: "Pull AI search results", outputLabel: "SERP", outputType: "json", parentId: "n_start" },
        { id: "n_analyze", type: "prompt-llm", title: "Compare share of voice", outputLabel: "Gap report", outputType: "json", parentId: "n_scrape" },
        { id: "n_cond", type: "conditional", title: "Competitor pulled ahead?", outputLabel: "Branch", outputType: "boolean", parentId: "n_analyze" },
        { id: "n_playbook", type: "prompt-llm", title: "Draft response playbook", outputLabel: "Playbook", outputType: "text", parentId: "n_cond", branch: "true" },
        { id: "n_slack", type: "slack", title: "Notify team", outputLabel: "Message", outputType: "text", parentId: "n_playbook" },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_slack" },
      ])
    case "out-of-stock-exclude":
      return base("Out-of-Stock Exclusion", [
        { id: "n_start", type: "start", title: "Inventory webhook", subtitle: "Trigger" },
        { id: "n_check", type: "call-api", title: "Confirm stock level", outputLabel: "SKU + stock", outputType: "json", parentId: "n_start" },
        { id: "n_pause", type: "call-api", title: "Pause across publishers", outputLabel: "Affected placements", outputType: "list", parentId: "n_check" },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_pause" },
      ])
    case "promo-creative-refresh":
      return base("Promo Creative Refresh", [
        { id: "n_start", type: "start", title: "Price-drop event", subtitle: "Trigger" },
        { id: "n_load", type: "call-api", title: "Fetch product context", outputLabel: "Product", outputType: "json", parentId: "n_start" },
        { id: "n_gen", type: "prompt-llm", title: "Regenerate ad creative", outputLabel: "Creative set", outputType: "json", parentId: "n_load" },
        { id: "n_review", type: "slack", title: "Queue for approval", outputLabel: "Review link", outputType: "text", parentId: "n_gen" },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_review" },
      ])
    case "prompt-monitor":
      return base("AI Prompt Monitor", [
        { id: "n_start", type: "start", title: "Daily prompt sweep", subtitle: "Schedule" },
        { id: "n_query", type: "perplexity-search", title: "Query branded prompts", outputLabel: "Results", outputType: "json", parentId: "n_start" },
        { id: "n_rank", type: "prompt-llm", title: "Score brand position", outputLabel: "Ranking", outputType: "json", parentId: "n_query" },
        { id: "n_cond", type: "conditional", title: "Dropped 3+ positions?", outputLabel: "Branch", outputType: "boolean", parentId: "n_rank" },
        { id: "n_alert", type: "slack", title: "Alert AI Visibility owner", outputLabel: "Alert", outputType: "text", parentId: "n_cond", branch: "true" },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_alert" },
      ])
    case "budget-pacing":
      return base("Cross-Channel Budget Pacing", [
        { id: "n_start", type: "start", title: "Daily reforecast", subtitle: "Schedule" },
        { id: "n_pull", type: "call-api", title: "Pull spend + pacing", outputLabel: "Pacing data", outputType: "json", parentId: "n_start" },
        { id: "n_forecast", type: "prompt-llm", title: "Forecast month-end spend", outputLabel: "Forecast", outputType: "json", parentId: "n_pull" },
        { id: "n_adjust", type: "call-api", title: "Adjust channel caps", outputLabel: "New caps", outputType: "json", parentId: "n_forecast" },
        { id: "n_end", type: "end", title: "End", subtitle: "Outputs", parentId: "n_adjust" },
      ])
    default:
      void prompt
      return null
  }
}

export function buildSampleWidget(prompt: string, chatId: string): WidgetArtifact {
  const lower = prompt.toLowerCase()
  const wantsKpi = /\b(kpi|number|total|count|sum)\b/.test(lower)
  const wantsPie = /\b(pie|share|breakdown|distribution)\b/.test(lower)
  const wantsBar = /\b(bar|compare|comparison|by channel|by category)\b/.test(lower)
  const type: WidgetArtifact["type"] = wantsKpi ? "kpi" : wantsPie ? "pie" : wantsBar ? "bar" : "line"

  if (type === "kpi") {
    return {
      id: newId("widget"),
      title: "Revenue (last 28 days)",
      description: "Total attributed revenue across all channels for the trailing 28 days.",
      prompt,
      type,
      data: [{ label: "Revenue", value: 224300 }],
      unit: "$",
      trend: { direction: "up", delta: "+18.4%" },
      chatId,
      createdAt: new Date().toISOString(),
    }
  }
  if (type === "pie") {
    return {
      id: newId("widget"),
      title: "Revenue share by channel",
      description: "Share of last-28-day revenue attributed to each channel.",
      prompt,
      type,
      data: [
        { label: "AI Search", value: 38 },
        { label: "Paid Social", value: 24 },
        { label: "Email", value: 18 },
        { label: "Organic", value: 12 },
        { label: "Affiliate", value: 8 },
      ],
      unit: "%",
      chatId,
      createdAt: new Date().toISOString(),
    }
  }
  if (type === "bar") {
    return {
      id: newId("widget"),
      title: "Conversion rate by channel",
      description: "CVR per channel for the trailing 28 days.",
      prompt,
      type,
      data: [
        { label: "Email", value: 6.8 },
        { label: "AI Search", value: 5.2 },
        { label: "Organic", value: 3.1 },
        { label: "Paid Social", value: 2.4 },
        { label: "Affiliate", value: 1.9 },
      ],
      unit: "%",
      chatId,
      createdAt: new Date().toISOString(),
    }
  }
  return {
    id: newId("widget"),
    title: "Revenue trend",
    description: "Weekly attributed revenue for the trailing 12 weeks.",
    prompt,
    type: "line",
    data: [
      { label: "W1", value: 14200 },
      { label: "W2", value: 15800 },
      { label: "W3", value: 16100 },
      { label: "W4", value: 17400 },
      { label: "W5", value: 18000 },
      { label: "W6", value: 18900 },
      { label: "W7", value: 19600 },
      { label: "W8", value: 21000 },
      { label: "W9", value: 21800 },
      { label: "W10", value: 22600 },
      { label: "W11", value: 23900 },
      { label: "W12", value: 25100 },
    ],
    unit: "$",
    trend: { direction: "up", delta: "+76.7%" },
    chatId,
    createdAt: new Date().toISOString(),
  }
}
