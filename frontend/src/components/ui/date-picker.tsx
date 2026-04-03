"use client"

import * as React from "react"
import { format, parse, isValid, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/** Parse `yyyy-MM-dd` from form state; returns local midnight for valid strings. */
export function parseIsoDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = parse(s, "yyyy-MM-dd", new Date())
  return isValid(d) ? startOfDay(d) : undefined
}

export type DatePickerFieldProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  className?: string
  /** Days before this (local) are disabled */
  minDate?: Date
  /** Days after this (local) are disabled */
  maxDate?: Date
}

export function DatePickerField({
  value,
  onChange,
  id,
  placeholder = "Pick a date",
  className,
  minDate,
  maxDate,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseIsoDateString(value)

  const disabled: Matcher | Matcher[] | undefined = React.useMemo(() => {
    const matchers: Matcher[] = []
    if (minDate) matchers.push({ before: minDate })
    if (maxDate) matchers.push({ after: maxDate })
    if (matchers.length === 0) return undefined
    if (matchers.length === 1) return matchers[0]
    return matchers
  }, [minDate, maxDate])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-8 w-full min-w-0 justify-start px-2.5 py-1 text-left text-base font-normal md:text-sm",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 size-4 shrink-0 opacity-50" aria-hidden />
        {selected ? (
          format(selected, "PPP")
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          disabled={disabled}
          defaultMonth={selected ?? minDate ?? maxDate ?? new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
