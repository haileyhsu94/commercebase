import { useState, useMemo, useEffect } from "react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"
import { getChannelData, getChannelPieData, getChannelBarData } from "@/lib/analytics-mock"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const PAGE_SIZE = 15

export function ChannelAttribution() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const [currentPage, setCurrentPage] = useState(1)

  const channelData  = useMemo(() => getChannelData(timeRange),    [timeRange])
  const pieData      = useMemo(() => getChannelPieData(timeRange).slice(0, 5), [timeRange])
  const barData      = useMemo(() => getChannelBarData(timeRange).slice(0, 10), [timeRange])

  const totalPages = Math.ceil(channelData.length / PAGE_SIZE)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return channelData.slice(start, start + PAGE_SIZE)
  }, [channelData, currentPage])

  // Reset to page 1 when range changes
  useEffect(() => {
    setCurrentPage(1)
  }, [timeRange])

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top 5 Channel Share</CardTitle>
            <CardDescription>Revenue distribution by top channels</CardDescription>
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
            <CardTitle className="text-sm font-medium">Top 10 Revenue by Channel</CardTitle>
            <CardDescription>Absolute revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Channel Details</CardTitle>
          <CardDescription>Performance metrics by channel</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[20%] pl-6">Channel</TableHead>
                <TableHead className="w-[11%]">Model</TableHead>
                <TableHead className="w-[11%] text-right">Impressions</TableHead>
                <TableHead className="w-[11%] text-right">Clicks</TableHead>
                <TableHead className="w-[11%] text-right">Conversions</TableHead>
                <TableHead className="w-[11%] text-right text-primary">Revenue</TableHead>
                <TableHead className="w-[11%] text-right">CVR</TableHead>
                <TableHead className="w-[11%] pr-6 text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((channel) => (
                <TableRow key={channel.name}>
                  <TableCell className="pl-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">{channel.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{channel.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground uppercase">{channel.model}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{channel.impressions}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{channel.clicks}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium">{channel.conversions}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-bold text-primary">{channel.revenue}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{channel.cvr}</TableCell>
                  <TableCell className="pr-6 text-right tabular-nums text-sm font-bold text-emerald-600 dark:text-emerald-400">{channel.roas}</TableCell>
                </TableRow>
              ))}
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
