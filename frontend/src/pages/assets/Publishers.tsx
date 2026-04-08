import { 
  TrendingDown, 
  TrendingUp, 
  ExternalLink,
  Search
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  publisherMetrics, 
  networkSegments, 
  publishersList 
} from "@/lib/assets-mock"
import { cn } from "@/lib/utils"

export function PublishersPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* ── Metrics ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {publisherMetrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"
          const TrendIcon = isPositive ? TrendingUp : TrendingDown
          
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{metric.value}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={cn(
                    "flex items-center gap-0.5 text-xs font-bold",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    <TrendIcon className="size-3" />
                    {metric.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">vs last 30d</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Network Segments ─────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {networkSegments.map((segment) => {
          const Icon = segment.icon
          return (
            <Card key={segment.name} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {segment.name}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-bold tabular-nums">
                    {segment.impressions}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                    <span>Performance</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                      {segment.roas}x ROAS
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Publisher Directory ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold">Publisher Directory</CardTitle>
            <CardDescription>Individual partner performance and connectivity</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter publishers..."
              className="w-full bg-muted/30 pl-9 text-xs h-9 focus-visible:ring-1"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-[250px]">Publisher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishersList.map((pub) => (
                <TableRow key={pub.id} className="group">
                  <TableCell className="pl-6 font-semibold text-sm py-4">
                    <div className="flex items-center gap-2">
                       {pub.name}
                       <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] py-0 font-medium">
                      {pub.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium">{pub.impressions}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium">{pub.cvr}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-bold">{pub.revenue}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{pub.roas}</span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-bold uppercase py-0.5",
                        pub.status === "active" 
                          ? "text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" 
                          : "text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                      )}
                    >
                      {pub.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t flex items-center justify-center bg-muted/10">
           <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-medium">
             Load 42 more active partners
           </Button>
        </div>
      </Card>
    </div>
  )
}
