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
import { attributeCoverage } from "@/lib/ai-presence-mock"

export function AttributesPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attribute coverage</CardTitle>
          <CardDescription>Share of active SKUs with complete structured values</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributeCoverage.map((row) => (
                <TableRow key={row.attribute}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{row.attribute}</p>
                      {row.note && <p className="text-xs text-muted-foreground">{row.note}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.coveragePct}%</TableCell>
                  <TableCell className="text-right">
                    {row.gap ? (
                      <Badge variant="destructive">Gap</Badge>
                    ) : (
                      <Badge variant="secondary">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
