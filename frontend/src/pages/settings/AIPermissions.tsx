import { Link } from "react-router-dom"
import { ArrowLeft, Eye, Megaphone, DollarSign, Package, Users, Shield, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const permissions = [
  {
    id: "view",
    name: "View Data",
    description: "Access campaign performance, analytics, and product data",
    icon: Eye,
    enabled: true,
    required: true,
  },
  {
    id: "campaigns",
    name: "Manage Campaigns",
    description: "Create, edit, pause, and resume campaigns",
    icon: Megaphone,
    enabled: true,
    required: false,
  },
  {
    id: "budgets",
    name: "Adjust Budgets",
    description: "Modify campaign budgets and spending limits",
    icon: DollarSign,
    enabled: false,
    required: false,
  },
  {
    id: "catalog",
    name: "Modify Catalog",
    description: "Edit product information and descriptions",
    icon: Package,
    enabled: false,
    required: false,
  },
  {
    id: "publishers",
    name: "Manage Publishers",
    description: "Add or remove publishers from campaigns",
    icon: Users,
    enabled: false,
    required: false,
  },
]

const recentActions = [
  { action: "Paused FW26 Collection", time: "2 hours ago", permission: "campaigns" },
  { action: "Increased Sneakers Q2 budget", time: "1 day ago", permission: "budgets" },
  { action: "Generated performance report", time: "2 days ago", permission: "view" },
]

export function AIPermissions() {
  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Assistant Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Control what the AI assistant can do on your behalf.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              <CardDescription>
                Enable or disable AI capabilities. Some actions may require confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-2 ${permission.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <permission.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{permission.name}</p>
                          {permission.required && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                    <Switch 
                      defaultChecked={permission.enabled} 
                      disabled={permission.required}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Confirmation Settings</CardTitle>
              <CardDescription>
                When should the AI ask for confirmation?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Always confirm before taking action", description: "Ask every time" },
                  { label: "Confirm budget changes over $100", description: "Threshold for budget alerts" },
                  { label: "Confirm campaign status changes", description: "Pause, resume, end campaigns" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Security Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Sensitive Actions</p>
                  <p className="text-amber-700">
                    Budget and catalog modifications are logged and reversible within 24 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent AI Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Shield className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-muted-foreground">{action.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Full History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
