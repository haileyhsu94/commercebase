import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CalendarDays, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AGENT_STORAGE_EVENT, getCampaignArtifacts } from "@/lib/agent/storage"
import type { CampaignArtifact } from "@/types/agent"
import { cn } from "@/lib/utils"

export function CampaignsList() {
  const [items, setItems] = useState<CampaignArtifact[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = () => setItems(getCampaignArtifacts())
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [])

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Campaigns created from agent chats.</p>
        </div>
        <Button onClick={() => navigate("/")} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New campaign
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                to={`/agent/campaign/${c.id}`}
                className="block rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Campaign Skill</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      c.status === "active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                <h2 className="mt-2 text-sm font-semibold leading-snug">{c.name}</h2>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(c.dateRange.start).toLocaleDateString()} →{" "}
                    {new Date(c.dateRange.end).toLocaleDateString()}
                  </span>
                  <span>{c.tasks.length} tasks</span>
                  <span>{c.deliverables.length} deliverables</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-xl border border-dashed bg-card/50 p-8 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
      <h2 className="mt-2 text-base font-semibold">No campaigns yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Describe what you want to launch in the home chat — the agent will build a full brief, tasks, and deliverables you can edit.
      </p>
      <Button className="mt-4 gap-1.5" render={<Link to="/" />}>
        <Plus className="h-3.5 w-3.5" />
        Start a campaign
      </Button>
    </div>
  )
}
