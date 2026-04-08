import { useEffect, useMemo, useState, useCallback } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowUpDown,
  ChevronRight,
  Copy,
  Plus,
  Search,
  ListFilter,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { getMergedCampaigns } from "@/lib/campaign-storage"
import { useCampaignPlanAllowance } from "@/hooks/use-campaign-plan-allowance"
import {
  AiPresenceTimeRangeControl,
  defaultAiPresenceTimeRange,
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import { CampaignCreate } from "./CampaignCreate"

function parseRoasPercent(roas: string): number | null {
  const m = /^([\d.]+)\s*%/.exec(roas.trim())
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

/** Parse "$3.2K" / "$890" / "$11.1K" into a number */
function parseDollar(s: string): number {
  const m = /\$?([\d.]+)\s*(K|M)?/i.exec(s.replace(/,/g, ""))
  if (!m) return 0
  const n = Number(m[1])
  if (m[2]?.toUpperCase() === "K") return n * 1000
  if (m[2]?.toUpperCase() === "M") return n * 1_000_000
  return n
}

// Full monthly data pool; sliced based on time range selection
const fullSpendData = [
  { month: "Oct", spend: 1800 }, { month: "Nov", spend: 2900 }, { month: "Dec", spend: 3600 },
  { month: "Jan", spend: 4200 }, { month: "Feb", spend: 5800 }, { month: "Mar", spend: 7100 },
  { month: "Apr", spend: 8600 }, { month: "May", spend: 9900 }, { month: "Jun", spend: 11100 },
]
const fullOrdersData = [
  { month: "Oct", orders: 42 }, { month: "Nov", orders: 68 }, { month: "Dec", orders: 84 },
  { month: "Jan", orders: 95 }, { month: "Feb", orders: 142 }, { month: "Mar", orders: 188 },
  { month: "Apr", orders: 235 }, { month: "May", orders: 310 }, { month: "Jun", orders: 380 },
]
const fullRevenueData = [
  { month: "Oct", revenue: 3400 }, { month: "Nov", revenue: 5800 }, { month: "Dec", revenue: 7200 },
  { month: "Jan", revenue: 8200 }, { month: "Feb", revenue: 14500 }, { month: "Mar", revenue: 22800 },
  { month: "Apr", revenue: 38000 }, { month: "May", revenue: 52300 }, { month: "Jun", revenue: 75800 },
]

function pointsForRange(range: AiPresenceTimeRange): number {
  if (range.kind === "preset") {
    if (range.preset === "7d") return 3
    if (range.preset === "14d") return 5
    return 7 // 28d
  }
  // custom: estimate from date diff
  const from = new Date(range.from)
  const to = new Date(range.to)
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000))
  if (days <= 7) return 3
  if (days <= 14) return 5
  return 7
}

type SortColumn = "name" | "goal" | "spent" | "clicks" | "orders" | "revenue" | "roas" | "cpa"
type SortDir = "asc" | "desc"

const spendChartConfig = {
  spend: { label: "Spend", color: "var(--color-primary)" },
} satisfies ChartConfig

const ordersChartConfig = {
  orders: { label: "Orders", color: "oklch(0.6 0.18 155)" },
} satisfies ChartConfig

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-chart-2)" },
} satisfies ChartConfig

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

