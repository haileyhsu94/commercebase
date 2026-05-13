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
