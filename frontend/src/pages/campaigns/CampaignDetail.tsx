import { useEffect, useMemo, useState } from "react"
import { useParams, Link, useSearchParams } from "react-router-dom"
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
import {
  AiPresenceTimeRangeControl,
  defaultAiPresenceTimeRange,
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [editOpen, setEditOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<AiPresenceTimeRange>(defaultAiPresenceTimeRange)

  useEffect(() => {
    if (searchParams.get("edit") !== "1") return
    setEditOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete("edit")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
                <Badge variant={statusVariants[campaign.status]} className={statusClassNames[campaign.status]}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
            </div>
            <AiPresenceTimeRangeControl value={timeRange} onChange={setTimeRange} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
            variant="default"
            onClick={() => setEditOpen(true)}
            aria-label="Open campaign settings"
          >
            <Settings className="mr-2 h-4 w-4" />
            Campaign settings
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
                    <span className="inline-flex items-center">
                      <TrendingUp className="h-3 w-3 mr-0.5" aria-hidden />
                      <span className="sr-only">Up</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <TrendingDown className="h-3 w-3 mr-0.5" aria-hidden />
                      <span className="sr-only">Down</span>
                    </span>
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
              <CardDescription>{formatAiPresencePeriodShort(timeRange)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={revenueChartData}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={10}
                    height={36}
                  />
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
              <CardDescription>{formatAiPresencePeriodShort(timeRange)} · daily bars</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={revenueChartData.slice(-7)}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={10}
                    height={36}
                  />
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
        <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Campaign settings</DialogTitle>
            <DialogDescription>
              Update schedule, budget, targeting, brand identity, and tracking. Changes apply on
              the next sync — running ads keep delivering until then.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-5">
            {/* Basics */}
            <SettingsSection title="Basics" description="Name and overall status of this campaign.">
              <SettingsField label="Campaign name">
                <Input defaultValue={campaign.name} autoComplete="off" />
              </SettingsField>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingsField label="Objective">
                  <Input
                    defaultValue={campaign.wizardSnapshot?.objective ?? campaign.goal ?? ""}
                    placeholder="e.g. Drive discovery"
                  />
                </SettingsField>
                <SettingsField label="Status">
                  <Input defaultValue={campaign.status} disabled />
                </SettingsField>
              </div>
            </SettingsSection>

            {/* Schedule & budget */}
            <SettingsSection
              title="Schedule & budget"
              description="When the campaign runs and how aggressively we spend."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingsField label="Start date">
                  <Input type="date" defaultValue={campaign.wizardSnapshot?.startDate ?? ""} />
                </SettingsField>
                <SettingsField label="End date">
                  <Input type="date" defaultValue={campaign.wizardSnapshot?.endDate ?? ""} />
                </SettingsField>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SettingsField label="Budget type">
                  <Input defaultValue={campaign.wizardSnapshot?.budgetType ?? "daily"} />
                </SettingsField>
                <SettingsField label="Budget amount">
                  <Input
                    defaultValue={campaign.wizardSnapshot?.budget ?? ""}
                    placeholder="500"
                    inputMode="decimal"
                  />
                </SettingsField>
                <SettingsField label="Currency">
                  <Input defaultValue={campaign.wizardSnapshot?.currency ?? "USD"} />
                </SettingsField>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingsField label="Max CPC">
                  <Input
                    defaultValue={campaign.wizardSnapshot?.maxCpc ?? ""}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </SettingsField>
                <SettingsField label="Target CPS">
                  <Input
                    defaultValue={campaign.wizardSnapshot?.maxCps ?? ""}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </SettingsField>
              </div>
            </SettingsSection>

            {/* Targeting */}
            <SettingsSection
              title="Targeting"
              description="Who and where this campaign reaches."
            >
              <SettingsField label="Countries">
                <Input
                  defaultValue={(campaign.wizardSnapshot?.regions ?? []).join(", ")}
                  placeholder="e.g. United States, Canada"
                />
              </SettingsField>
              <SettingsField label="Cities">
                <Input
                  defaultValue={(campaign.wizardSnapshot?.cities ?? []).join(", ")}
                  placeholder="Optional — e.g. New York, Toronto"
                />
              </SettingsField>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingsField label="Languages">
                  <Input
                    defaultValue={(campaign.wizardSnapshot?.languages ?? []).join(", ")}
                    placeholder="en"
                  />
                </SettingsField>
                <SettingsField label="Age bands">
                  <Input
                    defaultValue={(campaign.wizardSnapshot?.ageBands ?? []).join(", ")}
                    placeholder="25-34, 35-44"
                  />
                </SettingsField>
              </div>
            </SettingsSection>

            {/* Brand & creative */}
            <SettingsSection
              title="Brand & creative"
              description="Identity used to render generated ads and product cards."
            >
              <SettingsField label="Business name">
                <Input
                  defaultValue={campaign.wizardSnapshot?.businessName ?? ""}
                  placeholder="Your brand"
                />
              </SettingsField>
              <SettingsField label="Final URL">
                <Input
                  defaultValue={campaign.wizardSnapshot?.finalUrl ?? ""}
                  type="url"
                  placeholder="https://yourbrand.com/landing"
                />
              </SettingsField>
            </SettingsSection>

            {/* Tracking & attribution */}
            <SettingsSection
              title="Tracking & attribution"
              description="How clicks and conversions are stamped and credited."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingsField label="Attribution model">
                  <Input
                    defaultValue={campaign.wizardSnapshot?.attributionModel ?? "data_driven"}
                  />
                </SettingsField>
                <SettingsField label="Bidding focus">
                  <Input
                    defaultValue={campaign.wizardSnapshot?.biddingFocus ?? "conversions"}
                  />
                </SettingsField>
              </div>
              <SettingsField label="UTM prefix">
                <Input
                  defaultValue={campaign.wizardSnapshot?.utmPrefix ?? ""}
                  placeholder="ss26_launch_"
                />
              </SettingsField>
              <SettingsField label="Tracking template">
                <Input
                  defaultValue={campaign.wizardSnapshot?.trackingTemplate ?? ""}
                  placeholder="{lpurl}?utm_source={network}&utm_medium=cpc"
                />
              </SettingsField>
            </SettingsSection>
          </div>

          <DialogFooter className="sticky bottom-0 gap-2 border-t bg-background px-6 py-3">
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

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <header>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function SettingsField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}
