import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Play, Pause, Settings, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import { getMergedCampaigns } from "@/lib/campaign-storage"
import { channelPerformance, revenueChartData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const statusVariants = {
  active: "outline",
  paused: "outline",
  draft: "outline",
  ended: "destructive",
} as const

const statusClassNames = {
  active: "text-green-600 border-green-600",
  paused: "text-amber-600 border-amber-600",
  draft: "",
  ended: "",
} as const

export function CampaignDetail() {
  const { id } = useParams()
  const [editOpen, setEditOpen] = useState(false)

  const campaign = useMemo(() => {
    const list = getMergedCampaigns()
    return list.find((c) => c.id === id) ?? list[0]
  }, [id])

  const metrics = [
    { label: "Spent", value: campaign.spent, change: "+12%", trend: "up" },
    { label: "Revenue", value: campaign.revenue, change: "+18%", trend: "up" },
    { label: "CPC", value: campaign.cpc, change: "-4%", trend: "up" },
    { label: "CPS", value: campaign.cps, change: "-2%", trend: "up" },
    { label: "CVR", value: campaign.cvr, change: "-0.1%", trend: "down" },
    { label: "ROAS", value: campaign.roas, change: "+5%", trend: "up" },
  ]

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Link
          to="/campaigns"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label="Back to campaigns"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
            <Badge variant={statusVariants[campaign.status]} className={statusClassNames[campaign.status]}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Campaign ID: {campaign.id}</p>
        </div>
        <div className="flex gap-2">
          {campaign.status === "active" ? (
            <Button variant="outline">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditOpen(true)}
            aria-label="Edit campaign settings"
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
              <CardDescription>Last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={revenueChartData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Performance</CardTitle>
              <CardDescription>Revenue by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={revenueChartData.slice(-7)}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Channel Performance</CardTitle>
            <CardDescription>Revenue attribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {channelPerformance.map((channel) => (
                <div key={channel.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{channel.revenue}</p>
                      <p className="text-sm text-muted-foreground">{channel.roas} ROAS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${channel.share}%` }}
                      />
                    </div>
                    <span className="w-10 text-xs text-muted-foreground">{channel.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <CardDescription>Performance for products in this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="py-6 text-center text-sm text-muted-foreground">
              Product performance data will be shown here.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit campaign</DialogTitle>
            <DialogDescription>
              Update name, budget, and targeting. In production this would save to your backend.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label htmlFor="campaign-edit-name" className="text-sm font-medium">
                Campaign name
              </label>
              <Input id="campaign-edit-name" defaultValue={campaign.name} autoComplete="off" />
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign-edit-budget" className="text-sm font-medium">
                Daily budget
              </label>
              <Input id="campaign-edit-budget" placeholder="$0.00" type="text" autoComplete="off" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setEditOpen(false)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
