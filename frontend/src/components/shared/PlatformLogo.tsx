import { useState } from "react"
import { simpleIconSvgUrl } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type PlatformLogoProps = {
  name: string
  shortName: string
  iconSlug: string
  /** Tailwind bg-* class for letter fallback (matches progress bar color) */
  color: string
  size?: "sm" | "md"
}

export function PlatformLogo({ name, shortName, iconSlug, color, size = "md" }: PlatformLogoProps) {
  const [failed, setFailed] = useState(false)

  const box =
    size === "sm"
      ? "h-5 w-5 rounded text-[10px]"
      : "h-6 w-6 rounded-md text-xs"
  const imgClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  if (failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center font-bold text-white",
          color,
          box
        )}
        aria-hidden
      >
        {shortName}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-muted/50 ring-1 ring-border/60",
        box
      )}
      title={name}
    >
      <img
        src={simpleIconSvgUrl(iconSlug)}
        alt=""
        className={cn(imgClass, "object-contain dark:invert")}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
