import { cn } from "@/lib/utils"
import { IMAGE_ASPECT_RATIOS } from "@/types/campaign-wizard"

type AdPreviewProps = {
  headline?: string
  headlineSecondary?: string
  description?: string
  imageUrl?: string
  aspectRatioValue?: string
  domainLabel?: string
}

export function AdPreview({
  headline,
  headlineSecondary,
  description,
  imageUrl,
  aspectRatioValue,
  domainLabel,
}: AdPreviewProps) {
  const ratioMeta = IMAGE_ASPECT_RATIOS.find((r) => r.value === aspectRatioValue) ?? IMAGE_ASPECT_RATIOS[0]

  const imageBoxClass = cn(
    "relative w-full overflow-hidden bg-muted",
    aspectRatioValue === "9:16" && "aspect-[9/16] max-h-[320px]",
    aspectRatioValue === "4:5" && "aspect-[4/5]",
    aspectRatioValue === "1:1" && "aspect-square",
    (aspectRatioValue === "1.91:1" || !aspectRatioValue) && "aspect-[1.91/1]"
  )

  return (
    <div className="rounded-xl bg-muted/30 p-4">
      <p className="text-xs font-medium text-muted-foreground">Ad preview</p>
      <p className="mb-3 text-[10px] text-muted-foreground">
        {ratioMeta.label} — {ratioMeta.description}
      </p>
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-card">
        <div className={imageBoxClass}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[100px] w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              Creative image
            </div>
          )}
        </div>
        <div className="space-y-1 p-3">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {domainLabel ?? "yourbrand.com"}
          </span>
          <p className="line-clamp-2 font-semibold leading-snug">
            {headline?.trim() || "Primary headline"}
          </p>
          {headlineSecondary?.trim() ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{headlineSecondary}</p>
          ) : null}
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {description?.trim() || "Description text appears here."}
          </p>
        </div>
      </div>
    </div>
  )
}
