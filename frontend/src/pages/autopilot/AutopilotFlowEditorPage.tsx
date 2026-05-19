import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"
import { ChevronRight, Clock, Code2, Mail, Split, Zap } from "lucide-react"
import type { AutopilotFlow } from "@/lib/autopilot-storage"
import { getFlow, touchFlow } from "@/lib/autopilot-storage"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type FlowStepId = "trigger" | "email" | "branch" | "delay-a" | "email-a" | "delay-b" | "email-b"

const STEP_LABELS: Record<FlowStepId, string> = {
  trigger: "Trigger",
  email: "Send email",
  branch: "Conditional",
  "delay-a": "Delay · true path",
  "email-a": "Send email · true path",
  "delay-b": "Delay · false path",
  "email-b": "Send email · false path",
}

const ROAS_ASSISTANT =
  `This flow watches catalog performance and ROAS across channels. When ROAS dips below your target for 24 hours, CommerceBase moves budget toward better-performing lines and sends your team a summary.

The false path still notifies stakeholders but skips auto-rebalance so you can review manually.

Would you like to activate this flow, or adjust any step first?`

function getAssistantMessage(flow: AutopilotFlow): string {
  switch (flow.templateId) {
    case "roas_rebalance":
      return ROAS_ASSISTANT
    case "catalog_ai_activate":
      return `This automation starts when catalog lines change—Aeris can enrich weak attributes before we push creatives live. Aeris suggests which channels to prioritize based on predicted conversion lift.\n\nAdjust the trigger threshold or enrichment scope on the canvas, or ask me to propose a rollout plan for your SKU mix.`
    case "audience_retarget":
      return `You're building high-intent retargeting. When intent score crosses your threshold, this flow attaches shoppers to your retarget flight and can raise bids where margin allows.\n\nTell me how aggressive you want the bid uplift envelope, or paste a goal ROAS band to validate the branch thresholds.`
    case "competitor_gap_agent":
      return `This path listens for competitor share-of-voice gaps. When firing, it drafts an Auto Agent playbook you can approve before bids or creatives change.\n\nWant tighter guardrails—e.g., only escalate when projected revenue-at-risk crosses a dollar amount? Say the threshold and we'll encode it mock-side.`
    default:
      return `You're shaping "${flow.name}". Use the inspector for the trigger, branch in the canvas, and ask Aeris anytime for concrete recommendations—routing rules, pacing, channel mix.\n\nThis is mock mode: nothing executes until backend Autopilot lands.`
  }
}

