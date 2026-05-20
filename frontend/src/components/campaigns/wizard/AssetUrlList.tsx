import { useRef, useState } from "react"
import { Plus, Upload, X, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AssetKind = "image" | "video"

export function AssetUrlList({
  label,
  values,
  onChange,
  placeholder = "https://…",
  max,
  kind = "image",
  hint,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  max?: number
  /** Determines the file-picker accept filter and thumbnail rendering. */
  kind?: AssetKind
  /** Optional helper text shown above the list (e.g. "Detected from your site"). */
  hint?: string
}) {
  const [draft, setDraft] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reachedMax = !!(max && values.length >= max)
  const accept = kind === "video" ? "video/*" : "image/*"

  function addUrl() {
    const v = draft.trim()
    if (!v || reachedMax) return
    onChange([...values, v])
    setDraft("")
  }
  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const remaining = max ? max - values.length : files.length
    const toRead = Array.from(files).slice(0, Math.max(0, remaining))
    Promise.all(
      toRead.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(file)
          }),
      ),
    ).then((dataUrls) => {
      onChange([...values, ...dataUrls])
    })
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

      {hint && values.length > 0 && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}

      {values.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {values.map((v, i) => (
            <li
              key={i}
              className="group relative overflow-hidden rounded-md border bg-card"
            >
              <Thumbnail value={v} kind={kind} />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove"
                className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="border-t bg-card px-1.5 py-1 text-[10px] text-muted-foreground">
                <span className="block truncate" title={v}>
                  {v.startsWith("data:") ? "Uploaded file" : new URL(safe(v)).hostname}
                </span>
              </div>
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
              addUrl()
            }
          }}
          placeholder={placeholder}
          className="h-8 flex-1 text-sm"
          disabled={reachedMax}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={addUrl}
          disabled={!draft.trim() || reachedMax}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add URL
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={reachedMax}
          className="gap-1"
          title="Upload from your computer"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={!max || max > 1}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            // Reset so re-selecting the same file fires onChange again.
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}

function Thumbnail({ value, kind }: { value: string; kind: AssetKind }) {
  const isData = value.startsWith("data:")
  const looksValid = isData || /^https?:\/\//.test(value)
  if (!looksValid) {
    return (
      <div className="flex aspect-square items-center justify-center text-muted-foreground">
        <ImageOff className="h-5 w-5" />
      </div>
    )
  }
  if (kind === "video") {
    return (
      <video
        src={value}
        className="aspect-video w-full bg-muted object-cover"
        muted
        playsInline
      />
    )
  }
  return (
    <img
      src={value}
      alt=""
      className="aspect-square w-full bg-muted object-cover"
      onError={(e) => {
        // Replace broken image with an icon background
        ;(e.currentTarget as HTMLImageElement).style.display = "none"
      }}
    />
  )
}

/** Tolerant URL builder for hostname display; falls back to the raw string. */
function safe(u: string): string {
  try {
    return new URL(u).toString()
  } catch {
    return "https://invalid.local"
  }
}
