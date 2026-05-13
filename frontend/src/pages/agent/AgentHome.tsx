import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowUp,
  BarChart3,
  Check,
  ChevronRight,
  Mic,
  Paperclip,
  Sparkles,
  Workflow,
} from "lucide-react"
import { currentUser } from "@/lib/mock-data"
import { activateSkillFromPrompt } from "@/lib/agent/activate"
import { AGENT_STORAGE_EVENT, getAgentChats, getOnboarding } from "@/lib/agent/storage"
import { describeSkill, detectSkill } from "@/lib/agent/skill-detect"
import type { AgentChat, OnboardingState } from "@/types/agent"
import { CONNECTORS } from "@/lib/agent/connectors"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  {
    text: "Create a 6-week thought leadership campaign to grow our audience.",
    skill: "campaign" as const,
  },
  {
    text: "Set up an autopilot welcome flow for new email subscribers.",
    skill: "autopilot" as const,
  },
  {
    text: "Show me a chart of revenue trends over the last 12 weeks.",
    skill: "widget" as const,
  },
  {
    text: "Analyze my campaign performance and suggest improvements.",
    skill: "chat" as const,
  },
]

export function AgentHome() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState("")
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => getOnboarding())
  const [chats, setChats] = useState<AgentChat[]>(() => getAgentChats())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setOnboarding(getOnboarding())
      setChats(getAgentChats())
    }
    window.addEventListener(AGENT_STORAGE_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(AGENT_STORAGE_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])
  const firstName = currentUser.name.split(" ")[0]

  function submit(prompt: string) {
    const text = prompt.trim()
    if (!text || submitting) return
    setSubmitting(true)
    // Tiny delay so the user briefly sees their prompt in the input
    setTimeout(() => {
      const result = activateSkillFromPrompt(text)
      navigate(result.route)
    }, 120)
  }

  const recentChats = chats.slice(0, 5)
  const connectedCount = onboarding.connectors.filter((c) => c.status === "connected").length
  const onboardingProgress = Math.min(
    6,
    (onboarding.storeUrl ? 1 : 0) +
      (onboarding.brandName ? 1 : 0) +
      (onboarding.goals.length ? 1 : 0) +
      (connectedCount > 0 ? 1 : 0) +
      (connectedCount >= 3 ? 1 : 0) +
      (onboarding.invitedEmails.length ? 1 : 0),
  )

  const showGettingStarted = !onboarding.completed || onboardingProgress < 6

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Describe what you want to do — I'll pick the right skill and build it out.
          </p>
        </div>

        <ChatInput draft={draft} setDraft={setDraft} onSubmit={submit} submitting={submitting} />

        <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              type="button"
              onClick={() => submit(s.text)}
              disabled={submitting}
              className="group flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-foreground/30 hover:bg-accent/40 disabled:opacity-60"
            >
              <SkillIcon skill={s.skill} />
              <div className="min-w-0 flex-1">
                <div className="text-sm">{s.text}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{describeSkill(s.skill)}</div>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        {showGettingStarted && (
          <GettingStarted onboarding={onboarding} progress={onboardingProgress} navigate={navigate} />
        )}

        {recentChats.length > 0 && (
          <div className="mt-10">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent skills
            </div>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {recentChats.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => navigate(routeForChat(c))}
                    className="flex w-full items-start gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:border-foreground/30 hover:bg-accent/40"
                  >
                    <SkillIcon skill={c.artifactRef?.type ?? "chat"} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.title}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {describeSkill(c.artifactRef?.type ?? "chat")} · {new Date(c.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatInput({
  draft,
  setDraft,
  onSubmit,
  submitting,
}: {
  draft: string
  setDraft: (s: string) => void
  onSubmit: (s: string) => void
  submitting: boolean
}) {
  const detected = draft.trim() ? detectSkill(draft) : null
  return (
    <div className="relative mt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[20px] opacity-60 blur-md"
        style={{
          background:
            "linear-gradient(110deg, rgba(251,146,60,0.4) 0%, rgba(244,114,182,0.2) 50%, rgba(45,212,191,0.4) 100%)",
        }}
      />
      <div className="relative rounded-2xl border bg-card p-3 shadow-sm transition-shadow focus-within:shadow-md">
        <textarea
          placeholder="Type a message..."
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
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Attach
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Auto
            </button>
            {detected && detected !== "chat" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                <Sparkles className="h-3 w-3" /> Will activate {describeSkill(detected)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
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
  )
}

function SkillIcon({ skill }: { skill: "campaign" | "autopilot" | "widget" | "chat" }) {
  const map = {
    campaign: { icon: Sparkles, color: "text-foreground", bg: "bg-muted" },
    autopilot: { icon: Workflow, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    widget: { icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
    chat: { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  }[skill]
  const Icon = map.icon
  return (
    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", map.bg)}>
      <Icon className={cn("h-3.5 w-3.5", map.color)} />
    </span>
  )
}

function GettingStarted({
  onboarding,
  progress,
  navigate,
}: {
  onboarding: OnboardingState
  progress: number
  navigate: ReturnType<typeof useNavigate>
}) {
  const connectedCount = onboarding.connectors.filter((c) => c.status === "connected").length
  const items = [
    { done: !!onboarding.storeUrl, label: "Tell us about your store" },
    { done: onboarding.goals.length > 0, label: "Pick your goals" },
    { done: connectedCount > 0, label: "Connect your store" },
    { done: connectedCount >= 2, label: "Connect ad platforms" },
    { done: connectedCount >= 3, label: "Connect CRM or Slack" },
    { done: onboarding.invitedEmails.length > 0, label: "Invite your team" },
  ]
  return (
    <div className="mt-10 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Getting started</div>
          <div className="text-xs text-muted-foreground">{progress} / 6 complete</div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/agent/onboarding")}
          className="inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
        >
          {progress > 0 ? "Continue setup" : "Start setup"}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{ width: `${(progress / 6) * 100}%` }}
        />
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
              item.done ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full",
                item.done ? "bg-emerald-500 text-white" : "border bg-muted",
              )}
            >
              {item.done && <Check className="h-2.5 w-2.5" />}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
      {connectedCount === 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Popular:</span>
          {CONNECTORS.slice(0, 5).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate("/agent/onboarding")}
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 hover:bg-accent hover:text-foreground"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: c.brandColor }} />
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function routeForChat(chat: AgentChat) {
  if (chat.artifactRef?.type === "campaign") return `/agent/campaign/${chat.artifactRef.id}`
  if (chat.artifactRef?.type === "autopilot") return `/agent/flow/${chat.artifactRef.id}`
  if (chat.artifactRef?.type === "widget") return `/agent/widget/${chat.artifactRef.id}`
  return `/agent/chats/${chat.id}`
}
