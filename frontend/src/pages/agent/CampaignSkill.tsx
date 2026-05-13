import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  ClipboardList,
  ExternalLink,
  Filter,
  Mail,
  MessageSquare,
  Plus,
  Radio,
  Rocket,
  Send,
  Sparkles,
  StickyNote,
  Target,
  User,
} from "lucide-react"
import {
  AGENT_STORAGE_EVENT,
  getAgentChats,
  getCampaignArtifacts,
  upsertCampaignArtifact,
} from "@/lib/agent/storage"
import type { CampaignArtifact, CampaignArtifactTask } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { SkillSidePanel } from "@/components/agent/SkillSidePanel"
import { cn } from "@/lib/utils"

type Tab = "brief" | "tasks" | "activation" | "deliverables" | "chats"

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "brief", label: "Brief", icon: StickyNote },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "activation", label: "Activation", icon: Radio },
  { id: "deliverables", label: "Deliverables", icon: Send },
  { id: "chats", label: "Chats", icon: MessageSquare },
]

export function CampaignSkill() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [artifact, setArtifact] = useState<CampaignArtifact | null>(null)
  const [tab, setTab] = useState<Tab>("brief")
  const [panelOpen, setPanelOpen] = useState(true)

  useEffect(() => {
    const load = () => {
      const list = getCampaignArtifacts()
      setArtifact(list.find((a) => a.id === id) ?? null)
    }
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [id])

  function update(patch: Partial<CampaignArtifact>) {
    if (!artifact) return
    const next = { ...artifact, ...patch }
    setArtifact(next)
    upsertCampaignArtifact(next)
  }

  if (!artifact) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Campaign not found.
        <Button variant="link" onClick={() => navigate("/")}>
          Back to home
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate("/agent/campaigns")} aria-label="Back">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Campaigns</span>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate">{artifact.name}</span>
              </div>
              <h1 className="truncate text-base font-semibold">{artifact.name}</h1>
            </div>
            <span
              className={cn(
                "ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium",
                artifact.status === "active"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : artifact.status === "draft"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {artifact.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {artifact.status !== "active" && (
              <Button
                size="sm"
                onClick={() => update({ status: "active" })}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Rocket className="h-3.5 w-3.5" />
                Activate campaign
              </Button>
            )}
            {!panelOpen && (
              <Button variant="outline" size="sm" onClick={() => setPanelOpen(true)} className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Open chat
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 items-center gap-0 border-b px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
                tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {tab === t.id && (
                <span className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
          {tab === "brief" && <BriefTab artifact={artifact} onChange={update} />}
          {tab === "tasks" && <TasksTab artifact={artifact} onChange={update} />}
          {tab === "activation" && <ActivationTab artifact={artifact} />}
          {tab === "deliverables" && <DeliverablesTab artifact={artifact} onChange={update} />}
          {tab === "chats" && <ChatsTab artifact={artifact} />}
        </div>
      </div>

      {panelOpen && (
        <SkillSidePanel
          chatId={artifact.chatId}
          title={artifact.name}
          contextLabel="Campaign Skill"
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  )
}

function BriefTab({
  artifact,
  onChange,
}: {
  artifact: CampaignArtifact
  onChange: (p: Partial<CampaignArtifact>) => void
}) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-3 text-[11px] text-muted-foreground">
        Last updated {timeAgo(artifact.createdAt)}
      </div>
      <h2 className="text-2xl font-semibold">{artifact.name}</h2>

      <div className="mt-5 space-y-2 rounded-lg border bg-card p-4 text-sm">
        <BriefRow icon={CalendarDays} label="Date range" value={`${formatDate(artifact.dateRange.start)} → ${formatDate(artifact.dateRange.end)}`} />
        <BriefRow icon={User} label="Owner" value={artifact.owner} />
        <BriefRow icon={Target} label="Audience" value={artifact.audience} />
        <BriefRow icon={Radio} label="Channels" value={artifact.channels.join(", ")} />
      </div>

      <Section title="Campaign overview">
        <textarea
          value={artifact.overview}
          onChange={(e) => onChange({ overview: e.target.value })}
          rows={6}
          className="w-full resize-none rounded-lg border bg-card p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          <strong className="font-medium text-foreground">Cadence:</strong> {artifact.cadence}
        </p>
      </Section>

      <Section title="Goals">
        <ul className="space-y-1.5 text-sm">
          {artifact.goals.map((g, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

function BriefRow({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-32 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function TasksTab({
  artifact,
  onChange,
}: {
  artifact: CampaignArtifact
  onChange: (p: Partial<CampaignArtifact>) => void
}) {
  const total = artifact.tasks.length
  const done = artifact.tasks.filter((t) => t.status === "done").length

  function toggleTask(taskId: string) {
    const tasks = artifact.tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: t.status === "done" ? "todo" : "done" } as CampaignArtifactTask
        : t,
    )
    onChange({ tasks })
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            Tasks
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Circle className="h-2 w-2" />
              Completed {done}/{total}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ChevronsUpDown className="h-3.5 w-3.5" />
            Grouping
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="py-2 pr-2 pl-4 text-left font-medium">Task</th>
              <th className="px-2 py-2 text-left font-medium">Due</th>
              <th className="px-2 py-2 text-left font-medium">Priority</th>
              <th className="px-2 py-2 text-left font-medium">Owner</th>
              <th className="px-2 py-2 text-left font-medium">Deliverable</th>
              <th className="py-2 pr-4 pl-2 text-left font-medium">Chat</th>
            </tr>
          </thead>
          <tbody>
            {artifact.tasks.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/20">
                <td className="py-2 pr-2 pl-4">
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {t.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn("truncate", t.status === "done" && "text-muted-foreground line-through")}>
                      {t.title}
                    </span>
                  </button>
                </td>
                <td className="px-2 py-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDateShort(t.dueDate)}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <PriorityChip priority={t.priority} />
                </td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{t.owner}</td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{t.deliverable ?? "—"}</td>
                <td className="py-2 pr-4 pl-2">
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]">
                    <Sparkles className="h-3 w-3 text-foreground" />
                    Get Started
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PriorityChip({ priority }: { priority: "low" | "medium" | "high" }) {
  const meta = {
    high: { label: "High", color: "text-rose-600", bars: 3 },
    medium: { label: "Medium", color: "text-amber-600", bars: 2 },
    low: { label: "Low", color: "text-muted-foreground", bars: 1 },
  }[priority]
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", meta.color)}>
      <span className="flex items-end gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("w-0.5 rounded-sm bg-current", i <= meta.bars ? "opacity-100" : "opacity-25")}
            style={{ height: `${i * 3 + 3}px` }}
          />
        ))}
      </span>
      {meta.label}
    </span>
  )
}

function ActivationTab({ artifact }: { artifact: CampaignArtifact }) {
  return (
    <div className="mx-auto max-w-3xl space-y-3 p-6">
      <h2 className="text-xl font-semibold">Activation</h2>
      <p className="text-sm text-muted-foreground">
        Once you activate this campaign, content will publish to the channels below on the schedule defined in Tasks.
      </p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {artifact.activation.map((a) => (
          <div key={a.channel} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                {a.channel}
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                {a.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{a.reachEstimate}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DeliverablesTab({
  artifact,
  onChange,
}: {
  artifact: CampaignArtifact
  onChange: (p: Partial<CampaignArtifact>) => void
}) {
  const [activeId, setActiveId] = useState<string>(artifact.deliverables[0]?.id ?? "")
  const active = artifact.deliverables.find((d) => d.id === activeId) ?? artifact.deliverables[0]

  function updateActive(body: string) {
    if (!active) return
    onChange({
      deliverables: artifact.deliverables.map((d) => (d.id === active.id ? { ...d, body } : d)),
    })
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
      <div className="border-r bg-card/50 p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Drafts</div>
        <ul className="space-y-1">
          {artifact.deliverables.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setActiveId(d.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md p-2 text-left text-sm hover:bg-accent/40",
                  active?.id === d.id && "bg-accent/60",
                )}
              >
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {d.status} · publish {formatDateShort(d.publishAt)}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-y-auto p-6">
        {active && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{active.title}</h2>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm">
                  Approve
                </Button>
                <Button size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Publish preview
                </Button>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {active.status} · {active.type} · publishes {formatDate(active.publishAt)}
            </p>
            <textarea
              value={active.body ?? ""}
              onChange={(e) => updateActive(e.target.value)}
              rows={16}
              className="mt-4 w-full resize-none rounded-lg border bg-card p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </>
        )}
      </div>
    </div>
  )
}

function ChatsTab({ artifact }: { artifact: CampaignArtifact }) {
  const related = useMemo(
    () => getAgentChats().filter((c) => c.artifactRef?.id === artifact.id),
    [artifact.id],
  )
  return (
    <div className="mx-auto max-w-3xl space-y-3 p-6">
      <h2 className="text-xl font-semibold">Chats</h2>
      {related.length === 0 && (
        <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          No chats yet for this campaign.
        </div>
      )}
      {related.map((c) => (
        <div key={c.id} className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{c.title}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(c.updatedAt)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.preview}</p>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}
function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "less than a minute ago"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}
