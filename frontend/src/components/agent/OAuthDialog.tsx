import { useEffect, useState } from "react"
import { Check, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ConnectorDef } from "@/types/agent"

interface Props {
  def: ConnectorDef | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthorize: (accountLabel: string) => void
}

const MOCK_ACCOUNTS: Record<string, string[]> = {
  shopify: ["realry.myshopify.com", "realry-staging.myshopify.com"],
  "google-merchant": ["Realry Merchant Center (#123-456-7890)"],
  "google-ads": ["Realry Ads (#891-234-5670)", "Realry Brand Search (#891-998-1100)"],
  "meta-ads": ["Realry Business Manager", "Hailey's Personal Ads"],
  "tiktok-ads": ["Realry TikTok Ads Manager"],
  klaviyo: ["Realry — Production", "Realry — Staging"],
  hubspot: ["Realry Marketing Hub"],
  slack: ["realry.slack.com"],
}

export function OAuthDialog({ def, open, onOpenChange, onAuthorize }: Props) {
  const [stage, setStage] = useState<"consent" | "authorizing" | "redirecting">("consent")
  const [selected, setSelected] = useState<string>("")

  useEffect(() => {
    if (open && def) {
      setStage("consent")
      setSelected(MOCK_ACCOUNTS[def.id]?.[0] ?? `${def.name} account`)
    }
  }, [open, def])

  if (!def) return null

  const accounts = MOCK_ACCOUNTS[def.id] ?? [`${def.name} account`]

  function authorize() {
    setStage("authorizing")
    setTimeout(() => {
      setStage("redirecting")
      setTimeout(() => {
        onAuthorize(selected)
        onOpenChange(false)
      }, 600)
    }, 900)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg text-base font-semibold text-white" style={{ backgroundColor: def.brandColor }}>
              {def.name.slice(0, 1)}
            </div>
            <div className="text-muted-foreground">↔</div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-base font-semibold text-background">
              C
            </div>
          </div>
          <DialogTitle className="text-base">
            Connect {def.name} to CommerceBase
          </DialogTitle>
          <DialogDescription className="text-xs">
            CommerceBase is requesting access to your {def.name} account.
          </DialogDescription>
        </DialogHeader>

        {stage === "consent" && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/40 p-3 text-xs">
              <div className="mb-1.5 font-medium text-foreground">CommerceBase will be able to:</div>
              <ul className="space-y-1 text-muted-foreground">
                {def.scopes.map((scope) => (
                  <li key={scope} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    <span className="font-mono text-[11px]">{scope}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Account</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {accounts.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-start gap-1.5 rounded-md border border-blue-200/70 bg-blue-50/60 p-2 text-[11px] text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/30 dark:text-blue-100">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
              <span>You can revoke access anytime in Settings → Integrations.</span>
            </div>
          </div>
        )}

        {stage === "authorizing" && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <span className="size-3 animate-pulse rounded-full" style={{ backgroundColor: def.brandColor }} />
            Authorizing with {def.name}…
          </div>
        )}

        {stage === "redirecting" && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-emerald-700 dark:text-emerald-300">
            <Check className="h-4 w-4" />
            Authorized — returning to CommerceBase…
          </div>
        )}

        {stage === "consent" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={authorize}>Allow access</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
