import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  /** Main page title rendered as an h1. */
  title: ReactNode
  /** Supporting description rendered below the title. */
  description?: ReactNode
  /** Action controls placed on the trailing side (buttons, date-range picker, etc.). */
  actions?: ReactNode
  className?: string
}

/**
 * Shared top-of-page header used by standalone pages (Home, Campaigns, Workflows, …).
 *
 * Produces `py-4` vertical rhythm — 16 px top padding, 16 px bottom padding — to match
 * the padding applied by the root `<main>` element (`p-4 pt-0`), giving each page a
 * consistent 16 px gap between the global header and the page title.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {actions}
        </div>
      )}
    </div>
  )
}
