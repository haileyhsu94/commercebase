import { useEffect, useState } from "react"
import { ChevronDown, MessageSquare, ShoppingBag, Share2, Users } from "lucide-react"
import { ConnectorCard } from "@/components/agent/ConnectorCard"
import { CONNECTORS } from "@/lib/agent/connectors"
import type { ConnectorDef, ConnectorState } from "@/types/agent"
import { cn } from "@/lib/utils"

/** Shared storage key — same as `StepConnectTools` so onboarding ↔ settings stay in sync. */
const STORAGE_KEY = "commercebase_onboarding_connectors_v1"

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

/**
 * Settings → Integrations tab. Mirrors the onboarding "Connect your tools" step
 * (same data + UI) so users see a consistent list whether they're onboarding or
 * managing connections later.
 */
export function IntegrationsHubContent() {
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

  const store = CONNECTORS.filter((c) => c.category === "store")
  const messaging = CONNECTORS.filter((c) => c.category === "messaging")
  const social = CONNECTORS.filter((c) => c.category === "social")
  const crm = CONNECTORS.filter((c) => c.category === "crm")

  const connectedCount = Object.values(states).filter((s) => s.status === "connected").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <span className="text-xs text-muted-foreground tabular-nums">
          {connectedCount} connected
        </span>
      </div>

      {/* Store — the most important integrations */}
      <Group
        icon={<ShoppingBag className="h-3.5 w-3.5" />}
        title="Store & catalog"
        subtitle="Connect a product feed to start running campaigns."
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

      {/* Messaging */}
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
        icon={<Share2 className="h-3.5 w-3.5" />}
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
