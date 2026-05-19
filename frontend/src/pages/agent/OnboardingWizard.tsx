import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, Globe, Mail, Plus, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CONNECTORS, getConnector } from "@/lib/agent/connectors"
import { getOnboarding, saveOnboarding } from "@/lib/agent/storage"
import type { ConnectorDef, ConnectorId, OnboardingState } from "@/types/agent"
import { ConnectorCard } from "@/components/agent/ConnectorCard"
import { OAuthDialog } from "@/components/agent/OAuthDialog"

const INDUSTRIES = [
  "Apparel & Fashion",
  "Beauty & Personal Care",
  "Home & Lifestyle",
  "Health & Wellness",
  "Food & Beverage",
  "Electronics",
  "Other",
]

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
  { id: 0, title: "Your store", description: "Tell us where to look." },
  { id: 1, title: "Your goals", description: "What should the agent prioritize?" },
  { id: 2, title: "Connect your store", description: "Plug in catalog and orders." },
  { id: 3, title: "Connect ad platforms", description: "Let the agent read performance." },
  { id: 4, title: "Connect CRM & messaging", description: "Email, alerts, and approvals." },
  { id: 5, title: "Invite your team", description: "Optional — you can skip this." },
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

  const storeConnectors = ["shopify", "google-merchant"] as ConnectorId[]
  const adsConnectors = ["google-ads", "meta-ads", "tiktok-ads"] as ConnectorId[]
  const messagingConnectors = ["klaviyo", "hubspot", "slack"] as ConnectorId[]

  const canAdvance = useMemo(() => {
    if (step === 0) return state.storeUrl.trim().length > 3 && state.brandName.trim().length > 0
    return true
  }, [step, state])

  const oauthState = oauthFor ? state.connectors.find((c) => c.id === oauthFor.id) : undefined

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium">Welcome to CommerceBase</span>
        </div>
        <button
          type="button"
          onClick={finish}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Skip onboarding for now
        </button>
      </div>

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
                <div className="space-y-4">
                  <Field label="Store URL" hint="We'll crawl this to learn your catalog and brand voice.">
                    <div className="relative">
                      <Globe className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="realry.com"
                        value={state.storeUrl}
                        onChange={(e) => patch({ storeUrl: e.target.value })}
                      />
                    </div>
                  </Field>
                  <Field label="Brand name">
                    <Input
                      placeholder="Realry"
                      value={state.brandName}
                      onChange={(e) => patch({ brandName: e.target.value })}
                    />
                  </Field>
                  <Field label="Industry">
                    <div className="flex flex-wrap gap-1.5">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => patch({ industry: ind })}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            state.industry === ind
                              ? "border-foreground bg-foreground text-background"
                              : "border-input text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 1 && (
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

              {step === 2 && (
                <ConnectorList
                  ids={storeConnectors}
                  state={state}
                  onConnect={startConnect}
                  onDisconnect={disconnect}
                />
              )}

              {step === 3 && (
                <ConnectorList
                  ids={adsConnectors}
                  state={state}
                  onConnect={startConnect}
                  onDisconnect={disconnect}
                />
              )}

              {step === 4 && (
                <ConnectorList
                  ids={messagingConnectors}
                  state={state}
                  onConnect={startConnect}
                  onDisconnect={disconnect}
                />
              )}

              {step === 5 && (
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
                {step >= 2 && step <= 5 && (
                  <Button variant="ghost" onClick={skip} className="text-muted-foreground">
                    Skip
                  </Button>
                )}
                <Button onClick={next} disabled={!canAdvance}>
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

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </label>
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
