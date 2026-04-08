import { 
  AlertCircle, 
  MoreHorizontal, 
  TrendingDown,
  TrendingUp,
  Sparkles,
  Filter,
  ArrowRight,
  BarChart3
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  catalogMetrics, 
  productFeeds, 
  feedIssues, 
  catalogCategoryPerformance 
} from "@/lib/assets-mock"
import { cn } from "@/lib/utils"

export function CatalogsPage() {
  return (
    <div className="space-y-6 pb-8">

      {/* ── Metrics ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {catalogMetrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"
          
          return (
            <Card key={metric.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{metric.value}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {metric.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">vs last sync</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Product Feeds ────────────────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 text-sm">
            <div>
              <CardTitle className="text-base font-semibold">Product Feeds</CardTitle>
              <CardDescription>Live sync status across all connected platforms</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="size-8">
              <Filter className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Feed Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="pl-8">Progress</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productFeeds.map((feed) => (
                  <TableRow key={feed.id}>
                    <TableCell className="pl-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">{feed.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{feed.source}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={feed.status === "healthy" ? "outline" : feed.status === "syncing" ? "default" : "destructive"}
                        className={cn(
                          "capitalize font-medium text-[10px]",
                          feed.status === "healthy" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                        )}
                      >
                        {feed.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium">
                      {feed.items.toLocaleString()}
                    </TableCell>
                    <TableCell className="pl-8 min-w-[140px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{feed.lastSync}</span>
                          <span className="font-bold">{feed.syncProgress}%</span>
                        </div>
                        <Progress value={feed.syncProgress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t px-6 py-3 flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground italic">Last global check 4 mins ago</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
              View full sync history
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </Card>

        {/* ── Category Performance ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Performance by Category</CardTitle>
            <CardDescription>ROI impact of your catalog segments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {catalogCategoryPerformance.map((category) => (
              <div key={category.name} className="flex items-center justify-between group cursor-default">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{category.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tabular-nums">
                    Revenue: {category.revenue}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-sm font-bold tabular-nums">{category.roas} ROAS</p>
                  <div className="flex items-center justify-end gap-1">
                    {category.trend === "up" ? (
                      <TrendingUp className="size-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3 text-red-500" />
                    )}
                    <span className="text-[11px] tabular-nums font-medium text-muted-foreground">{category.cvr} CVR</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="mt-2 border-t px-6 py-4">
             <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
               <BarChart3 className="size-3.5" />
               Full Category Report
             </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Feed Issues ─────────────────────────────────────────────────── */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Feed Issues & Optimization</CardTitle>
              <CardDescription>Items blocked or suppressed due to missing attributes</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              482 Critical Fixes
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
             <div className="flex flex-col">
               {feedIssues.map((issue, idx) => (
                 <div 
                   key={issue.id} 
                   className={cn(
                     "flex items-start gap-4 px-6 py-5 hover:bg-muted/30 transition-colors",
                     idx !== feedIssues.length - 1 && "border-b"
                   )}
                 >
                   <div className={cn(
                     "flex size-10 items-center justify-center rounded-full shrink-0",
                     issue.impact === "High" ? "bg-red-50 text-red-600 dark:bg-red-950/20" : 
                     issue.impact === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20" : 
                     "bg-blue-50 text-blue-600 dark:bg-blue-950/20"
                   )}>
                     <AlertCircle className="size-5" />
                   </div>
                   <div className="flex-1 min-w-0 space-y-1">
                     <div className="flex items-center gap-3">
                       <h4 className="text-sm font-bold">{issue.title}</h4>
                       <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5">
                         {issue.count} Items
                       </Badge>
                       <span className={cn(
                         "text-[10px] font-bold px-1.5 rounded-sm uppercase tracking-wider",
                         issue.impact === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                         issue.impact === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                         "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                       )}>
                         {issue.impact} Impact
                       </span>
                     </div>
                     <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{issue.description}</p>
                   </div>
                   <div className="flex shrink-0 items-center gap-2">
                     <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">Ignore</Button>
                     <Button size="sm" className="h-8 text-xs font-semibold gap-1.5">
                       <Sparkles className="size-3" />
                       Fix with Aeris
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
          <div className="p-6 border-t flex justify-center">
             <Button variant="link" className="text-sm font-medium text-muted-foreground underline">
               View all 14 data quality rules
             </Button>
          </div>
        </Card>
      </div>

    </div>
  )
}
