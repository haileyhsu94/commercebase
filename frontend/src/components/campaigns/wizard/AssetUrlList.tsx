import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AssetUrlList({
  label,
  values,
  onChange,
  placeholder = "https://…",
  max,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  max?: number
}) {
  const [draft, setDraft] = useState("")

  function add() {
    const v = draft.trim()
    if (!v) return
    if (max && values.length >= max) return
    onChange([...values, v])
    setDraft("")
  }
  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        {max && (
          <span className="text-[11px] text-muted-foreground">
            {values.length}/{max}
          </span>
        )}
      </div>
      {values.length > 0 && (
        <ul className="space-y-1.5">
          {values.map((v, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-xs"
            >
              <span className="min-w-0 flex-1 truncate" title={v}>
                {v}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="h-8 flex-1 text-sm"
          disabled={max ? values.length >= max : false}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={add}
          disabled={!draft.trim() || (max ? values.length >= max : false)}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  )
}
