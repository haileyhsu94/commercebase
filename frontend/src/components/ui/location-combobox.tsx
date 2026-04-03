import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { withOrphanOption } from "@/lib/location-options"

const inputGroupClass = cn(
  "flex h-8 w-full min-w-0 items-center gap-0.5 rounded-lg border border-input bg-transparent pr-1 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none",
  "has-[[data-slot=combobox-input]:focus-visible]:border-ring has-[[data-slot=combobox-input]:focus-visible]:ring-[3px] has-[[data-slot=combobox-input]:focus-visible]:ring-ring/50",
  "dark:bg-input/30"
)

const inputClass = cn(
  "min-w-0 flex-1 border-0 bg-transparent py-1 text-base outline-none md:text-sm",
  "placeholder:text-muted-foreground"
)

const popupClass = cn(
  "z-50 max-h-60 min-w-[var(--anchor-width)] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10",
  "origin-[var(--transform-origin)]"
)

const itemClass = cn(
  "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
  "data-highlighted:bg-accent data-highlighted:text-accent-foreground"
)

export type LocationComboboxProps = {
  id: string
  /** Accessible name for the input (use with an external visible <label htmlFor={id}>). */
  ariaLabel: string
  options: readonly string[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function LocationCombobox({
  id,
  ariaLabel,
  options,
  value,
  onValueChange,
  placeholder = "Type to search…",
  disabled,
}: LocationComboboxProps) {
  const items = React.useMemo(() => withOrphanOption(options, value), [options, value])

  return (
    <Combobox.Root
      items={items}
      value={value || null}
      onValueChange={(v: string | null) => onValueChange(typeof v === "string" ? v : "")}
      autoHighlight
      disabled={disabled}
    >
      <Combobox.InputGroup className={inputGroupClass}>
        <Combobox.Input
          id={id}
          data-slot="combobox-input"
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={inputClass}
        />
        <Combobox.Trigger
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Open ${ariaLabel} options`}
        >
          <ChevronDown className="size-4" />
        </Combobox.Trigger>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="outline-none">
          <Combobox.Popup className={popupClass}>
            <Combobox.List className="max-h-56 overflow-y-auto p-0 outline-none">
              {(item: string) => (
                <Combobox.Item key={item} value={item} className={itemClass}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
            <Combobox.Empty className="px-2 py-3 text-center text-xs text-muted-foreground">
              No match. Keep typing to filter the list.
            </Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
