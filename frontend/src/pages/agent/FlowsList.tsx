import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Mic,
  Plus,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AGENT_STORAGE_EVENT, getFlowArtifacts } from "@/lib/agent/storage"
import { activateSkillFromPrompt } from "@/lib/agent/activate"
import {
  FLOW_TABLE_PLACEHOLDERS,
  FLOW_TEMPLATES,
  type FlowTableRow,
} from "@/lib/agent/flow-templates"
import type { AutopilotArtifact } from "@/types/agent"
import { cn } from "@/lib/utils"

type Tab = "overview" | "all" | "templates" | "scheduled"

export function FlowsList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("overview")
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState<AutopilotArtifact[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    const load = () => setItems(getFlowArtifacts())
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [])

  const liveRows: FlowTableRow[] = items.map((f) => ({
    id: f.id,
    name: f.name,
    status: f.status,
    createdBy: "Aeris",
    lastModified: f.createdAt,
  }))
  const rows = useMemo(() => {
    const combined = [...liveRows, ...FLOW_TABLE_PLACEHOLDERS]
    const q = query.toLowerCase().trim()
    if (!q) return combined
    return combined.filter((r) => r.name.toLowerCase().includes(q))
  }, [liveRows, query])

  function submit(prompt: string) {
    const text = prompt.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setTimeout(() => {
      const result = activateSkillFromPrompt(text)
      navigate(result.route)
    }, 120)
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Title + tabs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Autopilot</h1>
        <Button onClick={() => navigate("/")} className="gap-1.5 rounded-md">
          <Plus className="h-3.5 w-3.5" />
          New Agent
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-0 border-b">
        <TabPill label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
        <TabPill label="All Agents" active={tab === "all"} onClick={() => setTab("all")} />
        <TabPill label="Templates" active={tab === "templates"} onClick={() => setTab("templates")} />
        <TabPill label="Scheduled" active={tab === "scheduled"} onClick={() => setTab("scheduled")} />
      </div>

      {tab === "overview" && (
        <>
          {/* Build prompt */}
          <section className="mt-10">
            <div className="mx-auto max-w-2xl">
              <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                What do you want to build?
              </div>
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-[20px] opacity-60 blur-md"
                  style={{
                    background:
                      "linear-gradient(110deg, rgba(251,146,60,0.4) 0%, rgba(244,114,182,0.2) 50%, rgba(45,212,191,0.4) 100%)",
                  }}
                />
                <div className="relative rounded-2xl border bg-card p-3">
                  <textarea
                    placeholder="Describe the agent you want to build…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        submit(draft)
                      }
                    }}
                    rows={3}
                    className="w-full resize-none bg-transparent text-base leading-snug placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Voice input"
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => submit(draft)}
                      disabled={!draft.trim() || submitting}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                      aria-label="Send"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Templates */}
          <section className="mt-10">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-sm font-medium">Start from a template</h2>
              <button
                type="button"
                onClick={() => setTab("templates")}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                See all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {FLOW_TEMPLATES.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => submit(t.prompt)}
                  className="flex flex-col items-start gap-3 rounded-xl border bg-muted/40 p-3 text-left transition-colors hover:bg-accent/60"
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: t.iconColor }}
                  >
                    {t.iconLetter}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Table */}
          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilterChip label="Created by" />
                <FilterChip label="Status" />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search agents"
                    className="h-8 w-56 pl-7 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  See all <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
            <FlowsTable rows={rows.slice(0, 6)} onRowClick={(id) => navigate(`/agent/flow/${id}`)} />
          </section>
        </>
      )}

      {tab === "all" && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterChip label="Created by" />
              <FilterChip label="Status" />
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents"
                className="h-8 w-64 pl-7 text-xs"
              />
            </div>
          </div>
          <FlowsTable rows={rows} onRowClick={(id) => navigate(`/agent/flow/${id}`)} />
        </section>
      )}

      {tab === "templates" && (
        <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FLOW_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => submit(t.prompt)}
              className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/30 hover:bg-accent/30"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: t.iconColor }}
              >
                {t.iconLetter}
              </span>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.category}</div>
                <div className="text-sm font-semibold">{t.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </div>
            </button>
          ))}
        </section>
      )}

      {tab === "scheduled" && (
        <div className="mt-12 rounded-xl border border-dashed bg-card/50 p-8 text-center">
          <Workflow className="mx-auto h-6 w-6 text-muted-foreground" />
          <h2 className="mt-2 text-base font-semibold">No scheduled agents</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Set a recurring schedule on any agent — its runs will show up here.
          </p>
        </div>
      )}
    </div>
  )
}

function TabPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-3 py-2.5 text-sm transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active && <span className="absolute right-2 -bottom-px left-2 h-0.5 rounded-full bg-foreground" />}
    </button>
  )
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  )
}

function FlowsTable({
  rows,
  onRowClick,
}: {
  rows: FlowTableRow[]
  onRowClick: (id: string) => void
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No agents match your filters.
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="py-2.5 pl-4 pr-2 text-left font-medium">Agent</th>
            <th className="px-2 py-2.5 text-left font-medium">Status</th>
            <th className="px-2 py-2.5 text-left font-medium">Created by</th>
            <th className="py-2.5 pl-2 pr-4 text-left font-medium">Last modified</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={() => !r.id.startsWith("placeholder") && onRowClick(r.id)}
              className={cn(
                "border-t text-sm",
                !r.id.startsWith("placeholder") && "cursor-pointer hover:bg-muted/30",
              )}
            >
              <td className="py-2.5 pl-4 pr-2">
                <div className="flex items-center gap-2">
                  <Workflow className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{r.name}</span>
                </div>
              </td>
              <td className="px-2 py-2.5">
                <StatusChip status={r.status} />
              </td>
              <td className="px-2 py-2.5 text-xs text-muted-foreground">{r.createdBy}</td>
              <td className="py-2.5 pl-2 pr-4 text-xs text-muted-foreground">
                {formatRelative(r.lastModified)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusChip({ status }: { status: AutopilotArtifact["status"] }) {
  const meta = {
    active: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
    paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
    draft: { label: "Draft", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" },
  }[status]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", meta.className)}>
      {meta.label}
    </span>
  )
}

function formatRelative(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
