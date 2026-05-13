import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BarChart3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AGENT_STORAGE_EVENT, getWidgetArtifacts } from "@/lib/agent/storage"
import type { WidgetArtifact } from "@/types/agent"

export function WidgetsList() {
  const [items, setItems] = useState<WidgetArtifact[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = () => setItems(getWidgetArtifacts())
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [])

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Widgets</h1>
          <p className="text-sm text-muted-foreground">
            AI-generated chart artifacts. Pin them to the dashboard once you like them.
          </p>
        </div>
        <Button onClick={() => navigate("/")} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New widget
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed bg-card/50 p-8 text-center">
          <BarChart3 className="mx-auto h-6 w-6 text-blue-500" />
          <h2 className="mt-2 text-base font-semibold">No widgets yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Ask for a chart in the home chat — try "show me revenue by channel" or "plot weekly orders".
          </p>
          <Button className="mt-4 gap-1.5" render={<Link to="/" />}>
            <Plus className="h-3.5 w-3.5" />
            Create a widget
          </Button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <li key={w.id}>
              <Link
                to={`/agent/widget/${w.id}`}
                className="block rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/30"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                    <BarChart3 className="h-3 w-3" />
                    {w.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="mt-2 text-sm font-semibold leading-snug">{w.title}</h2>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{w.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
