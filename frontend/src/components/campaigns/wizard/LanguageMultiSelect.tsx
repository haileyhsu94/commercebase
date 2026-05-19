import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LANGUAGE_OPTIONS } from "@/types/campaign-wizard"

export function LanguageMultiSelect({
  value,
  onChange,
  placeholder = "Search languages…",
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const labelByValue = useMemo(() => {
    const m = new Map<string, string>()
    LANGUAGE_OPTIONS.forEach((l) => m.set(l.value, l.label))
    return m
  }, [])

  function add(code: string) {
    if (value.includes(code)) return
    onChange([...value, code])
    setQuery("")
  }
  function remove(code: string) {
    onChange(value.filter((c) => c !== code))
  }

  const q = query.trim().toLowerCase()
  const suggestions = q
    ? LANGUAGE_OPTIONS.filter(
        (l) =>
          (l.label.toLowerCase().includes(q) || l.value.toLowerCase().includes(q)) &&
          !value.includes(l.value),
      ).slice(0, 8)
    : []

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-2 py-0.5 text-xs text-background"
            >
              {labelByValue.get(code) ?? code}
              <button
                type="button"
                onClick={() => remove(code)}
                aria-label={`Remove ${code}`}
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
            {suggestions.map((l) => (
              <li key={l.value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(l.value)}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
