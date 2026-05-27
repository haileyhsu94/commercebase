import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SidebarTrialCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[14px] opacity-60 blur-md"
        style={{
          background:
            "linear-gradient(110deg, rgba(251,146,60,0.4) 0%, rgba(244,114,182,0.2) 50%, rgba(45,212,191,0.4) 100%)",
        }}
      />
      <div className="relative rounded-lg border bg-muted/30 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            CommerceBase Pro
          </div>
          <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Coming soon
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-tight text-muted-foreground">
          Plans &amp; billing are coming soon — everything's unlocked while we're in preview.
        </p>
        <Button size="sm" disabled className="mt-2 h-7 w-full text-xs">
          Upgrade — coming soon
        </Button>
      </div>
    </div>
  )
}
