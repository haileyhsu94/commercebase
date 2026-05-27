const KEY = "commercebase_dismissed_tutorials_v1"
const SEEN_TOURS_KEY = "commercebase_seen_tours_v1"
export const TUTORIAL_UPDATED_EVENT = "commercebase-tutorial-updated"

function notify() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(TUTORIAL_UPDATED_EVENT))
}

export function getDismissedTutorials(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function dismissTutorial(id: string): void {
  const current = getDismissedTutorials()
  if (current.includes(id)) return
  localStorage.setItem(KEY, JSON.stringify([...current, id]))
  notify()
}

/** Tours that have already auto-started once for this user (so we don't re-trigger). */
export function getSeenTours(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(SEEN_TOURS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export function markTourSeen(id: string): void {
  const current = getSeenTours()
  if (current.includes(id)) return
  localStorage.setItem(SEEN_TOURS_KEY, JSON.stringify([...current, id]))
}
