import { useLayoutEffect, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, MessageSquare, Plus, Search } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useGlobalSearch } from "@/contexts/GlobalSearchContext"
import { useHomeMode } from "@/contexts/HomeModeContext"
import { cn } from "@/lib/utils"

function isAgentRoute(pathname: string) {
  return pathname === "/" || pathname.startsWith("/agent")
}

export function AgentLayout() {
  const { openSearch } = useGlobalSearch()
  const { mode, setMode } = useHomeMode()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const dashboardRef = useRef<HTMLButtonElement>(null)
  const agentRef = useRef<HTMLButtonElement>(null)
  const [thumbStyle, setThumbStyle] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    let raf: number
    raf = requestAnimationFrame(() => {
      const target = mode === "dashboard" ? dashboardRef.current : agentRef.current
      if (!target) return
      setThumbStyle({ left: target.offsetLeft, width: target.offsetWidth })
    })
    return () => cancelAnimationFrame(raf)
  }, [mode])

  const handleModeChange = (next: "dashboard" | "ai") => {
    setMode(next)
    if (pathname !== "/") navigate("/")
  }

  return (
    <SidebarInset className="bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger className="-ml-1" />

        <div className="relative inline-flex h-8 shrink-0 items-center rounded-lg bg-secondary p-0.5">
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-0.5 bottom-0.5 rounded-md bg-background shadow-sm transition-[left,width] duration-300 ease-out",
            )}
            style={{
              left: thumbStyle?.left ?? 2,
              width: thumbStyle?.width ?? 0,
              opacity: thumbStyle ? 1 : 0,
            }}
          />
          <button
            ref={dashboardRef}
            type="button"
            onClick={() => handleModeChange("dashboard")}
            className={cn(
              "relative z-10 inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
              mode === "dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {mode === "dashboard" && <span className="hidden sm:inline-block">Dashboard</span>}
          </button>
          <button
            ref={agentRef}
            type="button"
            onClick={() => handleModeChange("ai")}
            className={cn(
              "relative z-10 inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
              mode === "ai" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {mode === "ai" && <span className="hidden sm:inline-block">Agent</span>}
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center">
          <button
            type="button"
            onClick={openSearch}
            className="relative flex h-9 w-full max-w-sm min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-base text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-sm">Search…</span>
            <kbd className="pointer-events-none hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        <Button
          onClick={() => navigate("/")}
          size="sm"
          className="gap-1.5 rounded-full"
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </Button>
      </header>

      <main
        className={cn(
          "min-w-0 flex-1",
          isAgentRoute(pathname)
            ? "overflow-hidden"
            : "overflow-y-auto p-4 pt-0",
        )}
      >
        <Outlet />
      </main>
    </SidebarInset>
  )
}
