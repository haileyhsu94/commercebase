import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, Target, Activity, RefreshCcw } from "lucide-react"

const topCards = [
  { title: "Total Shoppers", value: "2.4M", description: "All identified profiles", icon: Users },
  { title: "Active (30D)", value: "850K", description: "Visited in last 30 days", icon: Activity },
  { title: "High-Intent Pool", value: "128K", description: "Ready-to-purchase score >80", icon: Target },
  { title: "Retarget Pool", value: "45K", description: "Cart abandoned or recent view", icon: RefreshCcw },
]

const mockSegments = [
  { 
    name: "High-intent shoppers", size: "128K", cvr: "4.2%", 
    avgOrder: "$145", ltv: "$420", growth: "+12%", channel: "Search", 
    color: "bg-blue-500" 
  },
  { 
    name: "Luxury fashion interest", size: "89K", cvr: "2.8%", 
    avgOrder: "$310", ltv: "$890", growth: "+5%", channel: "Paid Social", 
    color: "bg-purple-500" 
  },
  { 
    name: "Returning visitors (90d)", size: "34K", cvr: "6.1%", 
    avgOrder: "$110", ltv: "$350", growth: "-2%", channel: "Direct", 
    color: "bg-emerald-500" 
  },
  { 
    name: "Cart Abandoners (7d)", size: "12K", cvr: "8.5%", 
    avgOrder: "$165", ltv: "$480", growth: "+18%", channel: "Email", 
    color: "bg-amber-500" 
  },
]

const categoryAffinity = [
  { name: "Luxury Fashion", index: 182, progress: 90 },
  { name: "Sneakers", index: 145, progress: 75 },
  { name: "Activewear", index: 110, progress: 55 },
  { name: "Outerwear", index: 85, progress: 40 }, 
]

export function AudiencesPage() {
  return (
    <>
      <div className="py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Audiences</h1>
        <p className="text-sm text-muted-foreground">
          AI-driven audience segments and targeting opportunities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {topCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Audience segments</CardTitle>
            <CardDescription>High-value pools available for immediate targeting</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">CVR</TableHead>
                  <TableHead className="text-right">LTV</TableHead>
                  <TableHead>Best Channel</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSegments.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${row.color}`} />
                        {row.name}
                        {row.growth.startsWith("+") && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full ml-1">
                            {row.growth}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.size}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.cvr}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.ltv}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {row.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Target</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Affinity</CardTitle>
            <CardDescription>Likelihood to purchase compared to baseline (100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {categoryAffinity.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-muted-foreground tabular-nums text-xs font-medium">
                      {cat.index}x
                    </span>
                  </div>
                  <Progress value={cat.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
