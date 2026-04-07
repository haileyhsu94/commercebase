import { Link } from "react-router-dom"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCampaignPlanAllowance } from "@/hooks/use-campaign-plan-allowance"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Tighter padding for wizard header area */
  compact?: boolean
  /**
   * `default` — full notice with icon (campaign create).
   * `minimal` — bordered chip; one line + link.
   * `embedded` — full-width strip between card sections (border-t + px).
   * `header` — shadcn `Badge` (secondary) inside a card header column.
   */
  variant?: "default" | "minimal" | "embedded" | "header"
}

export function CampaignPlanAllowanceBanner({ className, compact, variant = "default" }: Props) {
  const a = useCampaignPlanAllowance()
  const n = a.includedPerMonth
  const slotWord = n === 1 ? "campaign" : "campaigns"

  const mainLine =
    n <= 0
      ? `${a.planName} plan — included campaign slots aren’t set in this mock.`
      : a.usedThisMonth <= n
        ? `${a.planName}: ${a.usedThisMonth} of ${n} included ${slotWord} used this month (${a.remainingThisMonth} remaining).`
        : `${a.planName}: all ${n} included ${slotWord} used this month (${a.usedThisMonth - n} beyond included — extra pricing applies).`

  const shortLine =
    n <= 0
      ? "Included slots not set"
      : a.usedThisMonth <= n
        ? `${a.usedThisMonth}/${n} included ${slotWord} this month`
        : `${a.usedThisMonth}/${n} included used · ${a.usedThisMonth - n} beyond plan`

  const billingLink = (
    <Link
      to="/settings?tab=billing"
      className="shrink-0 font-medium text-foreground underline-offset-2 hover:underline"
    >
      View
    </Link>
  )

  const shortBody = (lineClassName?: string) => (
    <>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={cn("min-w-0 text-pretty [text-wrap:pretty]", lineClassName)}>{shortLine}</span>
        <span className="text-muted-foreground/80" aria-hidden>
          ·
        </span>
        {billingLink}
      </div>
      {a.isAtOrOverIncludedLimit && n > 0 && (
        <p className="text-[11px] leading-snug text-muted-foreground">
          Extra campaigns bill per campaign before publish.
        </p>
      )}
    </>
  )

  if (variant === "header") {
    return (
      <Badge
        variant="secondary"
        role="status"
        className={cn(
          "mt-2 h-auto min-h-5 w-full max-w-full flex-col items-stretch gap-1 rounded-md border border-border/60 px-2.5 py-1.5 font-normal leading-snug text-muted-foreground whitespace-normal",
          className
        )}
      >
        {shortBody()}
      </Badge>
    )
  }

  if (variant === "minimal" || variant === "embedded") {
    const isEmbedded = variant === "embedded"
    return (
      <div
        className={cn(
          "flex flex-col gap-1 text-xs leading-tight",
          isEmbedded && "border-t border-border/60 bg-muted/25 px-4 py-2 text-muted-foreground",
          variant === "minimal" &&
            "rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-muted-foreground",
          className
        )}
        role="status"
      >
        {shortBody("text-foreground")}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-muted/40 text-sm text-foreground",
        compact ? "px-3 py-2.5" : "px-4 py-3",
        className
      )}
      role="status"
    >
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 space-y-1.5">
          <p className="leading-snug">{mainLine}</p>
          {a.isAtOrOverIncludedLimit && n > 0 && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Additional campaigns use per-campaign pricing from each campaign&apos;s settings before you
              publish.{" "}
              <Link
                to="/settings?tab=billing"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Billing
              </Link>{" "}
              has your plan details.
            </p>
          )}
          {!a.isAtOrOverIncludedLimit && n > 0 && (
            <p className="text-xs text-muted-foreground">
              <Link
                to="/settings?tab=billing"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                View plan &amp; upgrades
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
