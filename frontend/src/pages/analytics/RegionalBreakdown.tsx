import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOutletContext } from "react-router-dom"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"
import { useMemo } from "react"
import { daysFromAiPresenceTimeRange } from "@/lib/home-range-metrics"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { regionData } from "@/lib/mock-data"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function RegionalBreakdown() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const days = daysFromAiPresenceTimeRange(timeRange)

  const activeData = useMemo(() => {
    const factor = 0.6 + days / 60
    return regionData.map((r) => ({
      ...r,
      revenue: `$${(parseFloat(r.revenue.replace(/[$,K]/g, "")) * factor).toFixed(1)}K`,
    }))
  }, [days])

  const totalRevenue = useMemo(() => activeData.reduce(
    (sum, r) => sum + parseFloat(r.revenue.replace(/[$,K]/g, "")) * 1000,
    0
  ), [activeData])

  const chartData = useMemo(() => activeData.map((r) => ({
    name: r.name.split(" ")[0],
    revenue: parseFloat(r.revenue.replace(/[$,K]/g, "")) * 1000,
  })), [activeData])

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue by Region</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Regional Share</CardTitle>
            <CardDescription>Distribution of revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeData.map((region) => {
                const share = (parseFloat(region.revenue.replace(/[$,K]/g, "")) * 1000 / totalRevenue * 100).toFixed(1)
                return (
                  <div key={region.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{region.revenue}</span>
                        <span className={`flex items-center text-xs ${region.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {region.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-0.5" />
                          )}
                          {region.change}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Region Details</CardTitle>
          <CardDescription>Full breakdown by region</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((region) => {
                const share = (parseFloat(region.revenue.replace(/[$,K]/g, "")) * 1000 / totalRevenue * 100).toFixed(1)
                return (
                  <TableRow key={region.name}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell className="text-right font-bold">{region.revenue}</TableCell>
                    <TableCell className="text-right">{share}%</TableCell>
                    <TableCell className="text-right">
                      <span className={`flex items-center justify-end ${region.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {region.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {region.change}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
