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
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Layers className="h-3.5 w-3.5" />
          CommerceBase Pro Trial
        </div>
        <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
          Upgrade to keep unlimited skills, connectors, and approvals.
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/4 rounded-full bg-foreground" />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">14 of 14 days remaining</p>
        <Button size="sm" className="mt-2 h-7 w-full text-xs">
          Upgrade
        </Button>
      </div>
    </div>
  )
}
