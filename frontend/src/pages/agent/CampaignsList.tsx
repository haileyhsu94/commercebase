import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowUp, ChevronRight, Megaphone, Mic, Search, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  SkillFilterChip,
  SkillTable,
  type SkillTableRow,
} from "@/components/agent/SkillTable"
import { AGENT_STORAGE_EVENT, getCampaignArtifacts } from "@/lib/agent/storage"
import { activateSkillFromPrompt } from "@/lib/agent/activate"
import { CAMPAIGN_TEMPLATES } from "@/lib/agent/campaign-templates"
import {
  CAMPAIGN_STORAGE_UPDATED_EVENT,
  getUserCampaigns,
} from "@/lib/campaign-storage"
import type { Campaign } from "@/lib/mock-data"
import type { CampaignArtifact } from "@/types/agent"

type UnifiedCampaign =
  | {
      source: "agent"
      id: string
      name: string
      status: CampaignArtifact["status"]
      sortKey: number
      artifact: CampaignArtifact
    }
  | {
      source: "wizard"
      id: string
      name: string
      status: Campaign["status"]
      sortKey: number
      campaign: Campaign
    }

export function CampaignsList() {
  const [artifacts, setArtifacts] = useState<CampaignArtifact[]>([])
  const [wizardCampaigns, setWizardCampaigns] = useState<Campaign[]>([])
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [query, setQuery] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (searchParams.get("focus") === "1") {
      textareaRef.current?.focus()
      const next = new URLSearchParams(searchParams)
      next.delete("focus")
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const load = () => {
      setArtifacts(getCampaignArtifacts())
      setWizardCampaigns(getUserCampaigns())
    }
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    window.addEventListener(CAMPAIGN_STORAGE_UPDATED_EVENT, load)
    window.addEventListener("storage", load)
    return () => {
      window.removeEventListener(AGENT_STORAGE_EVENT, load)
      window.removeEventListener(CAMPAIGN_STORAGE_UPDATED_EVENT, load)
      window.removeEventListener("storage", load)
    }
  }, [])

  const items = useMemo<UnifiedCampaign[]>(() => {
    const agentItems: UnifiedCampaign[] = artifacts.map((a) => ({
      source: "agent",
      id: a.id,
      name: a.name,
      status: a.status,
      sortKey: new Date(a.createdAt).getTime(),
      artifact: a,
    }))
    const wizardItems: UnifiedCampaign[] = wizardCampaigns.map((c) => ({
      source: "wizard",
      id: c.id,
      name: c.name,
      status: c.status,
      sortKey: c.launchedAt ? new Date(c.launchedAt).getTime() : 0,
      campaign: c,
    }))
    return [...agentItems, ...wizardItems].sort((a, b) => b.sortKey - a.sortKey)
  }, [artifacts, wizardCampaigns])

  const rows = useMemo<SkillTableRow[]>(() => {
    const mapped: SkillTableRow[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      createdBy: item.source === "agent" ? "Aeris" : item.campaign.wizardSnapshot?.name ? "Wizard" : "You",
      lastModified: new Date(item.sortKey || Date.now()).toISOString(),
    }))
    const q = query.toLowerCase().trim()
    if (!q) return mapped
    return mapped.filter((r) => r.name.toLowerCase().includes(q))
  }, [items, query])

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
    <div className="mx-auto max-w-5xl p-6">
      <div>
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <p className="text-sm text-muted-foreground">
          Describe a campaign or pick a template — the agent builds the brief, tasks, and deliverables.
        </p>
      </div>

      <Launchpad
        draft={draft}
        setDraft={setDraft}
        onSubmit={submit}
        submitting={submitting}
        textareaRef={textareaRef}
      />

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkillFilterChip label="Created by" />
            <SkillFilterChip label="Status" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns"
                className="h-8 w-56 pl-7 text-xs"
              />
            </div>
          </div>
        </div>
        <SkillTable
          rows={rows}
          onRowClick={(id) => {
            const item = items.find((i) => i.id === id)
            if (!item) return
            navigate(item.source === "agent" ? `/agent/campaign/${id}` : `/campaigns/${id}`)
          }}
          icon={Megaphone}
          nameLabel="Campaign"
          emptyText="No campaigns yet — describe one above or pick a template to get started."
        />
      </section>
    </div>
  )
}

function Launchpad({
  draft,
  setDraft,
  onSubmit,
  submitting,
  textareaRef,
}: {
  draft: string
  setDraft: (s: string) => void
  onSubmit: (s: string) => void
  submitting: boolean
  textareaRef?: React.Ref<HTMLTextAreaElement>
}) {
  return (
    <div className="mt-6">
      {/* Chat input — mirrors Autopilot's "What do you want to build?" box */}
      <section>
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            What campaign do you want to launch?
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
                ref={textareaRef}
                placeholder="Describe the campaign you want to launch…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    onSubmit(draft)
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
                  onClick={() => onSubmit(draft)}
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

      {/* Template grid */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Start from a template
          </h2>
          <span className="text-xs text-muted-foreground">{CAMPAIGN_TEMPLATES.length} templates</span>
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {CAMPAIGN_TEMPLATES.map((t) => {
            const Icon = t.icon
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSubmit(t.prompt)}
                  disabled={submitting}
                  className="group flex h-full w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-foreground/30 hover:bg-accent/40 disabled:opacity-60"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${t.iconColor}15` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: t.iconColor }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        {t.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

