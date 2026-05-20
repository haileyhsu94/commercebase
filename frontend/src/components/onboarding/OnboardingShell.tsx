import type { ReactNode } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OnboardingStepMeta {
  id: number
  label: string
}

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { id: 1, label: "Brand" },
  { id: 2, label: "Business" },
  { id: 3, label: "Tools" },
  { id: 4, label: "Billing" },
  { id: 5, label: "First campaign" },
]

interface OnboardingShellProps {
  step: number
  /** Left rail title — short, what this step is about. */
  leftTitle: string
  /** Left rail body copy. */
  leftDescription: string
  /** Optional illustration element above the rail copy. */
  leftIllustration?: ReactNode
  /** Footer slot — typically Back / Continue buttons + secondary links. */
  footer?: ReactNode
  children: ReactNode
}

export function OnboardingShell({
  step,
  leftTitle,
  leftDescription,
  leftIllustration,
  footer,
  children,
}: OnboardingShellProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left rail */}
      <aside className="hidden w-[360px] shrink-0 flex-col justify-between bg-muted/30 p-8 md:flex">
        <div className="flex items-center gap-2">
          <img src="/commercebase-logo.svg" alt="" className="size-6 dark:invert" />
          <span className="text-sm font-semibold">CommerceBase</span>
        </div>
        <div className="space-y-5">
          {leftIllustration && <div>{leftIllustration}</div>}
          <h1 className="text-2xl font-semibold tracking-tight">{leftTitle}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{leftDescription}</p>
        </div>
        <div className="text-[11px] text-muted-foreground">Step {step} of {ONBOARDING_STEPS.length}</div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top stepper */}
        <div className="flex shrink-0 items-center justify-center gap-3 border-b bg-background px-6 py-3 text-sm">
          {ONBOARDING_STEPS.map((s, i) => {
            const done = step > s.id
            const active = step === s.id
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-2 py-1",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded border text-[11px] font-medium",
                      active && "border-foreground bg-foreground text-background",
                      done && "border-emerald-500 bg-emerald-500 text-white",
                      !active && !done && "border-input",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : s.id}
                  </span>
                  <span className={cn("text-sm", active && "font-medium")}>{s.label}</span>
                </div>
                {i < ONBOARDING_STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-background px-6 py-3">
            {footer}
          </div>
        )}
      </main>
    </div>
  )
}
