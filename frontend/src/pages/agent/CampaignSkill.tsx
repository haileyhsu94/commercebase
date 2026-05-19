import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import {
  CalendarDays,
  DollarSign,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  ExternalLink,
  Filter,
  Mail,
  MessageSquare,
  Plus,
  Radio,
  Rocket,
  Sparkles,
  StickyNote,
  Target,
  Trash2,
  User,
  X,
} from "lucide-react"
import {
  AGENT_STORAGE_EVENT,
  getAgentChats,
  getCampaignArtifacts,
  upsertCampaignArtifact,
} from "@/lib/agent/storage"
import type { CampaignArtifact, CampaignArtifactTask } from "@/types/agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerField } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdPreview } from "@/components/campaigns/AdPreview"
import { SkillSidePanel } from "@/components/agent/SkillSidePanel"
import type { CampaignArtifactAdCopy } from "@/types/agent"
import {
  ATTRIBUTION_OPTIONS,
  BID_STRATEGY_OPTIONS,
  BUDGET_TYPE_OPTIONS,
  CAMPAIGN_OBJECTIVE_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/types/campaign-wizard"
import { CountryMultiSelect } from "@/components/campaigns/wizard/CountryMultiSelect"
import { cn } from "@/lib/utils"

const DEVICE_OPTIONS = ["mobile", "tablet", "desktop"] as const
const AGE_BAND_OPTIONS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const

type AdAspect = NonNullable<CampaignArtifactAdCopy["aspectRatio"]>

const CHANNEL_ASPECT_RATIO: Record<string, AdAspect> = {
  Instagram: "1:1",
  TikTok: "9:16",
  LinkedIn: "1.91:1",
  X: "1.91:1",
  Email: "1.91:1",
  Newsletter: "1.91:1",
  Blog: "1.91:1",
  "Paid social": "1.91:1",
  "Paid search": "1.91:1",
}

const AUDIENCE_OPTIONS = [
  "All shoppers",
  "VIP / loyalty members",
  "High-intent shoppers",
  "Cart abandoners",
  "Lapsed customers (90+ days)",
  "New visitors",
  "Email subscribers",
]

const CHANNEL_OPTIONS = [
  "Email",
  "LinkedIn",
  "Instagram",
  "TikTok",
  "X",
  "Blog",
  "Newsletter",
  "Paid social",
  "Paid search",
]

const OWNER_OPTIONS = ["Hailey Hsu", "Aeris", "Marketing team", "John Doe"]

const CADENCE_OPTIONS = ["Daily", "Weekly", "Bi-weekly", "Monthly", "One-off"]

type Tab = "brief" | "tasks" | "activation" | "deliverables" | "chats"

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "brief", label: "Brief", icon: StickyNote },
  // Tasks tab hidden until we have a concrete use case. TasksTab component
  // and Tab type entry are kept so we can flip it back on by uncommenting.
  // { id: "tasks", label: "Tasks", icon: ClipboardList }, // re-import ClipboardList from lucide-react to re-enable
  { id: "activation", label: "Activation", icon: Radio },
  // Deliverables tab hidden — its job is folded into Brief (Ad preview) and
  // Activation. Re-enable by uncommenting and re-importing Send if removed.
  // { id: "deliverables", label: "Deliverables", icon: Send },
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
  const [newGoal, setNewGoal] = useState("")

  function toIso(yyyyMmDd: string) {
    if (!yyyyMmDd) return ""
    return new Date(`${yyyyMmDd}T00:00:00`).toISOString()
  }
  function toDateInput(iso: string) {
    if (!iso) return ""
    return format(new Date(iso), "yyyy-MM-dd")
  }

  function toggleChannel(channel: string) {
    const has = artifact.channels.includes(channel)
    const next = has ? artifact.channels.filter((c) => c !== channel) : [...artifact.channels, channel]
    onChange({ channels: next })
  }

  function addGoal() {
    const text = newGoal.trim()
    if (!text) return
    onChange({ goals: [...artifact.goals, text] })
    setNewGoal("")
  }
  function updateGoal(idx: number, value: string) {
    const next = artifact.goals.map((g, i) => (i === idx ? value : g))
    onChange({ goals: next })
  }
  function removeGoal(idx: number) {
    onChange({ goals: artifact.goals.filter((_, i) => i !== idx) })
  }

  function toggleArrayValue<K extends keyof CampaignArtifact>(field: K, value: string) {
    const current = (artifact[field] as unknown as string[] | undefined) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ [field]: next } as Partial<CampaignArtifact>)
  }

  const budget = artifact.budget ?? { amount: 0, currency: "USD", type: "total" }

  return (
    <div className="mx-auto max-w-3xl p-6 pb-16">
      <div className="mb-3 text-[11px] text-muted-foreground">
        Last updated {timeAgo(artifact.createdAt)}
      </div>
      <input
        type="text"
        value={artifact.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="w-full rounded-md border border-transparent bg-transparent text-2xl font-semibold focus:border-input focus:bg-card focus:px-2 focus:py-1 focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Header chips: date range + owner pill */}
      <div className="mt-5 space-y-3 rounded-lg border bg-card p-4 text-sm">
        <BriefField icon={CalendarDays} label="Date range">
          <div className="flex flex-1 items-center gap-2">
            <div className="min-w-0 flex-1">
              <DatePickerField
                value={toDateInput(artifact.dateRange.start)}
                onChange={(v) =>
                  onChange({ dateRange: { ...artifact.dateRange, start: toIso(v) } })
                }
                placeholder="Start date"
              />
            </div>
            <span className="text-xs text-muted-foreground">→</span>
            <div className="min-w-0 flex-1">
              <DatePickerField
                value={toDateInput(artifact.dateRange.end)}
                onChange={(v) =>
                  onChange({ dateRange: { ...artifact.dateRange, end: toIso(v) } })
                }
                placeholder="End date"
                minDate={artifact.dateRange.start ? new Date(artifact.dateRange.start) : undefined}
              />
            </div>
          </div>
        </BriefField>

        <BriefField icon={User} label="Owner">
          <Select value={artifact.owner} onValueChange={(v) => onChange({ owner: v ?? "" })}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Pick an owner">
                {(value) =>
                  value ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium">
                        {initialsOf(String(value))}
                      </span>
                      {String(value)}
                    </span>
                  ) : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {OWNER_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  <span className="inline-flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium">
                      {initialsOf(o)}
                    </span>
                    {o}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BriefField>
      </div>

      {/* Prose summary */}
      <Section title="Campaign details & goals">
        <textarea
          value={artifact.overview}
          onChange={(e) => onChange({ overview: e.target.value })}
          rows={6}
          className="w-full resize-none rounded-lg border bg-card p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <ul className="mt-3 space-y-1.5 text-sm">
          {artifact.goals.map((g, i) => (
            <li key={i} className="group flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <input
                type="text"
                value={g}
                onChange={(e) => updateGoal(i, e.target.value)}
                className="flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm focus:border-input focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeGoal(i)}
                className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label="Remove goal"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center gap-2">
          <Input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addGoal()
              }
            }}
            placeholder="Add a goal…"
            className="h-8 flex-1 text-sm"
          />
          <Button size="sm" variant="outline" onClick={addGoal} disabled={!newGoal.trim()} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </Section>

      <Section title="Target audience">
        <textarea
          value={artifact.audienceDescription ?? ""}
          onChange={(e) => onChange({ audienceDescription: e.target.value })}
          rows={4}
          placeholder="Describe who this campaign is for — demographics, intent signals, behaviors."
          className="w-full resize-none rounded-lg border bg-card p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      <Section title="Messaging & positioning">
        <textarea
          value={artifact.messaging ?? ""}
          onChange={(e) => onChange({ messaging: e.target.value })}
          rows={4}
          placeholder="What's the story we want to tell? Positioning, tone, key proof points."
          className="w-full resize-none rounded-lg border bg-card p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      {/* Essentials form */}
      <Section title="Essentials">
        <div className="space-y-3 rounded-lg border bg-card p-4 text-sm">
          <BriefField icon={Target} label="Objective">
            <Select value={artifact.objective ?? ""} onValueChange={(v) => onChange({ objective: v ?? "" })}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick an objective" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OBJECTIVE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BriefField>

          <BriefField icon={Sparkles} label="Campaign type">
            <Select value={artifact.campaignType ?? ""} onValueChange={(v) => onChange({ campaignType: v ?? "" })}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick a campaign type" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BriefField>

          <BriefField icon={DollarSign} label="Budget">
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={budget.amount || ""}
                onChange={(e) =>
                  onChange({ budget: { ...budget, amount: Number(e.target.value) || 0 } })
                }
                placeholder="0"
                className="h-8 w-28 text-sm"
              />
              <div className="min-w-0 flex-1">
                <Select
                  value={budget.currency}
                  onValueChange={(v) => onChange({ budget: { ...budget, currency: v ?? "USD" } })}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} {c.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 flex-1">
                <Select
                  value={budget.type ?? "total"}
                  onValueChange={(v) => onChange({ budget: { ...budget, type: v ?? "total" } })}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_TYPE_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </BriefField>

          <BriefField icon={Radio} label="Channels">
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_OPTIONS.map((c) => {
                const active = artifact.channels.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {active && <X className="h-3 w-3" />}
                    {c}
                  </button>
                )
              })}
            </div>
          </BriefField>

          <BriefField icon={Target} label="Audience preset">
            <Select value={artifact.audience} onValueChange={(v) => onChange({ audience: v ?? "" })}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick an audience" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BriefField>

          <BriefField icon={CalendarDays} label="Cadence">
            <Select value={artifact.cadence} onValueChange={(v) => onChange({ cadence: v ?? "" })}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Pick cadence" />
              </SelectTrigger>
              <SelectContent>
                {CADENCE_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BriefField>

          <BriefField icon={ExternalLink} label="Final URL">
            <Input
              type="url"
              value={artifact.finalUrl ?? ""}
              onChange={(e) => onChange({ finalUrl: e.target.value })}
              placeholder="https://…"
              className="h-8 text-sm"
            />
          </BriefField>
        </div>
      </Section>

      {/* Advanced accordions */}
      <Section title="Advanced">
        <div className="space-y-2">
          <Accordion summary="Bidding & attribution">
            <div className="space-y-3 text-sm">
              <BriefField icon={Sparkles} label="Bid strategy">
                <Select value={artifact.bidStrategy ?? ""} onValueChange={(v) => onChange({ bidStrategy: v ?? "" })}>
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Pick a bid strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {BID_STRATEGY_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </BriefField>
              <BriefField icon={Target} label="Target CPA">
                <Input
                  value={artifact.biddingTargetCpa ?? ""}
                  onChange={(e) => onChange({ biddingTargetCpa: e.target.value })}
                  placeholder="e.g. 20"
                  className="h-8 text-sm"
                />
              </BriefField>
              <BriefField icon={Target} label="Target ROAS">
                <Input
                  value={artifact.biddingTargetRoas ?? ""}
                  onChange={(e) => onChange({ biddingTargetRoas: e.target.value })}
                  placeholder="e.g. 400%"
                  className="h-8 text-sm"
                />
              </BriefField>
              <BriefField icon={Sparkles} label="Attribution">
                <Select
                  value={artifact.attributionModel ?? ""}
                  onValueChange={(v) => onChange({ attributionModel: v ?? "" })}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Pick a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTION_OPTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </BriefField>
            </div>
          </Accordion>

          <Accordion summary="Targeting">
            <div className="space-y-3 text-sm">
              <BriefField icon={Target} label="Countries">
                <CountryMultiSelect
                  value={artifact.regions ?? []}
                  onChange={(next) => onChange({ regions: next })}
                />
              </BriefField>
              <BriefField icon={Target} label="Devices">
                <div className="flex flex-wrap gap-1.5">
                  {DEVICE_OPTIONS.map((d) => {
                    const active = (artifact.devices ?? []).includes(d)
                    return (
                      <ChipToggle
                        key={d}
                        active={active}
                        onClick={() => toggleArrayValue("devices", d)}
                      >
                        {d}
                      </ChipToggle>
                    )
                  })}
                </div>
              </BriefField>
              <BriefField icon={Target} label="Age bands">
                <div className="flex flex-wrap gap-1.5">
                  {AGE_BAND_OPTIONS.map((a) => {
                    const active = (artifact.ageBands ?? []).includes(a)
                    return (
                      <ChipToggle
                        key={a}
                        active={active}
                        onClick={() => toggleArrayValue("ageBands", a)}
                      >
                        {a}
                      </ChipToggle>
                    )
                  })}
                </div>
              </BriefField>
              <BriefField icon={Target} label="Languages">
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                  {LANGUAGE_OPTIONS.slice(0, 20).map((l) => {
                    const active = (artifact.languages ?? []).includes(l.value)
                    return (
                      <ChipToggle
                        key={l.value}
                        active={active}
                        onClick={() => toggleArrayValue("languages", l.value)}
                      >
                        {l.label}
                      </ChipToggle>
                    )
                  })}
                </div>
              </BriefField>
            </div>
          </Accordion>

          <Accordion summary="Creative & brand">
            <div className="space-y-4 text-sm">
              <AdPreviewSection artifact={artifact} onChange={onChange} />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <BrandField
                  label="Main color"
                  value={artifact.brand?.mainColor ?? ""}
                  onChange={(v) => onChange({ brand: { ...(artifact.brand ?? {}), mainColor: v } })}
                  placeholder="#7C3AED"
                />
                <BrandField
                  label="Accent color"
                  value={artifact.brand?.accentColor ?? ""}
                  onChange={(v) => onChange({ brand: { ...(artifact.brand ?? {}), accentColor: v } })}
                  placeholder="#F97316"
                />
                <BrandField
                  label="Font"
                  value={artifact.brand?.font ?? ""}
                  onChange={(v) => onChange({ brand: { ...(artifact.brand ?? {}), font: v } })}
                  placeholder="Inter"
                />
              </div>
            </div>
          </Accordion>

          <Accordion summary="Tracking">
            <div className="space-y-3 text-sm">
              <BriefField icon={Sparkles} label="UTM prefix">
                <Input
                  value={artifact.tracking?.utmPrefix ?? ""}
                  onChange={(e) =>
                    onChange({ tracking: { ...(artifact.tracking ?? {}), utmPrefix: e.target.value } })
                  }
                  placeholder="agent_"
                  className="h-8 text-sm"
                />
              </BriefField>
              <BriefField icon={Sparkles} label="Tracking template">
                <Input
                  value={artifact.tracking?.trackingTemplate ?? ""}
                  onChange={(e) =>
                    onChange({ tracking: { ...(artifact.tracking ?? {}), trackingTemplate: e.target.value } })
                  }
                  placeholder="{lpurl}?utm_source={network}"
                  className="h-8 text-sm"
                />
              </BriefField>
            </div>
          </Accordion>
        </div>
      </Section>
    </div>
  )
}

function Accordion({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-sm font-medium">
        {summary}
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t p-4">{children}</div>
    </details>
  )
}

function ChipToggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-input bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {active && <X className="h-3 w-3" />}
      {children}
    </button>
  )
}