function SortableHead({
  col,
  label,
  sortCol,
  sortDir,
  onSort,
  align,
}: {
  col: SortColumn
  label: string
  sortCol: SortColumn | null
  sortDir: SortDir
  onSort: (c: SortColumn) => void
  align?: "right"
}) {
  const active = sortCol === col
  return (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "ml-auto"
        )}
        onClick={() => onSort(col)}
      >
        {label}
        {active ? (
          sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

export function CampaignList() {
  const location = useLocation()
  const navigate = useNavigate()
  const { openPanelWithComposerText } = useAIAssistant()
  const allowance = useCampaignPlanAllowance()
  const [searchParams, setSearchParams] = useSearchParams()
  const [timeRange, setTimeRange] = useState<AiPresenceTimeRange>(defaultAiPresenceTimeRange)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [goalFilters, setGoalFilters] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "")
  const [createOpen, setCreateOpen] = useState(false)
  const [createSessionKey, setCreateSessionKey] = useState(0)
  const [upgradeGateOpen, setUpgradeGateOpen] = useState(false)
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(null)

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  const duplicateParam = searchParams.get("duplicate")
  useEffect(() => {
    if (!duplicateParam) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete("duplicate")
        return next
      },
      { replace: true }
    )
    if (allowance.isAtOrOverIncludedLimit) {
      setUpgradeGateOpen(true)
      return
    }
    setDuplicateSourceId(duplicateParam)
    setCreateSessionKey((k) => k + 1)
    setCreateOpen(true)
  }, [duplicateParam, allowance.isAtOrOverIncludedLimit, setSearchParams])

  const createParam = searchParams.get("create")
  useEffect(() => {
    if (createParam !== "1") return
    if (allowance.isAtOrOverIncludedLimit) {
      setUpgradeGateOpen(true)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete("create")
          return next
        },
        { replace: true }
      )
      return
    }
    setCreateSessionKey((k) => k + 1)
    setCreateOpen(true)
  }, [createParam, allowance.isAtOrOverIncludedLimit, setSearchParams])

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
    setDuplicateSourceId(null)
    if (allowance.isAtOrOverIncludedLimit) {
      setUpgradeGateOpen(true)
      return
    }
    setCreateSessionKey((k) => k + 1)
    setCreateOpen(true)
  }

  const openDuplicateModal = (campaignId: string) => {
    if (allowance.isAtOrOverIncludedLimit) {
      setUpgradeGateOpen(true)
      return
    }
    setDuplicateSourceId(campaignId)
    setCreateSessionKey((k) => k + 1)
    setCreateOpen(true)
  }

  const closeCreateModal = () => {
    setCreateOpen(false)
    setDuplicateSourceId(null)
    clearCreateQuery()
  }

  const [sort, setSort] = useState<{ col: SortColumn; dir: SortDir } | null>(null)

  const campaigns = useMemo(() => getMergedCampaigns(), [location.key, location.pathname])

  const points = pointsForRange(timeRange)
  const spendTrend = useMemo(() => fullSpendData.slice(-points), [points])
  const ordersTrend = useMemo(() => fullOrdersData.slice(-points), [points])
  const revenueTrend = useMemo(() => fullRevenueData.slice(-points), [points])

  const avgPortfolioRoasPct = useMemo(() => {
    const vals = campaigns.map((c) => parseRoasPercent(c.roas)).filter((n): n is number => n != null)
    if (vals.length === 0) return null
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [campaigns])

  const uniqueGoals = useMemo(
    () => [...new Set(campaigns.map((c) => c.goal).filter(Boolean))] as string[],
    [campaigns]
  )

  const toggleGoalFilter = (goal: string) => {
    setGoalFilters((prev) => {
      const next = new Set(prev)
      if (next.has(goal)) next.delete(goal)
      else next.add(goal)
      return next
    })
  }

  const handleSort = useCallback((col: SortColumn) => {
    setSort((prev) => {
      if (prev?.col === col) {
        return { col, dir: prev.dir === "asc" ? "desc" : "asc" }
      }
      return { col, dir: "asc" }
    })
  }, [])

  const filteredCampaigns = useMemo(() => {
    const list = campaigns.filter((campaign) => {
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      const matchesGoal = goalFilters.size === 0 || (campaign.goal && goalFilters.has(campaign.goal))
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesGoal && matchesSearch
    })
    if (!sort) return list
    const { col, dir } = sort
    const sorted = [...list].sort((a, b) => {
      let cmp = 0
      switch (col) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "goal":
          cmp = (a.goal ?? "").localeCompare(b.goal ?? "")
          break
        case "spent":
          cmp = parseDollar(a.spent) - parseDollar(b.spent)
          break
        case "clicks": {
          const ac = Number((a.clicks ?? "0").replace(/,/g, ""))
          const bc = Number((b.clicks ?? "0").replace(/,/g, ""))
          cmp = ac - bc
          break
        }
        case "orders":
          cmp = (a.orders ?? 0) - (b.orders ?? 0)
          break
        case "revenue":
          cmp = parseDollar(a.revenue) - parseDollar(b.revenue)
          break
        case "roas":
          cmp = (parseRoasPercent(a.roas) ?? 0) - (parseRoasPercent(b.roas) ?? 0)
          break
        case "cpa":
          cmp = parseDollar(a.cpa ?? "$0") - parseDollar(b.cpa ?? "$0")
          break
      }
      return dir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [campaigns, statusFilter, goalFilters, searchQuery, sort])

  const activeCampaigns = campaigns.filter((c) => c.status === "active")
  const pausedCount = campaigns.filter((c) => c.status === "paused").length
  const draftCount = campaigns.filter((c) => c.status === "draft").length
  const endedCount = campaigns.filter((c) => c.status === "ended").length

  const totalSpend = campaigns.reduce((sum, c) => sum + parseDollar(c.spent), 0)
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget ? parseDollar(c.budget) : 0), 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + parseDollar(c.revenue), 0)
  const totalOrders = campaigns.reduce((sum, c) => sum + (c.orders ?? 0), 0)
  const totalClicks = campaigns.reduce((sum, c) => {
    const raw = c.clicks?.replace(/,/g, "")
    return sum + (raw ? Number(raw) : 0)
  }, 0)

  const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`

  const stats = {
    total: campaigns.length,
    active: activeCampaigns.length,
    paused: pausedCount,
    draft: draftCount,
    ended: endedCount,
    totalSpend: fmtK(totalSpend),
    budget: fmtK(totalBudget),
    totalRevenue: fmtK(totalRevenue),
    orders: totalOrders,
    clicks: totalClicks >= 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : String(totalClicks),
    avgRoas: avgPortfolioRoasPct != null ? `${avgPortfolioRoasPct}%` : "—",
  }

  return (
    <>
      <Dialog open={upgradeGateOpen} onOpenChange={setUpgradeGateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You&apos;re at your plan limit</DialogTitle>
            <DialogDescription>
              {allowance.planName} includes {allowance.includedPerMonth} campaign
              {allowance.includedPerMonth === 1 ? "" : "s"} per month. Upgrade to add more
              campaigns and keep scaling performance.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p className="font-medium text-foreground">Your campaigns at a glance</p>
            <ul className="mt-2 list-inside list-disc text-muted-foreground">
              <li>{campaigns.length} total campaigns in workspace</li>
              {avgPortfolioRoasPct != null ? (
                <li>Portfolio ROAS averaging {avgPortfolioRoasPct}%</li>
              ) : (
                <li>Connect real performance data to see portfolio ROAS</li>
              )}
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setUpgradeGateOpen(false)}>
              Not now
            </Button>
            <Link
              to="/settings?tab=billing"
              className={buttonVariants()}
              onClick={() => setUpgradeGateOpen(false)}
            >
              Upgrade plan
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            key={`${createSessionKey}-${duplicateSourceId ?? "new"}`}
            embedded
            duplicateSourceId={duplicateSourceId}
            onClose={closeCreateModal}
          />
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Campaigns"
        description="Manage and monitor your advertising campaigns."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                openPanelWithComposerText(
                  "Help me create a new campaign. Suggest targeting, budget, and channels based on my best-performing campaigns."
                )
              }
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create with Aeris
            </Button>
            <Button type="button" onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
            <AiPresenceTimeRangeControl value={timeRange} onChange={setTimeRange} />
          </>
        }
      />

      <div className="@container mb-6">
      <div className="grid gap-4 @sm:grid-cols-2 @3xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-green-600">{stats.active}</span>
              <span className="text-sm text-muted-foreground">/ {stats.total} total</span>
            </div>
            <ChartContainer config={{ active: { label: "Active", color: "oklch(0.6 0.18 155)" }, other: { label: "Other", color: "var(--color-muted)" } }} className="mx-auto aspect-square max-h-[160px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={[{ name: "Active", value: stats.active, fill: "oklch(0.6 0.18 155)" }, { name: "Paused", value: stats.paused, fill: "oklch(0.75 0.15 70)" }, { name: "Draft", value: stats.draft, fill: "var(--color-muted)" }, { name: "Ended", value: stats.ended, fill: "oklch(0.55 0.02 260)" }].filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={36} outerRadius={60} startAngle={90} endAngle={-270} dataKey="value" nameKey="name" strokeWidth={2}>
                  {[{ fill: "oklch(0.6 0.18 155)" }, { fill: "oklch(0.75 0.15 70)" }, { fill: "var(--color-muted)" }, { fill: "oklch(0.55 0.02 260)" }].map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Spend</CardDescription>
              <span className="text-[10px] text-muted-foreground">{formatAiPresencePeriodShort(timeRange)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold">{stats.totalSpend}</span>
              <span className="text-sm text-muted-foreground">/ {stats.budget}</span>
            </div>
            <ChartContainer config={spendChartConfig} className="aspect-auto h-[140px] w-full">
              <AreaChart data={spendTrend} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-spend)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-spend)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area type="natural" dataKey="spend" stroke="var(--color-spend)" strokeWidth={2} fill="url(#fillSpend)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Orders</CardDescription>
              <span className="text-[10px] text-muted-foreground">{formatAiPresencePeriodShort(timeRange)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold">{stats.orders.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">{stats.clicks} clicks</span>
            </div>
            <ChartContainer config={ordersChartConfig} className="aspect-auto h-[140px] w-full">
              <BarChart data={ordersTrend} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Revenue</CardDescription>
              <span className="text-[10px] text-muted-foreground">{formatAiPresencePeriodShort(timeRange)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold">{stats.totalRevenue}</span>
              <span className="text-sm text-muted-foreground">{stats.avgRoas} ROAS</span>
            </div>
            <ChartContainer config={revenueChartConfig} className="aspect-auto h-[140px] w-full">
              <AreaChart data={revenueTrend} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area type="natural" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#fillRevenue)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Campaigns</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <ListFilter className="h-3.5 w-3.5" />
                    Goal
                    {goalFilters.size > 0 && (
                      <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]">
                        {goalFilters.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Goal KPI</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueGoals.map((goal) => (
                    <DropdownMenuCheckboxItem
                      key={goal}
                      checked={goalFilters.has(goal)}
                      onCheckedChange={() => toggleGoalFilter(goal)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {goal}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {goalFilters.size > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setGoalFilters(new Set())}>
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([
              { value: "all", label: "All", count: stats.total },
              { value: "active", label: "Active", count: stats.active },
              { value: "paused", label: "Paused", count: stats.paused },
              { value: "draft", label: "Draft", count: stats.draft },
              { value: "ended", label: "Ended", count: stats.ended },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  statusFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground lg:hidden">Scroll horizontally for all columns →</p>
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <SortableHead col="name" label="Campaign" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} />
                <SortableHead col="goal" label="Goal KPI" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} />
                <SortableHead col="spent" label="Spent / Budget" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} align="right" />
                <SortableHead col="clicks" label="Clicks" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} align="right" />
                <SortableHead col="orders" label="Orders" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} align="right" />
                <SortableHead col="revenue" label="Revenue" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} align="right" />
                <SortableHead col="roas" label="ROAS" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} align="right" />
                <SortableHead col="cpa" label="CPA" sortCol={sort?.col ?? null} sortDir={sort?.dir ?? "asc"} onSort={handleSort} align="right" />
                <TableHead className="w-10" aria-hidden />
                <TableHead className="w-[104px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className="group/row cursor-pointer hover:bg-muted/60"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={statusVariants[campaign.status]}
                        className={cn("w-16 justify-center", statusClassNames[campaign.status])}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                      <span className="font-medium">{campaign.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{campaign.goal ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {(() => {
                      const spent = parseDollar(campaign.spent)
                      const budget = campaign.budget ? parseDollar(campaign.budget) : 0
                      const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
                      return (
                        <div className="space-y-1">
                          <div className="tabular-nums">
                            <span>{campaign.spent}</span>
                            {campaign.budget && (
                              <span className="text-muted-foreground"> / {campaign.budget}</span>
                            )}
                          </div>
                          {budget > 0 && (
                            <div className="mx-auto h-1 w-full max-w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  pct >= 90 ? "bg-amber-500" : "bg-primary"
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{campaign.clicks ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{campaign.orders ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{campaign.revenue}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{campaign.roas}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{campaign.cpa ?? "—"}</TableCell>
                  <TableCell className="w-10 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <ChevronRight
                      className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-70"
                      aria-hidden
                    />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-0.5">
                      <TooltipProvider delay={300}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground"
                              aria-label="Copy this campaign"
                              onClick={() => openDuplicateModal(campaign.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Copy this campaign</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="min-h-11 min-w-11"
                          aria-label="More actions"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-max min-w-52 max-w-[min(100vw-2rem,16rem)] max-h-[min(320px,var(--available-height))]"
                      >
                        <DropdownMenuItem asChild>
                          <Link to={`/campaigns/${campaign.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/campaigns/${campaign.id}?edit=1`}>Edit Campaign</Link>
                        </DropdownMenuItem>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
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