function FlowNodeCard({
  title,
  subtitle,
  icon: Icon,
  selected,
  onClick,
  className,
}: {
  title: string
  subtitle?: string
  icon: LucideIcon
  selected?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full max-w-[13.5rem] rounded-lg border bg-card p-3 text-left shadow-sm transition-all outline-none",
        "hover:border-muted-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/50",
        selected ? "border-primary/50 ring-2 ring-primary/25" : "border-border",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/70">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">{title}</p>
          {subtitle ? <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
    </button>
  )
}

function Connector({ tall }: { tall?: boolean }) {
  return (
    <div className="flex flex-col items-center py-0.5" aria-hidden>
      <div className={cn("w-px bg-border", tall ? "h-10" : "h-6")} />
    </div>
  )
}

export function AutopilotFlowEditorPage() {
  const { flowId } = useParams<{ flowId: string }>()
  const navigate = useNavigate()
  const flow = flowId ? getFlow(flowId) : undefined
  const { addMessage, setIsOpen } = useAIAssistant()

  const [activeStep, setActiveStep] = useState<FlowStepId>("trigger")
  const [dirty, setDirty] = useState(false)
  const [triggerType, setTriggerType] = useState("analytics")
  const [eventType, setEventType] = useState("roas_drop")
  const [audienceMode, setAudienceMode] = useState<"segment" | "all">("segment")

  useEffect(() => {
    if (!flowId || !getFlow(flowId)) {
      navigate("/autopilot", { replace: true })
    }
  }, [flowId, navigate])

  useEffect(() => {
    if (!flowId) return
    if (!getFlow(flowId)) return
    setIsOpen(true)
  }, [flowId, setIsOpen])

  useEffect(() => {
    if (!flowId) return
    const f = getFlow(flowId)
    if (!f) return

    try {
      const seedKey = `aeris_autopilot_seed_${flowId}`
      if (sessionStorage.getItem(seedKey)) return
      sessionStorage.setItem(seedKey, "1")
    } catch {
      /* sessionStorage unavailable */
    }

    addMessage(`[Autopilot · ${f.name}]\n\n${getAssistantMessage(f)}`, "assistant")
  }, [flowId, addMessage])

  if (!flowId || !flow) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading flow…
      </div>
    )
  }

  const resolvedFlow = flow
  const flowTitle = resolvedFlow.name

  function markDirty() {
    setDirty(true)
    touchFlow(resolvedFlow.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="shrink-0 border-b border-border/80 bg-background px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <nav className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden />
            <Link to="/autopilot" className="font-medium hover:text-foreground">
              Autopilot
            </Link>
            <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden />
            <span className="truncate text-muted-foreground">{flowTitle}</span>
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              render={<Link to="/autopilot" />}
            >
              All flows
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast.message("Mock only", {
                  description: "Flow activation will run on the backend in a later phase.",
                })
              }
            >
              Activate flow
            </Button>
            <Button variant="outline" size="icon-sm" type="button" title="View as definition (coming soon)">
              <Code2 className="size-4" />
            </Button>
            <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
              {dirty ? "Unsaved changes" : "No changes to save"}
            </Badge>
          </div>
        </div>
        <h1 className="mt-1 truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">{flowTitle}</h1>
        <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
          Use <span className="font-medium text-foreground">Ask Aeris</span> in the header to refine this flow in chat.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border/80 bg-muted/25 lg:w-[min(100%,21rem)] lg:border-r lg:border-b-0">
          <Tabs defaultValue="edit" className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="shrink-0 border-b border-border/80 px-3 pb-3 pt-3 lg:bg-muted/20">
              <TabsList variant="default" className="grid h-auto w-full grid-cols-3 gap-1 rounded-lg p-1">
                <TabsTrigger value="edit" className="px-2 py-2 text-xs sm:text-sm">
                  Edit
                </TabsTrigger>
                <TabsTrigger value="analytics" className="px-2 py-2 text-xs sm:text-sm">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="history" className="px-2 py-2 text-xs sm:text-sm">
                  History
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="edit"
              className="mt-0 min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 text-sm leading-relaxed data-[state=inactive]:hidden"
            >
              <div className="space-y-5">
                <div className="rounded-lg border border-border/70 bg-muted/15 px-3 py-3">
                  <p className="text-xs font-semibold tracking-wide text-foreground">Selected step</p>
                  <p className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-foreground">{STEP_LABELS[activeStep]}</p>
                </div>
                <Separator />
                {activeStep === "trigger" ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="ap-trigger-type">
                        Trigger type
                      </label>
                      <Select value={triggerType} onValueChange={(v) => { setTriggerType(v ?? "analytics"); markDirty() }}>
                        <SelectTrigger id="ap-trigger-type" className="h-9 w-full min-w-0 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analytics">Analytics event</SelectItem>
                          <SelectItem value="catalog">Catalog change</SelectItem>
                          <SelectItem value="schedule">Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="ap-event-type">
                        Event type
                      </label>
                      <Select value={eventType} onValueChange={(v) => { setEventType(v ?? "roas_drop"); markDirty() }}>
                        <SelectTrigger id="ap-event-type" className="h-9 w-full min-w-0 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="roas_drop">ROAS below target (24h)</SelectItem>
                          <SelectItem value="cvr_drop">Conversion rate drop</SelectItem>
                          <SelectItem value="stock_low">Low stock alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Audience</p>
                      <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3.5">
                        <label className="flex cursor-pointer items-start gap-3 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40">
                          <input
                            type="radio"
                            name="aud"
                            className="mt-1 size-4 shrink-0 accent-foreground"
                            checked={audienceMode === "all"}
                            onChange={() => {
                              setAudienceMode("all")
                              markDirty()
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">All eligible products</span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              Run when the event matches any active catalog line.
                            </span>
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40">
                          <input
                            type="radio"
                            name="aud"
                            className="mt-1 size-4 shrink-0 accent-foreground"
                            checked={audienceMode === "segment"}
                            onChange={() => {
                              setAudienceMode("segment")
                              markDirty()
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">Custom segment</span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              Limit to a saved audience or inline filters.
                            </span>
                          </span>
                        </label>
                        {audienceMode === "segment" ? (
                          <div className="mt-3 space-y-2.5 rounded-md border border-dashed border-border bg-background/90 p-3">
                            <p className="text-xs font-semibold text-foreground">Filter (mock)</p>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs leading-relaxed text-muted-foreground">
                              <Badge variant="outline" className="font-normal">
                                Category in Apparel
                              </Badge>
                              <span className="text-muted-foreground">and</span>
                              <Badge variant="outline" className="font-normal">
                                ROAS {'<'} 2.5 (7d)
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 w-full text-xs" type="button">
                              Add filter
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Select a node on the canvas to edit its parameters. This mock focuses on the trigger; other steps use
                    sensible defaults.
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="analytics"
              className="mt-0 min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 text-sm leading-relaxed data-[state=inactive]:hidden"
            >
              <p className="text-sm text-muted-foreground">
                Runs, success rate, and median time-to-action will appear here once Autopilot is wired to real execution data.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">7d runs</p>
                  <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">—</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Success</p>
                  <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">—</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="history"
              className="mt-0 min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 text-sm leading-relaxed data-[state=inactive]:hidden"
            >
              <p className="text-sm text-muted-foreground">
                Version history and audit trail will list saves, activations, and rollbacks.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                <li className="rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5 leading-snug text-muted-foreground">
                  Draft saved · mock · {new Date(resolvedFlow.updatedAt).toLocaleString()}
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </aside>

        <div
          className={cn(
            "relative min-h-0 min-w-0 flex-1 overflow-auto",
            "bg-muted/20 [background-image:radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:20px_20px]"
          )}
        >
          <div className="flex min-h-full min-w-[min(100%,560px)] flex-col items-center px-4 py-8 pb-16">
            <FlowNodeCard
              title="Trigger"
              subtitle="Analytics · ROAS below target (24h)"
              icon={Zap}
              selected={activeStep === "trigger"}
              onClick={() => setActiveStep("trigger")}
            />
            <Connector />
            <FlowNodeCard
              title="Send email"
              subtitle="Notify performance owners"
              icon={Mail}
              selected={activeStep === "email"}
              onClick={() => setActiveStep("email")}
            />
            <Connector tall />
            <FlowNodeCard
              title="Conditional"
              subtitle="ROAS recovered vs. still below floor"
              icon={Split}
              selected={activeStep === "branch"}
              onClick={() => setActiveStep("branch")}
            />
            <Connector tall />

            <div className="flex w-full max-w-xl flex-wrap items-start justify-center gap-6 lg:gap-10">
              <div className="flex flex-col items-center">
                <Badge className="mb-2 bg-emerald-600 text-[10px] font-semibold hover:bg-emerald-600">True</Badge>
                <FlowNodeCard
                  title="Delay"
                  subtitle="Wait 6 hours"
                  icon={Clock}
                  selected={activeStep === "delay-a"}
                  onClick={() => setActiveStep("delay-a")}
                />
                <Connector />
                <FlowNodeCard
                  title="Send email"
                  subtitle="All-clear summary"
                  icon={Mail}
                  selected={activeStep === "email-a"}
                  onClick={() => setActiveStep("email-a")}
                />
              </div>
              <div className="flex flex-col items-center">
                <Badge variant="destructive" className="mb-2 text-[10px] font-semibold">
                  False
                </Badge>
                <FlowNodeCard
                  title="Delay"
                  subtitle="Wait 1 hour"
                  icon={Clock}
                  selected={activeStep === "delay-b"}
                  onClick={() => setActiveStep("delay-b")}
                />
                <Connector />
                <FlowNodeCard
                  title="Send email"
                  subtitle="Rebalance + escalation"
                  icon={Mail}
                  selected={activeStep === "email-b"}
                  onClick={() => setActiveStep("email-b")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="shrink-0 border-t border-border/60 bg-muted/15 px-3 py-1.5 text-center text-[10px] text-muted-foreground lg:hidden">
        Use Ask Aeris in the header on small screens—the canvas and inspector stay below.
      </p>
    </div>
  )
}
