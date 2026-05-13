import { Check, Loader2 } from "lucide-react"
import type { ConnectorDef, ConnectorState } from "@/types/agent"
import { cn } from "@/lib/utils"

interface Props {
  def: ConnectorDef
  state: ConnectorState
  onConnect: () => void
  onDisconnect?: () => void
  size?: "sm" | "md"
}

export function ConnectorCard({ def, state, onConnect, onDisconnect, size = "md" }: Props) {
  const connected = state.status === "connected"
  const connecting = state.status === "connecting"
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card transition-colors",
        size === "sm" ? "p-2.5" : "p-3",
        connected ? "border-emerald-300/60 bg-emerald-50/30 dark:border-emerald-500/30 dark:bg-emerald-950/20" : "",
      )}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white"
        style={{ backgroundColor: def.brandColor }}
      >
        {def.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{def.name}</span>
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Check className="h-3 w-3" /> Connected
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {connected && state.accountLabel ? state.accountLabel : def.description}
        </p>
      </div>
      {connected ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Disconnect
        </button>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          disabled={connecting}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
        >
          {connecting && <Loader2 className="h-3 w-3 animate-spin" />}
          {connecting ? "Connecting…" : "Connect"}
        </button>
      )}
    </div>
  )
}
