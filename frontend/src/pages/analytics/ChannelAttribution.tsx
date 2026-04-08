import { useOutletContext } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
import { channelPerformance } from "@/lib/mock-data"
import { useMemo } from "react"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"
import { daysFromAiPresenceTimeRange } from "@/lib/home-range-metrics"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function ChannelAttribution() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const days = daysFromAiPresenceTimeRange(timeRange)

  const activeData = useMemo(() => {
    const factor = 0.5 + days / 50
    return channelPerformance.map((c) => ({
      ...c,
      impressions: Math.round(parseInt(c.impressions.replace(/[MKK]/g, "")) * (c.impressions.includes("M") ? 1000000 : 1000) * factor).toLocaleString(),
      clicks: Math.round(parseInt(c.clicks.replace(/[KK]/g, "")) * (c.clicks.includes("K") ? 1000 : 1) * factor).toLocaleString(),
      conversions: Math.round(c.conversions * factor),
      revenue: `$${(parseFloat(c.revenue.replace(/[$,K]/g, "")) * factor).toFixed(1)}K`,
    }))
  }, [days])

  const pieData = useMemo(() => activeData.map((c, i) => ({
    name: c.name,
    value: c.share,
    fill: i === 0 ? "var(--color-primary)" : i === 1 ? "var(--color-chart-2)" : "var(--color-chart-3)",
  })), [activeData])

  const barData = useMemo(() => activeData.map((c) => ({
    name: c.name,
    revenue: parseFloat(c.revenue.replace(/[$,K]/g, "")) * 1000,
  })), [activeData])

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Share</CardTitle>
            <CardDescription>Distribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue by Channel</CardTitle>
            <CardDescription>Absolute revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis type="category" dataKey="name" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Channel Details</CardTitle>
          <CardDescription>Performance metrics by channel</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Channel</TableHead>
                <TableHead className="w-[11%]">Model</TableHead>
                <TableHead className="w-[11%] text-right">Impressions</TableHead>
                <TableHead className="w-[11%] text-right">Clicks</TableHead>
                <TableHead className="w-[11%] text-right">Conversions</TableHead>
                <TableHead className="w-[11%] text-right">Revenue</TableHead>
                <TableHead className="w-[11%] text-right">CVR</TableHead>
                <TableHead className="w-[11%] text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((channel) => (
                <TableRow key={channel.name}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-muted-foreground">{channel.model}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{channel.impressions}</TableCell>
                  <TableCell className="text-right">{channel.clicks}</TableCell>
                  <TableCell className="text-right">{channel.conversions}</TableCell>
                  <TableCell className="text-right font-medium">{channel.revenue}</TableCell>
                  <TableCell className="text-right">{channel.cvr}</TableCell>
                  <TableCell className="text-right font-medium">{channel.roas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
