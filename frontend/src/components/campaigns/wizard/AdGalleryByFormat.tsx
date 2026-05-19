import { AdPreview } from "@/components/campaigns/AdPreview"

/**
 * Format-based ad gallery — channel-agnostic by design (we don't surface
 * channel allocation to users). Renders one AdPreview per supported aspect
 * ratio so the user sees what their creative looks like in each shape.
 */
export function AdGalleryByFormat({
  headline,
  headlineSecondary,
  description,
  imageUrl,
  videoUrl,
  domainLabel,
}: {
  headline?: string
  headlineSecondary?: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  domainLabel?: string
}) {
  const formats: { aspect: string; label: string; isVideo?: boolean }[] = [
    { aspect: "1.91:1", label: "Landscape" },
    { aspect: "1:1", label: "Square" },
    { aspect: "9:16", label: "Vertical" },
    { aspect: "16:9", label: "Horizontal video", isVideo: true },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {formats.map((f) => (
        <div key={f.aspect} className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{f.label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
              {f.aspect}
            </span>
          </div>
          {f.isVideo ? (
            <VideoPlaceholder videoUrl={videoUrl} />
          ) : (
            <AdPreview
              headline={headline}
              headlineSecondary={headlineSecondary}
              description={description}
              imageUrl={imageUrl}
              aspectRatioValue={f.aspect}
              domainLabel={domainLabel}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function VideoPlaceholder({ videoUrl }: { videoUrl?: string }) {
  return (
    <div className="rounded-xl bg-muted/30 p-4">
      <p className="text-xs font-medium text-muted-foreground">Video preview</p>
      <p className="mb-3 text-[10px] text-muted-foreground">
        Horizontal 16:9 — feed & in-stream placements
      </p>
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-card">
        <div className="relative aspect-video w-full bg-muted">
          {videoUrl ? (
            <video src={videoUrl} className="h-full w-full object-cover" controls />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Upload a video to preview
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
