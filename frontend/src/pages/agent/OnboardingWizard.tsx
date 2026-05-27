import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, Mail, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CONNECTORS, getConnector } from "@/lib/agent/connectors"
import { getOnboarding, saveOnboarding } from "@/lib/agent/storage"
import type { ConnectorDef, ConnectorId, OnboardingState } from "@/types/agent"
import { ConnectorCard } from "@/components/agent/ConnectorCard"
import { OAuthDialog } from "@/components/agent/OAuthDialog"

const GOAL_CHIPS = [
  "Grow revenue",
  "Lower CAC",
  "Launch new products",
  "Build brand awareness",
  "Drive AI search visibility",
  "Automate lifecycle emails",
  "Recover abandoned checkouts",
  "Expand to new regions",
]

const STEPS = [
  { id: 0, title: "Your goals", description: "What should the agent prioritize?" },
  { id: 1, title: "Connect your store", description: "Plug in catalog and orders." },
  { id: 2, title: "Connect ad platforms", description: "Let the agent read performance." },
  { id: 3, title: "Connect CRM & messaging", description: "Email, alerts, and approvals." },
  { id: 4, title: "Invite your team", description: "Optional — you can skip this." },
]

export function OnboardingWizard() {
  const navigate = useNavigate()
  const [state, setState] = useState<OnboardingState>(() => getOnboarding())
  const [step, setStep] = useState(0)
  const [oauthFor, setOauthFor] = useState<ConnectorDef | null>(null)
  const [emailDraft, setEmailDraft] = useState("")

  function patch(p: Partial<OnboardingState>) {
    setState((s) => {
      const next = { ...s, ...p }
      saveOnboarding(next)
      return next
    })
  }

  function patchConnector(id: ConnectorId, change: Partial<{ status: "disconnected" | "connecting" | "connected" | "error"; accountLabel?: string }>) {
    setState((s) => {
      const next: OnboardingState = {
        ...s,
        connectors: s.connectors.map((c) =>
          c.id === id
            ? { ...c, ...change, connectedAt: change.status === "connected" ? new Date().toISOString() : c.connectedAt }
            : c,
        ),
      }
      saveOnboarding(next)
      return next
    })
  }

  function startConnect(id: ConnectorId) {
    const def = getConnector(id)
    if (!def) return
    setOauthFor(def)
  }

  function finishConnect(id: ConnectorId, accountLabel: string) {
    patchConnector(id, { status: "connected", accountLabel })
  }

  function disconnect(id: ConnectorId) {
    patchConnector(id, { status: "disconnected", accountLabel: undefined })
  }

  function next() {
    setState((s) => {
      const completedSteps = Array.from(new Set([...(s.completedSteps ?? []), step]))
      const updated = { ...s, completedSteps }
      saveOnboarding(updated)
      return updated
    })
    if (step < STEPS.length - 1) setStep(step + 1)
    else finish()
  }

  function back() {
    if (step > 0) setStep(step - 1)
  }

  function skip() {
    next()
  }

  function finish() {
    const completed: OnboardingState = {
      ...state,
      completed: true,
      completedSteps: STEPS.map((s) => s.id),
    }
    saveOnboarding(completed)
    navigate("/")
  }

  const storeConnectors = CONNECTORS.filter((c) => c.category === "store").map((c) => c.id)
  const adsConnectors = ["google-ads", "meta-ads", "tiktok-ads"] as ConnectorId[]
  const messagingConnectors = ["klaviyo", "hubspot", "slack"] as ConnectorId[]

  const oauthState = oauthFor ? state.connectors.find((c) => c.id === oauthFor.id) : undefined

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Steps rail */}
        <aside className="hidden border-r p-6 lg:block">
          <ol className="space-y-1">
            {STEPS.map((s) => {
              const done = state.completedSteps?.includes(s.id) && step > s.id
              const active = step === s.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                      active && "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : s.id + 1}
                    </span>
                    <span className="min-w-0">
                      <div className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                        {s.title}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{s.description}</div>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        {/* Step body */}
        <div className="flex min-h-0 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-6 py-10">
            <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </div>
            <h1 className="text-2xl font-semibold">{STEPS[step].title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{STEPS[step].description}</p>

            <div className="mt-6 space-y-6">
              {step === 0 && (
                <div className="flex flex-wrap gap-2">
                  {GOAL_CHIPS.map((g) => {
                    const active = state.goals.includes(g)
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          patch({
                            goals: active ? state.goals.filter((x) => x !== g) : [...state.goals, g],
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-foreground bg-muted text-foreground"
                            : "border-input text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {active && <Check className="mr-1 inline h-3 w-3" />}
                        {g}
                      </button>
                    )
                  })}
                </div>
              )}

              {step === 1 && (
                <ConnectorList
                  ids={storeConnectors}
                  state={state}
                  onConnect={startConnect}
                  onDisconnect={disconnect}
                />
              )}

              {step === 2 && (
                <ConnectorList
                  ids={adsConnectors}
                  state={state}
                  onConnect={startConnect}
                  onDisconnect={disconnect}
                />
              )}

              {step === 3 && (
                <ConnectorList
                  ids={messagingConnectors}
                  state={state}
                  onConnect={startConnect}
                  onDisconnect={disconnect}
                />
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="teammate@company.com"
                        value={emailDraft}
                        onChange={(e) => setEmailDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && emailDraft.includes("@")) {
                            patch({ invitedEmails: [...state.invitedEmails, emailDraft] })
                            setEmailDraft("")
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (emailDraft.includes("@")) {
                          patch({ invitedEmails: [...state.invitedEmails, emailDraft] })
                          setEmailDraft("")
                        }
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {state.invitedEmails.length > 0 && (
                    <ul className="space-y-1.5">
                      {state.invitedEmails.map((email) => (
                        <li
                          key={email}
                          className="flex items-center justify-between rounded-md border bg-card px-3 py-1.5 text-sm"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() =>
                              patch({ invitedEmails: state.invitedEmails.filter((e) => e !== email) })
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <div className="flex items-center gap-2">
                {step >= 1 && (
                  <Button variant="ghost" onClick={skip} className="text-muted-foreground">
                    Skip
                  </Button>
                )}
                <Button onClick={next}>
                  {step === STEPS.length - 1 ? "Finish" : "Continue"}
                  {step !== STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OAuthDialog
        def={oauthFor}
        open={!!oauthFor}
        onOpenChange={(o) => {
          if (!o) setOauthFor(null)
        }}
        onAuthorize={(account) => {
          if (oauthFor) finishConnect(oauthFor.id, account)
        }}
      />

      {oauthState?.status === "connecting" && null}
    </div>
  )
}

function ConnectorList({
  ids,
  state,
  onConnect,
  onDisconnect,
}: {
  ids: ConnectorId[]
  state: OnboardingState
  onConnect: (id: ConnectorId) => void
  onDisconnect: (id: ConnectorId) => void
}) {
  return (
    <div className="space-y-2">
      {ids.map((id) => {
        const def = CONNECTORS.find((c) => c.id === id)!
        const st = state.connectors.find((c) => c.id === id) ?? { id, status: "disconnected" as const }
        return (
          <ConnectorCard
            key={id}
            def={def}
            state={st}
            onConnect={() => onConnect(id)}
            onDisconnect={() => onDisconnect(id)}
          />
        )
      })}
    </div>
  )
}
