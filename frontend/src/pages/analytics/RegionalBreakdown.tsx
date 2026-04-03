import { Link } from "react-router-dom"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
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
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { regionData } from "@/lib/mock-data"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const chartData = regionData.map((r) => ({
  name: r.name.split(" ")[0],
  revenue: parseFloat(r.revenue.replace(/[$,K]/g, "")) * 1000,
}))

export function RegionalBreakdown() {
  const totalRevenue = regionData.reduce(
    (sum, r) => sum + parseFloat(r.revenue.replace(/[$,K]/g, "")) * 1000,
    0
  )

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/analytics">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Regional Breakdown</h1>
          <p className="text-sm text-muted-foreground">
            Performance by geographic region.
          </p>
        </div>
      </div>

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
              {regionData.map((region) => {
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
              {regionData.map((region) => {
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
