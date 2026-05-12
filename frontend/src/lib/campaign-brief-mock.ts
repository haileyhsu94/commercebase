import type { Campaign } from "@/lib/mock-data"

export interface CampaignTask {
  id: string
  title: string
  dueDate: string
  priority: "High" | "Medium" | "Low"
  owner: string
  status: "todo" | "in_progress" | "completed"
  deliverableType?: string
}

export interface CampaignBrief {
  title: string
  overview: string
  cadence: string
  timeline: string
  goals: string[]
  targetAudience: string
  channels: string[]
  keyMessages: string[]
  successMetrics: string[]
}

export interface CampaignDeliverable {
  id: string
  title: string
  type: string
  status: "draft" | "review" | "approved" | "published"
  taskId: string
  content?: string
}

export interface CampaignChat {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

export interface AiCampaignData {
  brief: CampaignBrief
  tasks: CampaignTask[]
  deliverables: CampaignDeliverable[]
  chats: CampaignChat[]
}

export interface CampaignWithBrief extends Campaign {
  aiCampaign?: AiCampaignData
}

const OWNER = "Hailey Hsu"

export function generateCampaignFromPrompt(
  prompt: string,
  companyName: string
): { campaign: CampaignWithBrief; responseText: string } {
  const lower = prompt.toLowerCase()

  const isContent =
    lower.includes("content") ||
    lower.includes("blog") ||
    lower.includes("linkedin") ||
    lower.includes("thought leader") ||
    lower.includes("newsletter")
  const isSales =
    lower.includes("sale") ||
    lower.includes("revenue") ||
    lower.includes("conversion") ||
    lower.includes("roas")
  const isTraffic =
    lower.includes("traffic") ||
    lower.includes("visitor") ||
    lower.includes("awareness") ||
    lower.includes("reach")

  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() + 1)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 42)

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  if (isContent) {
    return buildContentCampaign(prompt, companyName, startDate, endDate, fmt)
  }
  if (isSales) {
    return buildSalesCampaign(prompt, companyName, startDate, endDate, fmt)
  }
  if (isTraffic) {
    return buildTrafficCampaign(prompt, companyName, startDate, endDate, fmt)
  }
  return buildDefaultCampaign(prompt, companyName, startDate, endDate, fmt)
}

function weeklyDates(start: Date, count: number): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i * 7)
    dates.push(d)
  }
  return dates
}

