import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

export type SearchOption = { value: string; label: string }

/**
 * Searchable multi-select with chip-style selected items above the input.
 * Generalizes `CountryMultiSelect` so the same interaction can be reused for
 * countries, cities, languages, etc.
 */
export function SearchableMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Search…",
  maxSuggestions = 8,
}: {
  value: string[]
  onChange: (next: string[]) => void
  options: readonly SearchOption[]
  placeholder?: string
  maxSuggestions?: number
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  function add(val: string) {
    if (value.includes(val)) return
    onChange([...value, val])
    setQuery("")
  }
  function remove(val: string) {
    onChange(value.filter((v) => v !== val))
  }

  const q = query.trim().toLowerCase()
  const suggestions = q
    ? options
        .filter((o) => o.label.toLowerCase().includes(q) && !value.includes(o.value))
        .slice(0, maxSuggestions)
    : []

  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-2 py-0.5 text-xs text-background"
            >
              {labelFor(v)}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label={`Remove ${labelFor(v)}`}
                className="hover:opacity-80"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
            {suggestions.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(o.value)}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
