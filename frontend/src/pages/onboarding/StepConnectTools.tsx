import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, ChevronDown, MessageSquare, Plug, ShoppingBag, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OnboardingShell } from "@/components/onboarding/OnboardingShell"
import { ConnectorCard } from "@/components/agent/ConnectorCard"
import { CONNECTORS } from "@/lib/agent/connectors"
import type { ConnectorDef, ConnectorState } from "@/types/agent"
import { saveOnboarding } from "@/lib/onboarding-storage"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "commercebase_onboarding_connectors_v1"

interface Props {
  onContinue: () => void
  onBack: () => void
}

function loadStates(): Record<string, ConnectorState> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, ConnectorState>
  } catch {
    return {}
  }
}
function saveStates(s: Record<string, ConnectorState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function StepConnectTools({ onContinue, onBack }: Props) {
  const [states, setStates] = useState<Record<string, ConnectorState>>(loadStates)

  useEffect(() => {
    saveStates(states)
  }, [states])

  function setStatus(def: ConnectorDef, status: ConnectorState["status"], accountLabel?: string) {
    setStates((prev) => ({
      ...prev,
      [def.id]: {
        id: def.id,
        status,
        accountLabel,
        connectedAt: status === "connected" ? new Date().toISOString() : prev[def.id]?.connectedAt,
      },
    }))
  }

  function connect(def: ConnectorDef) {
    setStatus(def, "connecting")
    // Mock OAuth round-trip
    setTimeout(() => setStatus(def, "connected", `${def.name} (demo workspace)`), 600)
  }
  function disconnect(def: ConnectorDef) {
    setStatus(def, "disconnected")
  }

  function getState(def: ConnectorDef): ConnectorState {
    return states[def.id] ?? { id: def.id, status: "disconnected" }
  }

  function handleContinue() {
    saveOnboarding({ step: 4 })
    onContinue()
  }

  const store = CONNECTORS.filter((c) => c.category === "store")
  const messaging = CONNECTORS.filter((c) => c.category === "messaging")
  const social = CONNECTORS.filter((c) => c.category === "social")
  const crm = CONNECTORS.filter((c) => c.category === "crm")

  return (
    <OnboardingShell
      step={3}
      leftTitle="Connect your tools"
      leftDescription="Integrations make CommerceBase more powerful. Connect your stack now or come back to it later from Settings — none of these are required to launch your first campaign."
      leftIllustration={
        <div className="flex h-32 items-center justify-center rounded-2xl border bg-card">
          <Plug className="h-10 w-10 text-muted-foreground" />
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Skip for now
            </button>
            <Button size="sm" onClick={handleContinue} className="gap-1.5">
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      }
    >
      <div className="mx-auto w-full max-w-2xl space-y-5 p-8">
        <header>
          <h2 className="text-2xl font-semibold">Connect your tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Integrations make CommerceBase more powerful. You can always add more later.
          </p>
        </header>

        {/* Store — the most important integrations */}
        <Group
          icon={<ShoppingBag className="h-3.5 w-3.5" />}
          title="Store & catalog"
          subtitle="The most important integration — we need a product feed to start running campaigns."
          defaultOpen
        >
          {store.map((def) => (
            <ConnectorCard
              key={def.id}
              def={def}
              state={getState(def)}
              onConnect={() => connect(def)}
              onDisconnect={() => disconnect(def)}
            />
          ))}
        </Group>

        {/* Messaging — always expanded, single tool */}
        <Group
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          title="Messaging"
          subtitle="Chat with your AI marketing agent directly from Slack."
          defaultOpen
        >
          {messaging.map((def) => (
            <ConnectorCard
              key={def.id}
              def={def}
              state={getState(def)}
              onConnect={() => connect(def)}
              onDisconnect={() => disconnect(def)}
            />
          ))}
        </Group>

        {/* Social */}
        <Group
          title="Social accounts"
          subtitle="Publish posts on your behalf, fully automated or with your approval."
          defaultOpen={false}
        >
          {social.map((def) => (
            <ConnectorCard
              key={def.id}
              def={def}
              state={getState(def)}
              onConnect={() => connect(def)}
              onDisconnect={() => disconnect(def)}
            />
          ))}
        </Group>

        {/* CRM — next phase */}
        <Group
          icon={<Users className="h-3.5 w-3.5" />}
          title="CRM integration"
          subtitle="Sync contacts bidirectionally and let the AI enrich leads with marketing data."
          defaultOpen={false}
          badge="Next phase"
          disabled
        >
          {crm.map((def) => (
            <ConnectorCard
              key={def.id}
              def={def}
              state={getState(def)}
              onConnect={() => connect(def)}
              onDisconnect={() => disconnect(def)}
            />
          ))}
        </Group>
      </div>
    </OnboardingShell>
  )
}

function Group({
  icon,
  title,
  subtitle,
  defaultOpen,
  badge,
  disabled,
  children,
}: {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  defaultOpen: boolean
  badge?: string
  /** When true, the section can't be expanded and the body is rendered with reduced opacity. */
  disabled?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen && !disabled)
  return (
    <section className={cn("rounded-xl border bg-card", disabled && "bg-muted/30")}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-3 p-4 text-left",
          disabled && "cursor-not-allowed",
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {icon}
            {title}
            {badge && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {!disabled && (
          <ChevronDown
            className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        )}
      </button>
      {open && !disabled && <div className="space-y-2 border-t p-4">{children}</div>}
    </section>
  )
}
