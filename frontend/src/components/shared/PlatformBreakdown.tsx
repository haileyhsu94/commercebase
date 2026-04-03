import { aiVisibilityData } from "@/lib/mock-data"
import { PlatformLogo } from "@/components/shared/PlatformLogo"

export function PlatformBreakdown() {
  const { platforms } = aiVisibilityData

  return (
    <div className="space-y-3">
      {platforms.map((platform) => (
        <div key={platform.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <PlatformLogo
                name={platform.name}
                shortName={platform.shortName}
                iconSlug={platform.iconSlug}
                color={platform.color}
                size="md"
              />
              <span className="font-medium">{platform.name}</span>
            </div>
            <span className="font-semibold tabular-nums">{platform.score}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${platform.color}`}
              style={{ width: `${platform.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
