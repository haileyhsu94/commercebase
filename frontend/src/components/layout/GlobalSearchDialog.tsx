/**
 * GA4-style unified search: jump to screens (like report search), filter list pages via ?q=,
 * or send a natural-language question to Aeris (Analytics Intelligence–style).
 * @see https://support.google.com/analytics/answer/9357428
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  CornerDownLeft,
  LayoutGrid,
  ListFilter,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { useGlobalSearch } from "@/contexts/GlobalSearchContext"
import {
  filterGlobalSearchNav,
  type GlobalSearchNavItem,
} from "@/lib/global-search-items"
import { cn } from "@/lib/utils"

type Row =
  | { type: "nav"; item: GlobalSearchNavItem }
  | { type: "filter"; label: string; href: string }
  | { type: "ask"; query: string }

function isCampaignListPath(pathname: string) {
  return pathname === "/campaigns" || pathname === "/campaigns/"
}

function isProductListPath(pathname: string) {
  return pathname === "/products" || pathname === "/products/"
}

export function GlobalSearchDialog() {
  const { open, setOpen } = useGlobalSearch()
  const { sendAssistantQuery } = useAIAssistant()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredNav = useMemo(() => filterGlobalSearchNav(query), [query])

  const pageFilter = useMemo(() => {
    const q = query.trim()
    if (!q) return null
    if (isCampaignListPath(pathname)) {
      return {
        label: `Filter campaigns for “${q}”`,
        href: `/campaigns?q=${encodeURIComponent(q)}`,
      }
    }
    if (isProductListPath(pathname)) {
      return {
        label: `Filter products for “${q}”`,
        href: `/products?q=${encodeURIComponent(q)}`,
      }
    }
    return null
  }, [pathname, query])

  const rows: Row[] = useMemo(() => {
    const r: Row[] = []
    filteredNav.forEach((item) => r.push({ type: "nav", item }))
    if (pageFilter) {
      r.push({ type: "filter", label: pageFilter.label, href: pageFilter.href })
    }
    const q = query.trim()
    if (q) {
      r.push({ type: "ask", query: q })
    }
    return r
  }, [filteredNav, pageFilter, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, rows.length, pathname])

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  const close = useCallback(() => setOpen(false), [setOpen])

  const runRow = useCallback(
    (row: Row) => {
      if (row.type === "nav") {
        navigate(row.item.href)
        close()
        return
      }
      if (row.type === "filter") {
        navigate(row.href)
        close()
        return
      }
      if (row.type === "ask") {
        void sendAssistantQuery(row.query).then(() => close())
      }
    },
    [close, navigate, sendAssistantQuery]
  )

  const onAskOnly = useCallback(() => {
    const q = query.trim()
    if (!q) return
    void sendAssistantQuery(q).then(() => close())
  }, [close, query, sendAssistantQuery])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, Math.max(0, rows.length - 1)))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === "Enter") {
      if ((e.metaKey || e.ctrlKey) && query.trim()) {
        e.preventDefault()
        onAskOnly()
        return
      }
      if (rows.length > 0) {
        e.preventDefault()
        const safe = Math.min(selectedIndex, rows.length - 1)
        runRow(rows[safe]!)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search CommerceBase</DialogTitle>
        <DialogDescription className="sr-only">
          Find pages, filter the current list, or ask Aeris a question.
        </DialogDescription>
        <div className="border-b border-border/80 px-3 py-2.5">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, reports, or ask a question…"
            className="h-10 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            aria-label="Search"
            autoComplete="off"
          />
        </div>
        <div className="max-h-[min(52vh,360px)] overflow-y-auto px-2 py-2">
          {filteredNav.length > 0 && (
            <div className="mb-2">
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Go to
              </p>
              <ul className="space-y-0.5" role="listbox">
                {filteredNav.map((item, i) => {
                  const flatIndex = i
                  const isSel = flatIndex === selectedIndex
                  return (
                    <li key={item.id} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSel}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          isSel
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted/80"
                        )}
                        onClick={() => runRow({ type: "nav", item })}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium leading-tight">{item.title}</span>
                          {item.hint && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {item.hint}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {pageFilter && (
            <div className="mb-2">
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                This page
              </p>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                  selectedIndex === filteredNav.length
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/80"
                )}
                onClick={() =>
                  runRow({
                    type: "filter",
                    label: pageFilter.label,
                    href: pageFilter.href,
                  })
                }
                onMouseEnter={() => setSelectedIndex(filteredNav.length)}
              >
                <ListFilter className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">{pageFilter.label}</span>
              </button>
            </div>
          )}

          {query.trim() && (
            <div>
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Ask Aeris
              </p>
              <button
                type="button"
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                  selectedIndex === rows.length - 1
                    ? "bg-indigo-100 text-indigo-950 dark:bg-indigo-950/45 dark:text-indigo-50"
                    : "hover:bg-muted/80"
                )}
                onClick={onAskOnly}
                onMouseEnter={() => setSelectedIndex(rows.length - 1)}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">
                    “{query.trim()}”
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Natural-language answer — like GA4 search insights
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/80 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            Open
          </span>
          <span>
            <kbd className="rounded border border-border bg-background px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-border bg-background px-1 font-mono">↓</kbd>{" "}
            Move
          </span>
          <span>
            <kbd className="rounded border border-border bg-background px-1 font-mono">⌘</kbd>
            <kbd className="rounded border border-border bg-background px-1 font-mono">↵</kbd>{" "}
            Ask Aeris
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
