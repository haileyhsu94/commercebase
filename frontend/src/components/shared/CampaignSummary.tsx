import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMergedCampaigns } from "@/lib/campaign-storage"
import {
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import { daysFromAiPresenceTimeRange, scaleCampaignRowForHomeRange } from "@/lib/home-range-metrics"

export function CampaignSummary({ timeRange }: { timeRange: AiPresenceTimeRange }) {
  const days = daysFromAiPresenceTimeRange(timeRange)
  const activeCampaigns = getMergedCampaigns()
    .filter((c) => c.status === "active")
    .map((c) => scaleCampaignRowForHomeRange(c, days))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-medium">
              Active Campaigns
              <Badge variant="secondary" className="ml-2">
                {activeCampaigns.length} running
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Spend and revenue for {formatAiPresencePeriodShort(timeRange).toLowerCase()} (mock)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0" asChild>
            <Link to="/campaigns" className="inline-flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">CVR</TableHead>
              <TableHead className="text-right">ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Link
                    to={`/campaigns/${campaign.id}`}
                    className="font-medium hover:underline"
                  >
                    {campaign.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{campaign.spent}</TableCell>
                <TableCell className="text-right">{campaign.revenue}</TableCell>
                <TableCell className="text-right">{campaign.cvr}</TableCell>
                <TableCell className="text-right font-medium">{campaign.roas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
