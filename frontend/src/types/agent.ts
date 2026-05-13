export type SkillType = "campaign" | "autopilot" | "widget" | "chat"

export type ConnectorId =
  | "shopify"
  | "google-ads"
  | "google-merchant"
  | "meta-ads"
  | "tiktok-ads"
  | "klaviyo"
  | "slack"
  | "hubspot"

export interface ConnectorDef {
  id: ConnectorId
  name: string
  category: "store" | "ads" | "crm" | "messaging"
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

export interface AgentChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  kind?: "text" | "thinking" | "memory" | "skill-activated" | "result"
  timestamp: string
  meta?: {
    skillName?: string
    artifactRef?: { type: SkillType; id: string }
    memoryItems?: string[]
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
  budget?: { amount: number; currency: string }
  tasks: CampaignArtifactTask[]
  deliverables: CampaignArtifactDeliverable[]
  activation: { channel: string; status: string; reachEstimate: string }[]
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

export interface FlowNode {
  id: string
  type: FlowNodeType
  title: string
  subtitle?: string
  outputLabel?: string
  outputType?: "text" | "json" | "list" | "boolean"
  branch?: "true" | "false"
  parentId?: string
  config?: Record<string, string | number | boolean>
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
