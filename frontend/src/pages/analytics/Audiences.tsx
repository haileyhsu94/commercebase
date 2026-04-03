import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockAudiences = [
  { name: "High-intent shoppers", reach: "128K", overlap: "42%" },
  { name: "Luxury fashion interest", reach: "89K", overlap: "38%" },
  { name: "Returning visitors (90d)", reach: "34K", overlap: "61%" },
]

export function AudiencesPage() {
  return (
    <>
      <div className="py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Audiences</h1>
        <p className="text-sm text-muted-foreground">
          Segments derived from AI and on-site signals—mock data for this prototype.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audience segments</CardTitle>
          <CardDescription>Estimated reach and model overlap vs your catalog</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead className="text-right">Est. reach</TableHead>
                <TableHead className="text-right">Overlap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAudiences.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.reach}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.overlap}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
