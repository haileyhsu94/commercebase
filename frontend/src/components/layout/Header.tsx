import { LayoutDashboard, Search, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { useGlobalSearch } from "@/contexts/GlobalSearchContext"
import { useHomeMode } from "@/contexts/HomeModeContext"
import { cn } from "@/lib/utils"

export function Header() {
  const { toggleOpen } = useAIAssistant()
  const { openSearch } = useGlobalSearch()
  const { mode, setMode } = useHomeMode()

  return (
    <header className="flex h-16 min-w-0 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />

      {/* Mode toggle */}
      <div className="inline-flex h-8 shrink-0 items-center rounded-lg bg-secondary p-0.5">
        <button
          type="button"
          onClick={() => setMode("dashboard")}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all",
            mode === "dashboard"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all",
            mode === "ai"
              ? "bg-indigo-100 text-indigo-900 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-100"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Mode</span>
        </button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={openSearch}
          className={cn(
            "relative flex h-9 w-full max-w-sm min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-base text-muted-foreground transition-colors",
            "hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Open search"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm">Search CommerceBase…</span>
          <kbd className="pointer-events-none hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>
      <Button
        onClick={toggleOpen}
        variant="outline"
        size="sm"
        className={cn(
          "gap-1.5 border-indigo-500/45 bg-indigo-500/15 text-indigo-950 shadow-none",
          "hover:bg-indigo-500/28 hover:text-indigo-950",
          "focus-visible:ring-indigo-500/45 [&_svg]:text-indigo-600",
          "dark:border-indigo-400/50 dark:bg-indigo-500/22 dark:text-indigo-50",
          "dark:hover:bg-indigo-500/32 dark:hover:text-indigo-50 dark:[&_svg]:text-indigo-300"
        )}
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        Ask Aeris
        <Badge
          variant="secondary"
          className="h-5 border border-violet-300/90 bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-900 dark:border-violet-500/40 dark:bg-violet-950/60 dark:text-violet-200"
        >
          Beta
        </Badge>
      </Button>
    </header>
  )
}
