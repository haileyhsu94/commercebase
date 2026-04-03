import { useCallback, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Bot, BarChart3, Inbox, Package } from "lucide-react"
import { navigationItems } from "@/lib/mock-data"
import { aiPresenceSubnav } from "@/lib/ai-presence-mock"
import { analyticsSubnav, assetsSubnav } from "@/lib/sidebar-nav"

const STORAGE_KEY = "commercebase_starred_hrefs"
export const MAX_STARRED = 10

export type StarredNavEntry = {
  href: string
  title: string
  Icon: LucideIcon
}

function aiPresenceHref(path: string): string {
  return path === "" ? "/ai-presence" : `/ai-presence/${path}`
}

const registryBuild: StarredNavEntry[] = [
  ...navigationItems.map((i) => ({
    href: i.href,
    title: i.title,
    Icon: i.icon,
  })),
  { href: "/inbox", title: "Inbox", Icon: Inbox },
  ...aiPresenceSubnav.map(({ path, label }) => ({
    href: aiPresenceHref(path),
    title: label === "Overview" ? "AI Visibility — Overview" : `AI Visibility — ${label}`,
    Icon: Bot,
  })),
  ...analyticsSubnav.map(({ href, label }) => ({
    href,
    title: `Analytics — ${label}`,
    Icon: BarChart3,
  })),
  ...assetsSubnav.map(({ href, label }) => ({
    href,
    title: `Assets — ${label}`,
    Icon: Package,
  })),
]

/** All sidebar destinations that may be starred (stable hrefs only). First title wins for duplicates. */
export const STARRED_REGISTRY: StarredNavEntry[] = (() => {
  const seen = new Set<string>()
  const out: StarredNavEntry[] = []
  for (const e of registryBuild) {
    if (seen.has(e.href)) continue
    seen.add(e.href)
    out.push(e)
  }
  return out
})()

const registryHrefSet = new Set(STARRED_REGISTRY.map((e) => e.href))

export function isStarredHrefAllowed(href: string): boolean {
  return registryHrefSet.has(href)
}

export function getStarredRegistryEntry(href: string): StarredNavEntry | undefined {
  return STARRED_REGISTRY.find((e) => e.href === href)
}

export function getStarred(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === "string")
  } catch {
    return []
  }
}

function setStarredInternal(hrefs: string[]): void {
  const seen = new Set<string>()
  const next: string[] = []
  for (const h of hrefs) {
    if (!isStarredHrefAllowed(h) || seen.has(h)) continue
    seen.add(h)
    next.push(h)
    if (next.length >= MAX_STARRED) break
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

/** Returns true if href is now starred after toggle. */
export function toggleStarred(href: string): boolean {
  if (!isStarredHrefAllowed(href)) return false
  const cur = getStarred()
  const i = cur.indexOf(href)
  if (i >= 0) {
    const next = cur.filter((h) => h !== href)
    setStarredInternal(next)
    return false
  }
  if (cur.length >= MAX_STARRED) return false
  setStarredInternal([...cur, href])
  return true
}

export function isStarred(href: string): boolean {
  return getStarred().includes(href)
}

/** Starred hrefs in saved order, intersected with registry (drops unknown). */
export function getStarredEntriesInOrder(): StarredNavEntry[] {
  const ordered = getStarred()
  const out: StarredNavEntry[] = []
  for (const href of ordered) {
    const entry = getStarredRegistryEntry(href)
    if (entry) out.push(entry)
  }
  return out
}

export function useStarredNav() {
  const [starredHrefs, setStarredHrefs] = useState<string[]>(() => getStarred())

  const refresh = useCallback(() => {
    setStarredHrefs(getStarred())
  }, [])

  const toggle = useCallback(
    (href: string) => {
      if (!isStarredHrefAllowed(href)) return
      toggleStarred(href)
      refresh()
    },
    [refresh]
  )

  const starred = useCallback((href: string) => starredHrefs.includes(href), [starredHrefs])

  const entriesOrdered = useMemo(
    () =>
      starredHrefs
        .map((h) => getStarredRegistryEntry(h))
        .filter((e): e is StarredNavEntry => e !== undefined),
    [starredHrefs]
  )

  return {
    starredHrefs,
    starredEntries: entriesOrdered,
    toggle,
    isStarred: starred,
    refresh,
  }
}
