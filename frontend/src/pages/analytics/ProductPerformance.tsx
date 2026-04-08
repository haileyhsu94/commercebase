import { useState, useMemo, useEffect } from "react"
import { Link, useOutletContext } from "react-router-dom"
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
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { getProductData, getProductBarData } from "@/lib/analytics-mock"
import type { AnalyticsOutletContext } from "./AnalyticsLayout"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

const PAGE_SIZE = 15

export function ProductPerformance() {
  const { timeRange } = useOutletContext<AnalyticsOutletContext>()
  const [currentPage, setCurrentPage] = useState(1)

  const productData = useMemo(() => getProductData(timeRange),    [timeRange])
  const chartData   = useMemo(() => getProductBarData(timeRange), [timeRange])

  const totalPages = Math.ceil(productData.length / PAGE_SIZE)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return productData.slice(start, start + PAGE_SIZE)
  }, [productData, currentPage])

  // Reset to page 1 when range changes
  useEffect(() => {
    setCurrentPage(1)
  }, [timeRange])

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Products by Revenue</CardTitle>
          <CardDescription>Revenue for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData.slice(0, 10)} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] pl-6 text-center">Rank</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="pr-6 text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((product, i) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + i + 1
                return (
                  <TableRow key={product.id}>
                    <TableCell className="text-center font-medium pl-6 tabular-nums text-muted-foreground">
                      {globalIndex}
                    </TableCell>
                    <TableCell>
                      <Link to={`/products/${product.id}`} className="font-semibold text-foreground hover:underline">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{product.sales}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{product.cvr}</TableCell>
                    <TableCell className="pr-6 text-right font-bold tabular-nums text-primary">{product.revenue}</TableCell>
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
