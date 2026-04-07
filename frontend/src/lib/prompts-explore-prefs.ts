export const PROMPTS_EXPLORE_COLS_KEY = "commercebase-prompts-explore-cols-v1"
export const PROMPTS_FILTER_PRESETS_KEY = "commercebase-prompts-filter-presets-v1"

export type ExploreColId =
  | "prompt"
  | "category"
  | "intent"
  | "volume"
  | "volWow"
  | "vis"
  | "visWow"
  | "leader"
  | "gap"
  | "opp"
  | "impact"
  | "detail"

export const EXPLORE_COLUMN_META: { id: ExploreColId; label: string }[] = [
  { id: "prompt", label: "Prompt" },
  { id: "category", label: "Category" },
  { id: "intent", label: "Intent" },
  { id: "volume", label: "Volume" },
  { id: "volWow", label: "Vol Δ WoW" },
  { id: "vis", label: "Your SoV" },
  { id: "visWow", label: "SoV Δ WoW" },
  { id: "leader", label: "Leader" },
  { id: "gap", label: "Gap" },
  { id: "opp", label: "Opp." },
  { id: "impact", label: "Impact" },
  { id: "detail", label: "Expand" },
]

/** PRD PROMPT-05 default visible (plus expand column always on). */
export const DEFAULT_VISIBLE_EXPLORE_COLS: ExploreColId[] = [
  "prompt",
  "category",
  "volume",
  "vis",
  "gap",
  "impact",
  "detail",
]

const PICKABLE_COLS = EXPLORE_COLUMN_META.filter((c) => c.id !== "detail")

export function loadExploreVisibleCols(): Set<ExploreColId> {
  if (typeof window === "undefined") {
    return new Set(DEFAULT_VISIBLE_EXPLORE_COLS)
  }
  try {
    const raw = sessionStorage.getItem(PROMPTS_EXPLORE_COLS_KEY)
    if (!raw) return new Set(DEFAULT_VISIBLE_EXPLORE_COLS)
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set(DEFAULT_VISIBLE_EXPLORE_COLS)
    const allowed = new Set(EXPLORE_COLUMN_META.map((c) => c.id))
    const next = arr.filter((x): x is ExploreColId => typeof x === "string" && allowed.has(x as ExploreColId))
    const s = new Set(next)
    s.add("detail")
    if (s.size < 2) return new Set(DEFAULT_VISIBLE_EXPLORE_COLS)
    return s
  } catch {
    return new Set(DEFAULT_VISIBLE_EXPLORE_COLS)
  }
}

export function saveExploreVisibleCols(cols: Set<ExploreColId>) {
  if (typeof window === "undefined") return
  const withDetail = new Set(cols)
  withDetail.add("detail")
  const pickable = [...withDetail].filter((id) => id !== "detail")
  sessionStorage.setItem(PROMPTS_EXPLORE_COLS_KEY, JSON.stringify(pickable))
}

export type PromptFilterPreset = {
  id: string
  name: string
  category: string
  intent: string
  trendFilter: string
  minVolumeK: string
  behindLeaderOnly: boolean
}

export function loadFilterPresets(): PromptFilterPreset[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(PROMPTS_FILTER_PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PromptFilterPreset[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFilterPresets(presets: PromptFilterPreset[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(PROMPTS_FILTER_PRESETS_KEY, JSON.stringify(presets))
}

export { PICKABLE_COLS }
