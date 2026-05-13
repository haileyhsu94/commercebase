import type {
  AgentChat,
  AutopilotArtifact,
  CampaignArtifact,
  OnboardingState,
  WidgetArtifact,
} from "@/types/agent"
import { CONNECTORS } from "./connectors"

const KEY_ONBOARDING = "commercebase_agent_onboarding_v1"
const KEY_CHATS = "commercebase_agent_chats_v1"
const KEY_CAMPAIGNS = "commercebase_agent_campaigns_v1"
const KEY_FLOWS = "commercebase_agent_flows_v1"
const KEY_WIDGETS = "commercebase_agent_widgets_v1"

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent("commercebase-agent-updated", { detail: { key } }))
}

const defaultOnboarding = (): OnboardingState => ({
  completed: false,
  storeUrl: "",
  brandName: "",
  industry: "",
  goals: [],
  connectors: CONNECTORS.map((c) => ({ id: c.id, status: "disconnected" })),
  invitedEmails: [],
  completedSteps: [],
})

export function getOnboarding(): OnboardingState {
  const state = readJSON<OnboardingState | null>(KEY_ONBOARDING, null)
  if (!state) return defaultOnboarding()
  // Ensure connector list is current
  const merged = CONNECTORS.map(
    (c) =>
      state.connectors.find((s) => s.id === c.id) ?? { id: c.id, status: "disconnected" as const },
  )
  return { ...state, connectors: merged }
}

export function saveOnboarding(state: OnboardingState) {
  writeJSON(KEY_ONBOARDING, state)
}

export function resetOnboarding() {
  writeJSON(KEY_ONBOARDING, defaultOnboarding())
}

export function getAgentChats(): AgentChat[] {
  return readJSON<AgentChat[]>(KEY_CHATS, [])
}
export function saveAgentChats(chats: AgentChat[]) {
  writeJSON(KEY_CHATS, chats)
}
export function upsertAgentChat(chat: AgentChat) {
  const list = getAgentChats().filter((c) => c.id !== chat.id)
  list.unshift(chat)
  saveAgentChats(list)
}

export function getCampaignArtifacts(): CampaignArtifact[] {
  return readJSON<CampaignArtifact[]>(KEY_CAMPAIGNS, [])
}
export function saveCampaignArtifacts(list: CampaignArtifact[]) {
  writeJSON(KEY_CAMPAIGNS, list)
}
export function upsertCampaignArtifact(a: CampaignArtifact) {
  const list = getCampaignArtifacts().filter((x) => x.id !== a.id)
  list.unshift(a)
  saveCampaignArtifacts(list)
}

export function getFlowArtifacts(): AutopilotArtifact[] {
  return readJSON<AutopilotArtifact[]>(KEY_FLOWS, [])
}
export function saveFlowArtifacts(list: AutopilotArtifact[]) {
  writeJSON(KEY_FLOWS, list)
}
export function upsertFlowArtifact(a: AutopilotArtifact) {
  const list = getFlowArtifacts().filter((x) => x.id !== a.id)
  list.unshift(a)
  saveFlowArtifacts(list)
}

export function getWidgetArtifacts(): WidgetArtifact[] {
  return readJSON<WidgetArtifact[]>(KEY_WIDGETS, [])
}
export function saveWidgetArtifacts(list: WidgetArtifact[]) {
  writeJSON(KEY_WIDGETS, list)
}
export function upsertWidgetArtifact(a: WidgetArtifact) {
  const list = getWidgetArtifacts().filter((x) => x.id !== a.id)
  list.unshift(a)
  saveWidgetArtifacts(list)
}

export const AGENT_STORAGE_EVENT = "commercebase-agent-updated"
