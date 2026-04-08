import { Link } from "react-router-dom"
import { CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const integrations = [
  {
    name: "Shopify",
    status: "connected",
    lastSync: "2 hours ago",
    products: 523,
    synced: 520,
    errors: 3,
  },
  {
    name: "Google Merchant Center",
    status: "connected",
    lastSync: "1 hour ago",
    products: 523,
    synced: 523,
    errors: 0,
  },
  {
    name: "Meta Catalog",
    status: "disconnected",
    lastSync: "Never",
    products: 0,
    synced: 0,
    errors: 0,
  },
]

const recentErrors = [
  {
    product: "Stone Island Jacket",
    productId: "9",
    error: "Missing required field: GTIN",
    time: "2 hours ago",
  },
  {
    product: "Balenciaga Triple S (Black)",
    productId: "11",
    error: "Image URL not accessible",
    time: "3 hours ago",
  },
  {
    product: "Off-White Belt (Industrial)",
    productId: "12",
    error: "Price mismatch with source",
    time: "5 hours ago",
  },
]

export function SyncStatus() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">523</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Synced</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">520</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sync Errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">3</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sync Health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">99.4%</div>
              <Progress value={99.4} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <CardDescription>Connected product feed sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        integration.status === "connected"
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {integration.status === "connected" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <ExternalLink className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last sync: {integration.lastSync}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {integration.status === "connected" ? (
                      <>
                        <p className="text-sm">
                          {integration.synced}/{integration.products} synced
                        </p>
                        {integration.errors > 0 && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            {integration.errors} errors
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Button size="sm">Connect</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <CardDescription>Products with sync issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentErrors.map((error, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/products/${error.productId}`}
                        className="font-medium hover:underline"
                      >
                        {error.product}
                      </Link>
                      <span className="text-xs text-muted-foreground">{error.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{error.error}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Fix
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
