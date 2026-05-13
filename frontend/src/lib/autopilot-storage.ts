/** User-created autopilot flows (mock); replace with API per CLAUDE.md Autopilot phase. */

const STORAGE_KEY = "commercebase_autopilot_flows_v1"

export const AUTOPILOT_STORAGE_UPDATED_EVENT = "commercebase-autopilot-flows-updated"

export type AutopilotFlowStatus = "draft" | "active" | "paused"

export interface AutopilotFlow {
  id: string
  name: string
  status: AutopilotFlowStatus
  updatedAt: string
  /** Set when flow was created from a template; omit or null for blank canvas. */
  templateId?: string | null
}

export function notifyAutopilotStorageUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(AUTOPILOT_STORAGE_UPDATED_EVENT))
}

function read(): AutopilotFlow[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AutopilotFlow[]
    return Array.isArray(parsed) ? parsed.filter((f) => f && typeof f.id === "string") : []
  } catch {
    return []
  }
}

function write(flows: AutopilotFlow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flows))
  notifyAutopilotStorageUpdated()
}

export function listFlows(): AutopilotFlow[] {
  return [...read()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function getFlow(id: string): AutopilotFlow | undefined {
  return read().find((f) => f.id === id)
}

export interface CreateFlowInput {
  name: string
  templateId?: string | null
}

export function createFlow(input: CreateFlowInput): AutopilotFlow {
  const now = new Date().toISOString()
  const flow: AutopilotFlow = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled flow",
    status: "draft",
    updatedAt: now,
    templateId: input.templateId ?? null,
  }
  write([flow, ...read()])
  return flow
}

export function touchFlow(id: string) {
  const flows = read()
  const ix = flows.findIndex((f) => f.id === id)
  if (ix < 0) return
  flows[ix] = { ...flows[ix], updatedAt: new Date().toISOString() }
  write(flows)
}

export function updateFlow(id: string, patch: Partial<Pick<AutopilotFlow, "name" | "status">>) {
  const flows = read()
  const ix = flows.findIndex((f) => f.id === id)
  if (ix < 0) return
  flows[ix] = {
    ...flows[ix],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  write(flows)
}
