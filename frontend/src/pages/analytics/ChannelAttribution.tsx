import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const pieData = channelPerformance.map((c, i) => ({
  name: c.name,
  value: c.share,
  fill: i === 0 ? "var(--color-primary)" : i === 1 ? "var(--color-chart-2)" : "var(--color-chart-3)",
}))

const barData = channelPerformance.map((c) => ({
  name: c.name,
  revenue: parseFloat(c.revenue.replace(/[$,K]/g, "")) * 1000,
}))

export function ChannelAttribution() {
  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/analytics">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Channel Attribution</h1>
          <p className="text-sm text-muted-foreground">
            Revenue attribution by distribution channel.
          </p>
        </div>
      </div>

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
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelPerformance.map((channel) => (
                <TableRow key={channel.name}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.description}</p>
                    </div>
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
