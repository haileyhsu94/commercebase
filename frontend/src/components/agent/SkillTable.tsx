import { ChevronDown, Workflow, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type SkillTableStatus = "draft" | "active" | "paused" | "completed" | "ended"

export interface SkillTableRow {
  id: string
  name: string
  status: SkillTableStatus
  createdBy: string
  lastModified: string
  /** When true, the row renders muted and is not clickable (used for templates / coming-soon placeholders). */
  placeholder?: boolean
}

export function SkillTable({
  rows,
  onRowClick,
  icon: Icon = Workflow,
  nameLabel = "Agent",
  emptyText = "No items match your filters.",
}: {
  rows: SkillTableRow[]
  onRowClick: (id: string) => void
  icon?: LucideIcon
  nameLabel?: string
  emptyText?: string
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="py-2.5 pr-2 pl-4 text-left font-medium">{nameLabel}</th>
            <th className="px-2 py-2.5 text-left font-medium">Status</th>
            <th className="px-2 py-2.5 text-left font-medium">Created by</th>
            <th className="py-2.5 pr-4 pl-2 text-left font-medium">Last modified</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={() => !r.placeholder && onRowClick(r.id)}
              className={cn(
                "border-t text-sm",
                !r.placeholder && "cursor-pointer hover:bg-muted/30",
              )}
            >
              <td className="py-2.5 pr-2 pl-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{r.name}</span>
                </div>
              </td>
              <td className="px-2 py-2.5">
                <SkillStatusChip status={r.status} />
              </td>
              <td className="px-2 py-2.5 text-xs text-muted-foreground">{r.createdBy}</td>
              <td className="py-2.5 pr-4 pl-2 text-xs text-muted-foreground">
                {formatRelative(r.lastModified)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkillFilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  )
}

export function SkillStatusChip({ status }: { status: SkillTableStatus }) {
  const meta: Record<SkillTableStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
    },
    paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
    draft: {
      label: "Draft",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
    },
    completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
    ended: { label: "Ended", className: "bg-muted text-muted-foreground" },
  }
  const m = meta[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  )
}

function formatRelative(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
