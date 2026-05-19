import { useState } from "react"
import { format, parse, isValid, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function parseIso(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = parse(s, "yyyy-MM-dd", new Date())
  return isValid(d) ? startOfDay(d) : undefined
}
function toIso(d?: Date): string {
  return d ? format(d, "yyyy-MM-dd") : ""
}

export function DateRangePicker({
  start,
  end,
  onChange,
  placeholder = "Select date range",
  className,
}: {
  start: string
  end: string
  onChange: (next: { start: string; end: string }) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const from = parseIso(start)
  const to = parseIso(end)
  const selected: DateRange | undefined = from || to ? { from, to } : undefined

  const label =
    from && to
      ? `${format(from, "MMM d, yyyy")} → ${format(to, "MMM d, yyyy")}`
      : from
        ? `${format(from, "MMM d, yyyy")} → …`
        : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-8 w-full min-w-0 justify-start px-2.5 py-1 text-left text-sm font-normal",
              !from && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 size-4 shrink-0 opacity-50" aria-hidden />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onSelect={(range) => {
            const next = {
              start: toIso(range?.from),
              end: toIso(range?.to),
            }
            onChange(next)
            if (range?.from && range?.to) setOpen(false)
          }}
          defaultMonth={from ?? new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
