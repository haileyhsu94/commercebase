import { useEffect, useRef, useState } from "react"
import { ChevronsUpDown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { COUNTRIES } from "@/lib/location-options"
import { cn } from "@/lib/utils"

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  className,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onDocDown)
    return () => document.removeEventListener("mousedown", onDocDown)
  }, [open])

  const q = query.trim().toLowerCase()
  const suggestions = q
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 10)
    : COUNTRIES.slice(0, 12)

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-left text-sm"
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-accent"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          <div className="relative border-b">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="h-9 rounded-none border-0 pl-8 text-sm focus-visible:ring-0"
              autoFocus
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {suggestions.length === 0 && (
              <li className="px-3 py-1.5 text-xs text-muted-foreground">No matches</li>
            )}
            {suggestions.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c)
                    setOpen(false)
                    setQuery("")
                  }}
                  className={cn(
                    "block w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    value === c && "bg-accent/60",
                  )}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
