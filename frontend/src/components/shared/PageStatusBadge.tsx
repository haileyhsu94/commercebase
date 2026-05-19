import { cn } from "@/lib/utils"

export type PageStatus = "demo" | "working" | "live"

interface PageStatusBadgeProps {
  status: PageStatus
  className?: string
}

const CONFIG: Record<PageStatus, { label: string; classes: string; title: string }> = {
  demo: {
    label: "DEMO",
    classes: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    title: "Mock data only — not wired to backend yet",
  },
  working: {
    label: "WORKING",
    classes: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
    title: "Partially wired — API connected but some fields still use mock data",
  },
  live: {
    label: "LIVE",
    classes: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    title: "Real data from production APIs",
  },
}

export function PageStatusBadge({ status, className }: PageStatusBadgeProps) {
  const { label, classes, title } = CONFIG[status]
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
        classes,
        className
      )}
    >
      {label}
    </span>
  )
}
