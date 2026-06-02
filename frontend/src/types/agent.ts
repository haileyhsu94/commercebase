import type { AssistantCard } from "@/lib/assistant-cards"

export type SkillType = "campaign" | "autopilot" | "widget" | "chat"

export type ConnectorId =
  | "shopify"
  | "woocommerce"
  | "google-ads"
  | "google-merchant"
  | "meta-ads"
  | "tiktok-ads"
  | "klaviyo"
  | "slack"
  | "hubspot"
  | "salesforce"
  | "attio"
  | "x"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok"

export interface ConnectorDef {
  id: ConnectorId
  name: string
  category: "store" | "ads" | "crm" | "messaging" | "social"
  description: string
  scopes: string[]
  brandColor: string
}

export interface ConnectorState {
  id: ConnectorId
  status: "disconnected" | "connecting" | "connected" | "error"
  accountLabel?: string
  connectedAt?: string
}

export interface OnboardingState {
  completed: boolean
  storeUrl: string
  brandName: string
  industry: string
  goals: string[]
  connectors: ConnectorState[]
  invitedEmails: string[]
  completedSteps: number[]
}

export interface AgentChatChoice {
  /** Short button label */
  label: string
  /** Optional hint shown beneath the label (e.g. "Recommended", a shortcut) */
  hint?: string
  /** Visually emphasize this option (primary CTA style) */
  recommended?: boolean
  /** Canonical value applied to the artifact when picked (e.g. a URL or "42"). Falls back to parsing the label. */
  value?: string
}

export interface AgentChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  kind?: "text" | "thinking" | "memory" | "skill-activated" | "result" | "question"
  timestamp: string
  meta?: {
    skillName?: string
    artifactRef?: { type: SkillType; id: string }
    memoryItems?: string[]
    /** For kind="question" — small tag shown at top-right of the card */
    questionTag?: string
    /** For kind="question" — context preview shown in monospaced box */
    questionContext?: string
    /** For kind="question" — choices rendered as stacked buttons */
    questionChoices?: AgentChatChoice[]
    /** Set after the user picks a choice; disables the buttons. */
    questionAnswered?: string
    /** Inline generated-UI card (e.g. a chart) rendered directly in the chat. */
    card?: AssistantCard
  }
}

export interface AgentChat {
  id: string
  title: string
  preview: string
  createdAt: string
  updatedAt: string
  pinned: boolean
  artifactRef?: { type: SkillType; id: string }
  messages: AgentChatMessage[]
}

export interface CampaignArtifactTask {
  id: string
  title: string
  dueDate: string
  priority: "low" | "medium" | "high"
  owner: string
  deliverable?: string
  status: "todo" | "in_progress" | "done"
  channel?: "blog" | "linkedin" | "x" | "email" | "instagram"
}

export interface CampaignArtifactDeliverable {
  id: string
  title: string
  type: "blog" | "linkedin" | "x" | "email" | "newsletter"
  status: "draft" | "review" | "approved" | "published"
  publishAt: string
  body?: string
}

export interface CampaignArtifactAdCopy {
  headline: string
  description: string
  imageUrl?: string
  aspectRatio?: "1.91:1" | "1:1" | "4:5" | "9:16"
}

export interface CampaignArtifact {
  id: string
  name: string
  status: "draft" | "active" | "paused" | "completed"
  dateRange: { start: string; end: string }
  owner: string
  overview: string
  cadence: string
  goals: string[]
  audience: string
  channels: string[]
  budget?: { amount: number; currency: string; type?: string }
  tasks: CampaignArtifactTask[]
  deliverables: CampaignArtifactDeliverable[]
  activation: { channel: string; status: string; reachEstimate: string }[]
  /** Per-channel ad creative copy, keyed by channel name (e.g. "Instagram"). */
  ads?: Record<string, CampaignArtifactAdCopy>

  // Prose (top of Brief)
  audienceDescription?: string
  messaging?: string

  // Essentials form
  objective?: string
  campaignType?: string
  finalUrl?: string
  /** Max bid per click (USD) — drives CPC ceiling */
  maxCpc?: string
  /** Target cost per sale (USD) */
  targetCps?: string

  // Advanced — Bidding & attribution
  bidStrategy?: string
  biddingTargetCpa?: string
  biddingTargetRoas?: string
  attributionModel?: string

  // Advanced — Targeting
  regions?: string[]
  cities?: string[]
  /** @deprecated Removed from UI; kept on the type so older artifacts deserialize cleanly. */
  devices?: string[]
  ageBands?: string[]
  languages?: string[]

  // Advanced — Brand & tracking
  brand?: { mainColor?: string; accentColor?: string; font?: string }
  tracking?: { utmPrefix?: string; trackingTemplate?: string }

  chatId: string
  createdAt: string
}

export type FlowNodeType =
  | "trigger"
  | "start"
  | "end"
  | "web-scrape"
  | "prompt-llm"
  | "google-search"
  | "exa-search"
  | "perplexity-search"
  | "code"
  | "call-api"
  | "conditional"
  | "iteration"
  | "slack"
  | "send-email"
  | "send-sms"
  | "delay"
  | "tag"
  | "webhook"

// Per-node configuration. Each node type writes its own shape; the editor
// PropertiesPanel dispatches on node.type to render the right form.
// Kept loose by design so adding node types doesn't churn the schema.
export type NodeConfig = Record<string, unknown>

export interface FlowNode {
  id: string
  type: FlowNodeType
  config?: NodeConfig
  title: string
  subtitle?: string
  outputLabel?: string
  outputType?: "text" | "json" | "list" | "boolean"
  branch?: "true" | "false"
  parentId?: string
}

export interface FlowInput {
  id: string
  name: string
  type: "text" | "number" | "boolean" | "json"
  placeholder?: string
}

export interface AutopilotArtifact {
  id: string
  name: string
  status: "draft" | "active" | "paused"
  trigger: {
    type: "analytics-event" | "schedule" | "segment-entry" | "webhook"
    event?: string
    cron?: string
  }
  audience: {
    mode: "all" | "existing" | "custom"
    filters: { property: string; operator: string; value: string }[]
  }
  inputs: FlowInput[]
  nodes: FlowNode[]
  chatId: string
  createdAt: string
}

export type WidgetType = "kpi" | "line" | "bar" | "pie" | "table"

export interface WidgetArtifact {
  id: string
  title: string
  description: string
  prompt: string
  type: WidgetType
  data: { label: string; value: number }[]
  unit?: string
  trend?: { direction: "up" | "down"; delta: string }
  chatId: string
  createdAt: string
}
