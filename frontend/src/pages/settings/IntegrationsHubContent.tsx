import { useState } from "react"
import { CheckCircle2, Plus, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { simpleIconSvgUrl } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/** Simple Icons slugs — https://simpleicons.org */
const connectedIntegrations = [
  {
    name: "Shopify",
    description: "E-commerce platform",
    status: "connected",
    lastSync: "2 hours ago",
    iconSlug: "shopify",
    fallback: "S",
  },
  {
    name: "Google Merchant Center",
    description: "Product feed management",
    status: "connected",
    lastSync: "1 hour ago",
    /** No dedicated GMC icon in Simple Icons — Google mark reads clearly for feeds/Shopping. */
    iconSlug: "google",
    fallback: "G",
  },
  {
    name: "Google Analytics 4",
    description: "Website analytics",
    status: "connected",
    lastSync: "Real-time",
    iconSlug: "googleanalytics",
    fallback: "GA",
  },
]

const availableIntegrations = [
  {
    name: "Meta Catalog",
    description: "Facebook & Instagram shopping",
    category: "Advertising",
    iconSlug: "meta",
    fallback: "M",
  },
  {
    name: "TikTok Shop",
    description: "TikTok commerce integration",
    category: "Advertising",
    iconSlug: "tiktok",
    fallback: "T",
  },
  {
    name: "WooCommerce",
    description: "WordPress e-commerce",
    category: "E-commerce",
    iconSlug: "woocommerce",
    fallback: "W",
  },
  {
    name: "Klaviyo",
    description: "Email marketing automation",
    category: "Marketing",
    fallback: "K",
  },
  {
    name: "Slack",
    description: "Team notifications",
    category: "Notifications",
    iconSlug: "slack",
    fallback: "S",
  },
  {
    name: "Zapier",
    description: "Workflow automation",
    category: "Automation",
    iconSlug: "zapier",
    fallback: "Z",
  },
]

function IntegrationBrandIcon({
  name,
  iconSlug,
  fallback,
  variant,
}: {
  name: string
  /** Simple Icons slug — omit if no icon in the pinned CDN set (avoids a failed request). */
  iconSlug?: string
  fallback: string
  variant: "connected" | "available"
}) {
  const [failed, setFailed] = useState(false)

  if (!iconSlug || failed) {
    return (
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold",
          variant === "connected"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
        aria-hidden
      >
        {fallback}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-border/60",
        variant === "connected" ? "bg-primary/10" : "bg-muted/50"
      )}
      title={name}
    >
      <img
        src={simpleIconSvgUrl(iconSlug)}
        alt=""
        className="h-6 w-6 object-contain dark:invert"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

/** Shared integrations hub — used in Settings “Integrations” tab and kept in sync with any standalone route. */
export function IntegrationsHubContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Connected</CardTitle>
          <CardDescription>Services currently integrated with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <IntegrationBrandIcon
                    name={integration.name}
                    iconSlug={integration.iconSlug}
                    fallback={integration.fallback}
                    variant="connected"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{integration.name}</p>
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Last sync: {integration.lastSync}
                  </span>
                  <Button variant="ghost" size="icon-sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Available integrations</CardTitle>
          <CardDescription>Connect more services to enhance your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <IntegrationBrandIcon
                    name={integration.name}
                    iconSlug={integration.iconSlug}
                    fallback={integration.fallback}
                    variant="available"
                  />
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-3 w-3" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