function dateStr(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function buildContentCampaign(
  _prompt: string,
  companyName: string,
  startDate: Date,
  endDate: Date,
  fmt: (d: Date) => string
) {
  const weeks = weeklyDates(startDate, 6)
  const tasks: CampaignTask[] = []
  let taskId = 1

  for (let w = 0; w < 6; w++) {
    const weekStart = weeks[w]
    const mon = new Date(weekStart)
    const tue = new Date(weekStart); tue.setDate(tue.getDate() + 1)
    const wed = new Date(weekStart); wed.setDate(wed.getDate() + 2)
    const thu = new Date(weekStart); thu.setDate(thu.getDate() + 3)

    tasks.push({
      id: `task-${taskId++}`,
      title: `Write LinkedIn post: Week ${w + 1} thought leadership`,
      dueDate: dateStr(mon),
      priority: "Medium",
      owner: OWNER,
      status: "todo",
      deliverableType: "LinkedIn Post",
    })
    tasks.push({
      id: `task-${taskId++}`,
      title: `Write X post: Week ${w + 1} industry insight`,
      dueDate: dateStr(tue),
      priority: "Medium",
      owner: OWNER,
      status: "todo",
      deliverableType: "X Post",
    })
    tasks.push({
      id: `task-${taskId++}`,
      title: `Write blog: Week ${w + 1} deep dive article`,
      dueDate: dateStr(wed),
      priority: "High",
      owner: OWNER,
      status: "todo",
      deliverableType: "Blog Post",
    })
    tasks.push({
      id: `task-${taskId++}`,
      title: `Create email broadcast: Issue ${String(w + 1).padStart(2, "0")} — Weekly digest`,
      dueDate: dateStr(thu),
      priority: "High",
      owner: OWNER,
      status: "todo",
      deliverableType: "Email",
    })
  }

  const brief: CampaignBrief = {
    title: `${companyName} 6-Week Thought Leadership Campaign`,
    overview: `A 6-week content program designed to build ${companyName}'s public credibility and grow an engaged audience by establishing the company as the authoritative voice at the intersection of AI, fashion discovery, and commerce. Content runs weekly across blog, newsletter, LinkedIn, and X — organized around a deliberate narrative arc that moves from problem definition through vision, with consistent thought leadership positioning.`,
    cadence: "1 blog post + 1 newsletter + 1 LinkedIn post + 1 X post per week",
    timeline: `${fmt(startDate)} – ${fmt(endDate)}`,
    goals: [
      `Build a credible, consistent public voice for ${companyName} across LinkedIn and X`,
      "Grow the newsletter subscriber base through consistent, high-value weekly sends",
      "Establish the founding team as recognized thought leaders in AI × commerce",
      "Drive organic brand awareness via blog SEO and social sharing",
      "Lay the narrative groundwork for future product announcements and PR moments",
    ],
    targetAudience: "Marketing directors, e-commerce leaders, brand strategists, and AI-curious retail professionals",
    channels: ["LinkedIn", "X (Twitter)", "Blog", "Email Newsletter"],
    keyMessages: [
      "AI is fundamentally changing how consumers discover and buy products",
      `${companyName} is at the forefront of this transformation`,
      "Data-driven insights beat gut feelings in modern commerce",
      "The future of advertising is conversational, not transactional",
    ],
    successMetrics: [
      "Newsletter subscribers: +500 in 6 weeks",
      "LinkedIn engagement rate: >3% average",
      "Blog traffic: 2,000 organic visits per week by week 6",
      "Social impressions: 50,000 cumulative across LinkedIn and X",
    ],
  }

  const deliverables: CampaignDeliverable[] = tasks.slice(0, 4).map((t) => ({
    id: `del-${t.id}`,
    title: t.title.replace(/^(Write |Create )/, ""),
    type: t.deliverableType ?? "Content",
    status: "draft" as const,
    taskId: t.id,
  }))

  const chats: CampaignChat[] = [
    {
      id: "chat-1",
      title: "Campaign Planning",
      lastMessage: "Campaign brief generated with 24 tasks across 6 weeks.",
      timestamp: new Date().toISOString(),
    },
  ]

  const campaign: CampaignWithBrief = {
    id: `ai-${Date.now()}`,
    name: brief.title,
    status: "active",
    spent: "$0",
    revenue: "$0",
    cvr: "—",
    roas: "—",
    cpc: "—",
    cps: "—",
    launchedAt: new Date().toISOString(),
    aiCampaign: { brief, tasks, deliverables, chats },
  }

  const responseText = `I've created your **${brief.title}**.

**Overview:** ${brief.overview.slice(0, 200)}…

**Cadence:** ${brief.cadence}
**Timeline:** ${brief.timeline}

I've generated **${tasks.length} tasks** across 6 weeks covering LinkedIn posts, X posts, blog articles, and email broadcasts. Each task has a due date and priority assigned.

You can view the full campaign brief, tasks, and deliverables on the campaign detail page. Click any task's "Get Started" button to have me help draft the content.`

  return { campaign, responseText }
}

function buildSalesCampaign(
  _prompt: string,
  companyName: string,
  startDate: Date,
  endDate: Date,
  fmt: (d: Date) => string
) {
  const tasks: CampaignTask[] = [
    { id: "task-1", title: "Set up product feed optimization", dueDate: dateStr(startDate), priority: "High", owner: OWNER, status: "todo", deliverableType: "Setup" },
    { id: "task-2", title: "Create retargeting audience segments", dueDate: dateStr(startDate), priority: "High", owner: OWNER, status: "todo", deliverableType: "Audience" },
    { id: "task-3", title: "Design shopping ad creative — hero products", dueDate: dateStr(new Date(startDate.getTime() + 2 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Creative" },
    { id: "task-4", title: "Write ad copy variations (5 headlines, 3 descriptions)", dueDate: dateStr(new Date(startDate.getTime() + 3 * 86400000)), priority: "Medium", owner: OWNER, status: "todo", deliverableType: "Copy" },
    { id: "task-5", title: "Configure conversion tracking & attribution", dueDate: dateStr(new Date(startDate.getTime() + 4 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Setup" },
    { id: "task-6", title: "Launch initial campaign flight", dueDate: dateStr(new Date(startDate.getTime() + 7 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Launch" },
    { id: "task-7", title: "Week 1 performance review & bid adjustments", dueDate: dateStr(new Date(startDate.getTime() + 14 * 86400000)), priority: "Medium", owner: OWNER, status: "todo", deliverableType: "Report" },
    { id: "task-8", title: "A/B test creative variants", dueDate: dateStr(new Date(startDate.getTime() + 14 * 86400000)), priority: "Medium", owner: OWNER, status: "todo", deliverableType: "Test" },
    { id: "task-9", title: "Mid-campaign optimization report", dueDate: dateStr(new Date(startDate.getTime() + 21 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Report" },
    { id: "task-10", title: "Final performance report & next steps", dueDate: dateStr(new Date(startDate.getTime() + 42 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Report" },
  ]

  const brief: CampaignBrief = {
    title: `${companyName} Sales Maximization Campaign`,
    overview: `A performance-driven campaign designed to maximize revenue and ROAS across ${companyName}'s product catalog. Using AI-optimized bidding, dynamic product ads, and retargeting, this campaign targets high-intent shoppers to drive conversions and increase average order value.`,
    cadence: "Always-on with weekly optimization cycles",
    timeline: `${fmt(startDate)} – ${fmt(endDate)}`,
    goals: [
      "Achieve 8x+ ROAS across all channels",
      "Increase conversion rate by 20% vs. baseline",
      "Drive $50K+ in attributed revenue over 6 weeks",
      "Reduce CPA by 15% through bid optimization",
    ],
    targetAudience: "High-intent shoppers, past purchasers, cart abandoners, and lookalike audiences",
    channels: ["Shopping Ads", "Retargeting Display", "Price Comparison"],
    keyMessages: [
      "Premium products at competitive prices",
      "Free shipping and easy returns",
      "Limited-time offers and seasonal deals",
    ],
    successMetrics: [
      "Revenue: $50,000+",
      "ROAS: 8x+",
      "Conversion Rate: >2.5%",
      "CPA: <$25",
    ],
  }

  const campaign: CampaignWithBrief = {
    id: `ai-${Date.now()}`,
    name: brief.title,
    status: "active",
    spent: "$0",
    revenue: "$0",
    cvr: "—",
    roas: "—",
    cpc: "—",
    cps: "—",
    launchedAt: new Date().toISOString(),
    aiCampaign: { brief, tasks, deliverables: [], chats: [{ id: "chat-1", title: "Campaign Planning", lastMessage: `Campaign created with ${tasks.length} tasks.`, timestamp: new Date().toISOString() }] },
  }

  const responseText = `I've created your **${brief.title}**.

**Overview:** ${brief.overview.slice(0, 200)}…

**Timeline:** ${brief.timeline}

I've generated **${tasks.length} tasks** covering setup, creative, launch, and optimization cycles. The campaign targets high-intent shoppers with AI-optimized bidding for maximum ROAS.

View the full brief, tasks, and deliverables on the campaign page.`

  return { campaign, responseText }
}

function buildTrafficCampaign(
  _prompt: string,
  companyName: string,
  startDate: Date,
  endDate: Date,
  fmt: (d: Date) => string
) {
  const tasks: CampaignTask[] = [
    { id: "task-1", title: "Define target audience personas", dueDate: dateStr(startDate), priority: "High", owner: OWNER, status: "todo", deliverableType: "Strategy" },
    { id: "task-2", title: "Create awareness-stage ad creative", dueDate: dateStr(new Date(startDate.getTime() + 2 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Creative" },
    { id: "task-3", title: "Write 10 headline variations for A/B testing", dueDate: dateStr(new Date(startDate.getTime() + 3 * 86400000)), priority: "Medium", owner: OWNER, status: "todo", deliverableType: "Copy" },
    { id: "task-4", title: "Set up landing page tracking", dueDate: dateStr(new Date(startDate.getTime() + 4 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Setup" },
    { id: "task-5", title: "Launch traffic campaign", dueDate: dateStr(new Date(startDate.getTime() + 7 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Launch" },
    { id: "task-6", title: "Weekly traffic & engagement report", dueDate: dateStr(new Date(startDate.getTime() + 14 * 86400000)), priority: "Medium", owner: OWNER, status: "todo", deliverableType: "Report" },
    { id: "task-7", title: "Optimize targeting based on week 1 data", dueDate: dateStr(new Date(startDate.getTime() + 14 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Optimization" },
    { id: "task-8", title: "Final campaign report & learnings", dueDate: dateStr(new Date(startDate.getTime() + 42 * 86400000)), priority: "High", owner: OWNER, status: "todo", deliverableType: "Report" },
  ]

  const brief: CampaignBrief = {
    title: `${companyName} Audience Growth Campaign`,
    overview: `An awareness and traffic campaign designed to bring new visitors to ${companyName} and build brand recognition. Using display, social, and discovery channels, this campaign targets potential customers who match your ideal customer profile but haven't yet discovered your brand.`,
    cadence: "Always-on with bi-weekly optimization",
    timeline: `${fmt(startDate)} – ${fmt(endDate)}`,
    goals: [
      "Drive 25,000+ new site visitors over 6 weeks",
      "Achieve <$0.50 cost per visit",
      "Build retargeting pools for future conversion campaigns",
      "Increase brand search volume by 30%",
    ],
    targetAudience: "New potential customers matching ICP, lookalike audiences, interest-based segments",
    channels: ["Display Network", "Social Discovery", "Native Ads"],
    keyMessages: [
      `Discover ${companyName} — your new go-to for curated shopping`,
      "AI-powered product discovery",
      "Shop smarter, not harder",
    ],
    successMetrics: [
      "New visitors: 25,000+",
      "Cost per visit: <$0.50",
      "Retargeting pool size: 15,000+",
      "Brand search lift: +30%",
    ],
  }

  const campaign: CampaignWithBrief = {
    id: `ai-${Date.now()}`,
    name: brief.title,
    status: "active",
    spent: "$0",
    revenue: "$0",
    cvr: "—",
    roas: "—",
    cpc: "—",
    cps: "—",
    launchedAt: new Date().toISOString(),
    aiCampaign: { brief, tasks, deliverables: [], chats: [{ id: "chat-1", title: "Campaign Planning", lastMessage: `Campaign created with ${tasks.length} tasks.`, timestamp: new Date().toISOString() }] },
  }

  const responseText = `I've created your **${brief.title}**.

**Overview:** ${brief.overview.slice(0, 200)}…

**Timeline:** ${brief.timeline}

I've generated **${tasks.length} tasks** covering audience definition, creative, launch, and ongoing optimization. The campaign focuses on driving new traffic and building brand awareness.

View the full brief, tasks, and deliverables on the campaign page.`

  return { campaign, responseText }
}

function buildDefaultCampaign(
  _prompt: string,
  companyName: string,
  startDate: Date,
  endDate: Date,
  fmt: (d: Date) => string
) {
  return buildSalesCampaign(_prompt, companyName, startDate, endDate, fmt)
}
