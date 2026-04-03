import { Link } from "react-router-dom"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SETTINGS_SECTIONS } from "@/pages/settings/settings-sections"

/** Base `TabsTrigger` uses `w-full` when tabs are vertical — that stacks every trigger at 100% width, which hides siblings in a horizontal row. Undo width below `md` so all tabs sit in one scrollable row. */
const triggerClass = cn(
  "max-md:!w-auto max-md:!flex-none max-md:shrink-0",
  "px-3 py-1.5",
  "md:w-full md:justify-start md:px-3 md:py-2",
  /* Tabs root stays `orientation="vertical"` for desktop, so the default indicator is a right-edge bar. Below `md` the list is visually horizontal — use a bottom underline like `orientation="horizontal"` tabs. `!` beats `group-data-[orientation=vertical]/tabs:after:*` from `tabs.tsx`. */
  "max-md:after:!inset-x-0 max-md:after:!top-auto max-md:after:!bottom-[-5px] max-md:after:!right-auto max-md:after:!h-0.5 max-md:after:!w-full"
)

/**
 * Settings nav: horizontal scroll bar on small screens; vertical stack from `md` (with
 * `Tabs` `orientation="vertical"` the shell becomes sidebar | content on desktop).
 */
export function SettingsTabNav() {
  return (
    <TabsList
      variant="line"
      className={cn(
        "!flex-row md:!flex-col",
        "h-auto w-full min-w-0 flex-nowrap justify-start gap-0.5 overflow-x-auto overscroll-x-contain rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "md:h-auto md:min-h-0 md:min-w-[11rem] md:max-w-[15rem] md:shrink-0 md:overflow-visible md:rounded-none md:bg-transparent md:p-1"
      )}
    >
      {SETTINGS_SECTIONS.map((s) => (
        <TabsTrigger
          key={s.id}
          value={s.id}
          className={triggerClass}
          nativeButton={false}
          render={<Link to={s.href} />}
        >
          {s.label}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}