function BrandField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-muted-foreground">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  )
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function BriefField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Sparkles
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-32 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function AdPreviewSection({
  artifact,
  onChange,
}: {
  artifact: CampaignArtifact
  onChange: (p: Partial<CampaignArtifact>) => void
}) {
  function updateAd(channel: string, patch: Partial<CampaignArtifactAdCopy>) {
    const current = artifact.ads?.[channel] ?? { headline: "", description: "" }
    onChange({
      ads: {
        ...(artifact.ads ?? {}),
        [channel]: { ...current, ...patch },
      },
    })
  }

  if (artifact.channels.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card/40 p-4 text-center text-xs text-muted-foreground">
        Pick at least one channel above to preview the ad.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {artifact.channels.map((channel) => {
        const ad = artifact.ads?.[channel] ?? { headline: "", description: "", imageUrl: "" }
        const aspect = ad.aspectRatio ?? CHANNEL_ASPECT_RATIO[channel] ?? "1.91:1"
        return (
          <div
            key={channel}
            className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_320px]"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Radio className="h-3.5 w-3.5" />
                {channel}
                <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                  {aspect}
                </span>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] text-muted-foreground">Headline</label>
                <Input
                  value={ad.headline}
                  onChange={(e) => updateAd(channel, { headline: e.target.value })}
                  placeholder="Primary headline"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] text-muted-foreground">Description</label>
                <textarea
                  value={ad.description}
                  onChange={(e) => updateAd(channel, { description: e.target.value })}
                  rows={3}
                  placeholder="Description text appears here."
                  className="w-full resize-none rounded-md border bg-card p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] text-muted-foreground">Image URL</label>
                <Input
                  value={ad.imageUrl ?? ""}
                  onChange={(e) => updateAd(channel, { imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div>
              <AdPreview
                headline={ad.headline}
                description={ad.description}
                imageUrl={ad.imageUrl}
                aspectRatioValue={aspect}
              />
            </div>
          </div>
        )
      })}
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

      <div className="mt-5 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[720px] text-sm">
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
