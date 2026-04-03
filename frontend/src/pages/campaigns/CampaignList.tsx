import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { Plus, Search, Filter, MoreHorizontal, Play, Pause, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMergedCampaigns } from "@/lib/campaign-storage"
import { CampaignCreate } from "./CampaignCreate"

const statusVariants = {
  active: "outline",
  paused: "outline",
  draft: "outline",
  ended: "destructive",
} as const

const statusClassNames = {
  active: "text-green-600 border-green-600",
  paused: "text-amber-600 border-amber-600",
  draft: "",
  ended: "",
} as const

export function CampaignList() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "")
  const [createOpen, setCreateOpen] = useState(() => searchParams.get("create") === "1")
  const [createSessionKey, setCreateSessionKey] = useState(0)

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  const createParam = searchParams.get("create")
  useEffect(() => {
    if (createParam === "1") {
      setCreateSessionKey((k) => k + 1)
      setCreateOpen(true)
    }
  }, [createParam])

  const clearCreateQuery = () => {
    if (searchParams.get("create") === "1") {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete("create")
          return next
        },
        { replace: true }
      )
    }
  }

  const openCreateModal = () => {
    setCreateSessionKey((k) => k + 1)
    setCreateOpen(true)
  }

  const closeCreateModal = () => {
    setCreateOpen(false)
    clearCreateQuery()
  }

  const campaigns = useMemo(() => getMergedCampaigns(), [location.key, location.pathname])

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    totalSpend: "$11.1K",
    totalRevenue: "$75.8K",
  }

  return (
    <>
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateModal()
        }}
      >
        <DialogContent
          className="max-h-[min(90vh,56rem)] gap-0 overflow-y-auto p-4 pt-10 sm:max-w-5xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">Create campaign</DialogTitle>
          <DialogDescription className="sr-only">
            Multi-step flow to configure and launch a new advertising campaign.
          </DialogDescription>
          <CampaignCreate
            key={createSessionKey}
            embedded
            onClose={closeCreateModal}
          />
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your advertising campaigns.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpend}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Campaigns</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v ?? "all")}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="font-medium hover:underline"
                    >
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[campaign.status]} className={statusClassNames[campaign.status]}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{campaign.spent}</TableCell>
                  <TableCell className="text-right">{campaign.revenue}</TableCell>
                  <TableCell className="text-right">{campaign.cvr}</TableCell>
                  <TableCell className="text-right font-medium">{campaign.roas}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/campaigns/${campaign.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "active" ? (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCampaigns.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No campaigns found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
