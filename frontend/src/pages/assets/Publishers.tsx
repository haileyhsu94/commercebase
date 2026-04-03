import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockPublishers = [
  { name: "DailyClick Network", status: "active" as const, placements: "Shopping, display" },
  { name: "StyleWire Partners", status: "active" as const, placements: "Creator, editorial" },
  { name: "Metro Deals Co-op", status: "paused" as const, placements: "Local inventory" },
]

const statusVariants = {
  active: "outline",
  paused: "outline",
} as const

const statusClassNames = {
  active: "text-green-600 border-green-600",
  paused: "text-amber-600 border-amber-600",
} as const

export function PublishersPage() {
  return (
    <>
      <div className="py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Publishers</h1>
        <p className="text-sm text-muted-foreground">
          Partner inventory and publisher relationships for your campaigns—mock data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected publishers</CardTitle>
          <CardDescription>Where your ads and listings can appear</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Placements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPublishers.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[row.status]} className={statusClassNames[row.status]}>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.placements}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
