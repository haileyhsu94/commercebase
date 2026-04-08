import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  aiVisibilityPageDescription,
  aiVisibilitySectionLabel,
} from "@/lib/ai-presence-mock"
import {
  AiPresenceTimeRangeControl,
  defaultAiPresenceTimeRange,
  type AiPresenceTimeRange,
} from "./ai-presence-time-range"

export function AIPresenceLayout() {
  const { pathname } = useLocation()
  const section = aiVisibilitySectionLabel(pathname)
  const description = aiVisibilityPageDescription(pathname)
  const [timeRange, setTimeRange] = useState<AiPresenceTimeRange>(defaultAiPresenceTimeRange)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 pb-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
              <Link
                to="/ai-presence"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                AI Visibility
              </Link>
              <ChevronRight
                className="size-3.5 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
              <span className="font-medium text-foreground">{section}</span>
            </nav>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{section}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
          {!pathname.includes("/auto-agent") && (
            <div className="shrink-0 self-start sm:mt-7">
              <AiPresenceTimeRangeControl value={timeRange} onChange={setTimeRange} />
            </div>
          )}
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 pt-6">
        <Outlet context={{ timeRange, setTimeRange }} />
      </div>
    </div>
  )
}
