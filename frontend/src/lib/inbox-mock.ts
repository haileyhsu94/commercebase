/** Inbox notifications (mock — replace with API). */

export type InboxNotification = {
  id: string
  title: string
  body: string
  time: string
  /** Initial read state from seed; user can mark unread items read (stored in localStorage). */
  read: boolean
  actionLabel?: string
  actionHref?: string
}

const READ_IDS_KEY = "commercebase_inbox_read_ids_v1"

const CHANGE_EVENT = "commercebase-inbox-changed"

export const inboxNotificationsSeed: InboxNotification[] = [
  {
    id: "in-1",
    title: "Campaign spend threshold",
    body: "Sneakers Q2 is within 10% of its monthly spend cap.",
    time: "12m ago",
    read: false,
    actionLabel: "View campaign",
    actionHref: "/campaigns/2",
  },
  {
    id: "in-2",
    title: "Catalog sync completed",
    body: "Your Merchant Center feed finished processing with no errors.",
    time: "1h ago",
    read: false,
    actionLabel: "View products",
    actionHref: "/products",
  },
  {
    id: "in-3",
    title: "AI Visibility alert",
    body: "Share of voice dropped in the Running Shoes category on two engines.",
    time: "3h ago",
    read: false,
    actionLabel: "Open AI Visibility",
    actionHref: "/ai-presence",
  },
  {
    id: "in-4",
    title: "Weekly digest",
    body: "Your performance summary for last week is ready.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "in-5",
    title: "Team invite accepted",
    body: "Alex Rivera joined your workspace.",
    time: "2d ago",
    read: true,
  },
]

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(READ_IDS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === "string"))
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>): void {
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]))
}

function dispatchChanged(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Effective read: seed or marked read in this browser. */
export function isInboxItemRead(item: InboxNotification): boolean {
  if (item.read) return true
  return loadReadIds().has(item.id)
}

export function getUnreadInboxCount(): number {
  return inboxNotificationsSeed.filter((n) => !isInboxItemRead(n)).length
}

export function getInboxNotifications(): InboxNotification[] {
  return [...inboxNotificationsSeed]
}

export function markInboxNotificationRead(id: string): void {
  const seed = inboxNotificationsSeed.find((n) => n.id === id)
  if (!seed || seed.read) return
  const ids = loadReadIds()
  if (ids.has(id)) return
  ids.add(id)
  saveReadIds(ids)
  dispatchChanged()
}

export function markAllInboxRead(): void {
  const ids = loadReadIds()
  let changed = false
  for (const n of inboxNotificationsSeed) {
    if (!n.read && !ids.has(n.id)) {
      ids.add(n.id)
      changed = true
    }
  }
  if (changed) {
    saveReadIds(ids)
    dispatchChanged()
  }
}

export function subscribeInboxChanged(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}
