import { Link } from "react-router-dom"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, Area, AreaChart } from "recharts"
import { statsCards, revenueChartData, spendChartData } from "@/lib/mock-data"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
  spend: {
    label: "Spend",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

export function PerformanceOverview() {
  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance overview and insights.
          </p>
        </div>
        <Tabs defaultValue="7d">
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="14d">14 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`flex items-center text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Spend Trend</CardTitle>
            <CardDescription>Daily spend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={spendChartData}>
                <defs>
                  <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="var(--color-chart-2)"
                  fill="url(#fillSpend)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-accent/40" asChild>
          <Link to="/analytics/channels">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Channel Attribution</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Revenue by distribution channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Channels</div>
              <p className="text-sm text-muted-foreground">Shopping leads at 43%</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent/40" asChild>
          <Link to="/analytics/products">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Product Performance</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Top converting products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">523 Products</div>
              <p className="text-sm text-muted-foreground">Nike Air Max leads sales</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent/40" asChild>
          <Link to="/analytics/regions">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Regional Breakdown</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Performance by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Regions</div>
              <p className="text-sm text-muted-foreground">UK leads at $28.8K</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </>
  )
}
