const STORAGE_KEY = "commercebase_home_layout_v1"

export type HomeWidgetId =
  | "quickActions"
  | "alerts"
  | "healthAi"
  | "efficiency"
  | "campaignSummary"

export const ALL_HOME_WIDGET_IDS: HomeWidgetId[] = [
  "quickActions",
  "alerts",
  "healthAi",
  "efficiency",
  "campaignSummary",
]

export const HOME_WIDGET_LABELS: Record<HomeWidgetId, string> = {
  quickActions: "Quick actions",
  alerts: "Alerts",
  healthAi: "Health & AI visibility scores",
  efficiency: "Efficiency metrics",
  campaignSummary: "Campaign summary",
}

export type HomeLayoutState = {
  order: HomeWidgetId[]
  /** Widgets to hide (not shown on home). */
  hidden: HomeWidgetId[]
}

function isWidgetId(x: string): x is HomeWidgetId {
  return ALL_HOME_WIDGET_IDS.includes(x as HomeWidgetId)
}

function defaultState(): HomeLayoutState {
  return {
    order: [...ALL_HOME_WIDGET_IDS],
    hidden: [],
  }
}

export function getHomeLayout(): HomeLayoutState {
  if (typeof window === "undefined") return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<HomeLayoutState>
    let order = Array.isArray(parsed.order)
      ? parsed.order.filter((id): id is HomeWidgetId => typeof id === "string" && isWidgetId(id))
      : []
    if (order.length === 0) order = [...ALL_HOME_WIDGET_IDS]
    const missing = ALL_HOME_WIDGET_IDS.filter((id) => !order.includes(id))
    order = [...order, ...missing]
    const hidden = Array.isArray(parsed.hidden)
      ? parsed.hidden.filter((id): id is HomeWidgetId => typeof id === "string" && isWidgetId(id))
      : []
    return { order, hidden }
  } catch {
    return defaultState()
  }
}

export function saveHomeLayout(state: HomeLayoutState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetHomeLayoutToDefault(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getVisibleWidgetsInOrder(layout: HomeLayoutState): HomeWidgetId[] {
  const hiddenSet = new Set(layout.hidden)
  return layout.order.filter((id) => !hiddenSet.has(id))
}
