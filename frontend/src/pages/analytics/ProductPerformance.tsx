import { Link, useOutletContext } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { topProducts } from "@/lib/mock-data"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function ProductPerformance() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const days = daysFromAiPresenceTimeRange(timeRange)

  const activeData = useMemo(() => {
    const factor = 0.7 + days / 40
    return topProducts.map((p) => ({
      ...p,
      sales: Math.round(parseInt(String(p.sales).replace(/,/g, "")) * factor).toLocaleString(),
      revenue: `$${(parseFloat(String(p.revenue).replace(/[$,K]/g, "")) * factor).toFixed(1)}K`,
    }))
  }, [days])

  const chartData = useMemo(() => activeData.map((p) => ({
    name: p.name.split(" ").slice(0, 2).join(" "),
    revenue: parseFloat(p.revenue.replace(/[$,K]/g, "")) * 1000,
  })), [activeData])

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Products by Revenue</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} />
              <YAxis type="category" dataKey="name" width={100} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Product Details</CardTitle>
          <CardDescription>Performance metrics by product</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((product, i) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>
                    <Link to={`/products/${product.id}`} className="font-medium hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{product.sales}</TableCell>
                  <TableCell className="text-right">{product.cvr}</TableCell>
                  <TableCell className="text-right font-bold">{product.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
