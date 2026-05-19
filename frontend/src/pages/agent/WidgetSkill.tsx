import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Pencil,
  Pin,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AGENT_STORAGE_EVENT,
  getWidgetArtifacts,
  upsertWidgetArtifact,
} from "@/lib/agent/storage"
import type { WidgetArtifact, WidgetType } from "@/types/agent"
import { SkillSidePanel } from "@/components/agent/SkillSidePanel"
import { cn } from "@/lib/utils"

const TYPES: { id: WidgetType; label: string }[] = [
  { id: "kpi", label: "KPI" },
  { id: "line", label: "Line" },
  { id: "bar", label: "Bar" },
  { id: "pie", label: "Pie" },
]

const PIE_COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export function WidgetSkill() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [artifact, setArtifact] = useState<WidgetArtifact | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)

  useEffect(() => {
    const load = () => {
      const list = getWidgetArtifacts()
      setArtifact(list.find((a) => a.id === id) ?? null)
    }
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [id])

  function update(patch: Partial<WidgetArtifact>) {
    if (!artifact) return
    const next = { ...artifact, ...patch }
    setArtifact(next)
    upsertWidgetArtifact(next)
  }

  if (!artifact) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Widget not found.
        <Button variant="link" onClick={() => navigate("/agent/widgets")}>
          Back to widgets
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate("/agent/widgets")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Widgets</span>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate">{artifact.title}</span>
              </div>
              <h1 className="truncate text-base font-semibold">{artifact.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Pin className="h-3.5 w-3.5" />
              Pin to dashboard
            </Button>
            {!panelOpen && (
              <Button variant="outline" size="sm" onClick={() => setPanelOpen(true)} className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Open chat
              </Button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{artifact.title}</h2>
                  <p className="text-xs text-muted-foreground">{artifact.description}</p>
                </div>
                <div className="flex gap-1">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update({ type: t.id })}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px] font-medium",
                        artifact.type === t.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-input text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 h-72">
                <WidgetChart artifact={artifact} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-card p-4 text-xs">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                <Pencil className="h-3 w-3" />
                Prompt
              </div>
              <p className="text-sm">{artifact.prompt}</p>
            </div>
          </div>
        </div>
      </div>

      {panelOpen && (
        <SkillSidePanel
          chatId={artifact.chatId}
          title={artifact.title}
          contextLabel="Widget Skill"
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  )
}

function WidgetChart({ artifact }: { artifact: WidgetArtifact }) {
  const fmt = useMemo(() => {
    if (artifact.unit === "$") return (v: number) => `$${v.toLocaleString()}`
    if (artifact.unit === "%") return (v: number) => `${v}%`
    return (v: number) => v.toLocaleString()
  }, [artifact.unit])

  if (artifact.type === "kpi") {
    const value = artifact.data[0]?.value ?? 0
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-5xl font-semibold tracking-tight">{fmt(value)}</div>
        {artifact.trend && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              artifact.trend.direction === "up"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
            )}
          >
            {artifact.trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {artifact.trend.delta} vs prior period
          </div>
        )}
      </div>
    )
  }
  if (artifact.type === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={artifact.data.map((d) => ({ label: d.label, value: d.value }))}>
          <CartesianGrid strokeDasharray="2 4" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmt(v as number)} tick={{ fontSize: 11 }} width={50} />
          <Tooltip formatter={(v) => fmt(v as number)} />
          <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }
  if (artifact.type === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={artifact.data}>
          <CartesianGrid strokeDasharray="2 4" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmt(v as number)} tick={{ fontSize: 11 }} width={50} />
          <Tooltip formatter={(v) => fmt(v as number)} />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }
  // pie
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip formatter={(v) => fmt(v as number)} />
        <Pie data={artifact.data} dataKey="value" nameKey="label" innerRadius={50} outerRadius={90} paddingAngle={2}>
          {artifact.data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
