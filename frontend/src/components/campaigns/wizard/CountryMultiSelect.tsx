import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { COUNTRIES } from "@/lib/location-options"

export function CountryMultiSelect({
  value,
  onChange,
  placeholder = "Search countries…",
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  function add(country: string) {
    if (value.includes(country)) return
    onChange([...value, country])
    setQuery("")
  }
  function remove(country: string) {
    onChange(value.filter((c) => c !== country))
  }

  const q = query.trim().toLowerCase()
  const suggestions = q
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(q) && !value.includes(c)).slice(0, 8)
    : []

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-2 py-0.5 text-xs text-background"
            >
              {c}
              <button
                type="button"
                onClick={() => remove(c)}
                aria-label={`Remove ${c}`}
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
            {suggestions.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(c)}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
