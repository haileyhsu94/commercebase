import { useParams, Link } from "react-router-dom"
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { topProducts } from "@/lib/mock-data"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const salesData = [
  { date: "Mar 26", sales: 12 },
  { date: "Mar 27", sales: 18 },
  { date: "Mar 28", sales: 15 },
  { date: "Mar 29", sales: 22 },
  { date: "Mar 30", sales: 28 },
  { date: "Mar 31", sales: 25 },
  { date: "Apr 1", sales: 32 },
]

export function ProductDetail() {
  const { id } = useParams()
  const product = topProducts.find((p) => p.id === id) || topProducts[0]

  const metrics = [
    { label: "Total Sales", value: product.sales.toString(), change: "+12%", trend: "up" },
    { label: "Revenue", value: product.revenue, change: "+18%", trend: "up" },
    { label: "CVR", value: product.cvr, change: "+0.3%", trend: "up" },
    { label: "Avg. Order Value", value: "$142", change: "-2%", trend: "down" },
  ]

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Product ID: {product.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View in Store
          </Button>
          <Button>Edit Product</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
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

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="ai-presence">AI Visibility</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sales Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={salesData}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <CardDescription>Campaigns featuring this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">SS26 Luxury — Drive Sales</p>
                    <p className="text-sm text-muted-foreground">Shopping, Creator Network</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$4.2K</p>
                    <p className="text-sm text-muted-foreground">Revenue from this product</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Sneakers Q2 — New Customer</p>
                    <p className="text-sm text-muted-foreground">Shopping</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$2.8K</p>
                    <p className="text-sm text-muted-foreground">Revenue from this product</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-presence">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">AI Visibility</CardTitle>
              <CardDescription>How this product appears in AI shopping conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Share of voice (SoV)</span>
                  <span className="font-bold">72%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: "72%" }} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Top Query</p>
                    <p className="font-medium">"luxury sneakers"</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Mentions/week</p>
                    <p className="font-medium">1,240</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-medium">SKU-{product.id.padStart(6, "0")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Synced</p>
                    <p className="font-medium">2 hours ago</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">$189.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Status</p>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Stock
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sync Status</p>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Synced
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
