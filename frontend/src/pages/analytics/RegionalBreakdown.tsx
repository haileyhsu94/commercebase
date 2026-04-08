import { useState, useMemo, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOutletContext } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { getRegionData, getRegionBarData } from "@/lib/analytics-mock"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const PAGE_SIZE = 15

export function RegionalBreakdown() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const [currentPage, setCurrentPage] = useState(1)

  const regionData = useMemo(() => getRegionData(timeRange),    [timeRange])
  const chartData  = useMemo(() => getRegionBarData(timeRange).slice(0, 10), [timeRange])

  const totalRevenue = useMemo(
    () => regionData.reduce((sum, r) => sum + r.revenueRaw, 0),
    [regionData]
  )

  const totalPages = Math.ceil(regionData.length / PAGE_SIZE)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return regionData.slice(start, start + PAGE_SIZE)
  }, [regionData, currentPage])

  // Reset to page 1 when range changes
  useEffect(() => {
    setCurrentPage(1)
  }, [timeRange])

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top 10 Regions by Revenue</CardTitle>
            <CardDescription>Revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Regional Share (Top 10)</CardTitle>
            <CardDescription>Distribution of revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionData.slice(0, 10).map((region) => {
                const shareCount = totalRevenue > 0
                  ? ((region.revenueRaw / totalRevenue) * 100).toFixed(1)
                  : "0.0"
                return (
                  <div key={region.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{region.revenue}</span>
                        <span className={`flex items-center text-xs font-semibold ${region.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {region.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-0.5" />
                          )}
                          {region.change}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${shareCount}%` }}
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Region Details</CardTitle>
          <CardDescription>Full breakdown by region</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Region</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="pr-6 text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((region) => {
                const sharePercent = totalRevenue > 0
                  ? ((region.revenueRaw / totalRevenue) * 100).toFixed(1)
                  : "0.0"
                return (
                  <TableRow key={region.name}>
                    <TableCell className="pl-6 py-4 font-semibold text-sm">{region.name}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-sm text-primary">{region.revenue}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{sharePercent}%</TableCell>
                    <TableCell className="pr-6 text-right">
                      <span className={`flex items-center justify-end tabular-nums font-semibold text-xs ${region.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
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

          {totalPages > 1 && (
            <div className="border-t bg-muted/10 p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(i + 1)
                        }}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
