import { useEffect, useMemo, useState } from "react"
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { getMergedCampaigns } from "@/lib/campaign-storage"
import { channelPerformance, revenueChartData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  AiPresenceTimeRangeControl,
  defaultAiPresenceTimeRange,
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"
import type { AiCampaignData, CampaignTask } from "@/lib/campaign-brief-mock"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
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

const priorityColors = {
  High: "text-red-600",
  Medium: "text-amber-600",
  Low: "text-muted-foreground",
} as const

const taskStatusIcons = {
  todo: Circle,
  in_progress: Loader2,
  completed: CheckCircle2,
} as const

export function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { openPanelWithComposerText } = useAIAssistant()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editOpen, setEditOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<AiPresenceTimeRange>(defaultAiPresenceTimeRange)
  const [taskChat, setTaskChat] = useState<CampaignTask | null>(null)
  const [taskChatInput, setTaskChatInput] = useState("")
  const [taskChatMessages, setTaskChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([])
  const [taskChatLoading, setTaskChatLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("edit") !== "1") return
    setEditOpen(true)
    const next = new URLSearchParams(searchParams)
    next.delete("edit")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const campaign = useMemo(() => {
    const list = getMergedCampaigns()
    return list.find((c) => c.id === id) ?? list[0]
  }, [id])

  const aiCampaign = campaign.aiCampaign
  const hasAiBrief = !!aiCampaign

  const defaultTab = hasAiBrief ? "brief" : "performance"

  const metrics = [
    { label: "Spent", value: campaign.spent, change: "+12%", trend: "up" },
    { label: "Revenue", value: campaign.revenue, change: "+18%", trend: "up" },
    { label: "CPC", value: campaign.cpc, change: "-4%", trend: "up" },
    { label: "CPS", value: campaign.cps, change: "-2%", trend: "up" },
    { label: "CVR", value: campaign.cvr, change: "-0.1%", trend: "down" },
    { label: "ROAS", value: campaign.roas, change: "+5%", trend: "up" },
  ]

  const handleTaskGetStarted = (task: CampaignTask) => {
    setTaskChat(task)
    setTaskChatInput("")
    setTaskChatMessages([
      {
        role: "ai",
        text: `I'm ready to help you with "${task.title}". I've loaded your campaign brief, brand voice, and messaging guidelines.\n\nWould you like me to draft this for you, or do you have specific direction?`,
      },
    ])
  }

  const handleTaskChatSend = () => {
    if (!taskChatInput.trim() || taskChatLoading) return
    const userMsg = taskChatInput.trim()
    setTaskChatMessages((prev) => [...prev, { role: "user", text: userMsg }])
    setTaskChatInput("")
    setTaskChatLoading(true)

    setTimeout(() => {
      setTaskChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Here's a draft based on your input:\n\n---\n\nI'll work on this and have a polished version ready. You can iterate on it by giving me feedback or specific edits.\n\nWould you like me to refine this further or move to the next task?`,
        },
      ])
      setTaskChatLoading(false)
    }, 1500)
  }

  return (
    <>
      <div className="flex items-center gap-4 py-4">
        <Link
          to="/campaigns"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label="Back to campaigns"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
                <Badge variant={statusVariants[campaign.status]} className={statusClassNames[campaign.status]}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit shrink-0"
                onClick={() =>
                  openPanelWithComposerText(
                    `Copy campaign "${campaign.name}" (${campaign.id}) with these changes: `
                  )
                }
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Copy with Aeris
              </Button>
            </div>
            <AiPresenceTimeRangeControl value={timeRange} onChange={setTimeRange} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {campaign.status === "active" ? (
            <Button variant="outline">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/campaigns?duplicate=${encodeURIComponent(campaign.id)}`)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy campaign
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => setEditOpen(true)}
            aria-label="Edit campaign settings"
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {hasAiBrief && aiCampaign.brief.timeline && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Date Range
          </span>
          <span className="font-medium text-foreground">{aiCampaign.brief.timeline}</span>
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            Owner
          </span>
          <span className="font-medium text-foreground">Hailey Hsu</span>
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList variant="line" className="border-b pb-0">
          {hasAiBrief && (
            <>
              <TabsTrigger value="brief">
                <FileText className="mr-1.5 h-4 w-4" />
                Brief
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <Check className="mr-1.5 h-4 w-4" />
                Tasks
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="performance">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            {hasAiBrief ? "Activation" : "Performance"}
          </TabsTrigger>
          {hasAiBrief && (
            <>
              <TabsTrigger value="deliverables">
                <Rocket className="mr-1.5 h-4 w-4" />
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="chats">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Chats
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ── Brief tab ── */}
        {hasAiBrief && (
          <TabsContent value="brief" className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground">Last updated: less than a minute ago</p>
              <h2 className="mt-2 text-xl font-semibold">{aiCampaign.brief.title}</h2>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Overview</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{aiCampaign.brief.overview}</p>
              <p className="text-sm">
                <span className="font-semibold">Cadence:</span>{" "}
                <span className="text-muted-foreground">{aiCampaign.brief.cadence}.</span>{" "}
                <span className="font-semibold">Timeline:</span>{" "}
                <span className="text-muted-foreground">{aiCampaign.brief.timeline}.</span>
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Goals</h3>
              <ul className="space-y-2">
                {aiCampaign.brief.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Target Audience</h3>
                <p className="text-sm text-muted-foreground">{aiCampaign.brief.targetAudience}</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {aiCampaign.brief.channels.map((ch) => (
                    <Badge key={ch} variant="secondary">{ch}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Key Messages</h3>
                <ul className="space-y-1.5">
                  {aiCampaign.brief.keyMessages.map((msg, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {msg}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Success Metrics</h3>
                <ul className="space-y-1.5">
                  {aiCampaign.brief.successMetrics.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── Tasks tab ── */}
        {hasAiBrief && (
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <Badge variant="secondary">
                  Completed {aiCampaign.tasks.filter((t) => t.status === "completed").length}/{aiCampaign.tasks.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm">+ New</Button>
            </div>

            <div className="rounded-lg border">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                <span>Task</span>
                <span className="w-24 text-center">Due date</span>
                <span className="w-20 text-center">Priority</span>
                <span className="w-24 text-center">Owner</span>
                <span className="w-28 text-center">Chat</span>
              </div>
              {aiCampaign.tasks.map((task) => {
                const StatusIcon = taskStatusIcons[task.status]
                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          task.status === "completed"
                            ? "text-green-600"
                            : task.status === "in_progress"
                              ? "animate-spin text-primary"
                              : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate text-sm font-medium">{task.title}</span>
                    </div>
                    <span className="flex w-24 items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </span>
                    <span className={cn("w-20 text-center text-xs font-medium", priorityColors[task.priority])}>
                      {task.priority}
                    </span>
                    <span className="flex w-24 items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="truncate">{task.owner.split(" ")[0]}</span>
                    </span>
                    <div className="flex w-28 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => handleTaskGetStarted(task)}
                      >
                        <Bot className="h-3 w-3" />
                        Get Started
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        )}

        {/* ── Performance / Activation tab ── */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{metric.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {metric.trend === "up" ? (
                        <span className="inline-flex items-center">
                          <TrendingUp className="h-3 w-3 mr-0.5" aria-hidden />
                          <span className="sr-only">Up</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <TrendingDown className="h-3 w-3 mr-0.5" aria-hidden />
                          <span className="sr-only">Down</span>
                        </span>
                      )}
                      {metric.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
                <CardDescription>{formatAiPresencePeriodShort(timeRange)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <LineChart data={revenueChartData}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} tickMargin={10} height={36} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Daily Performance</CardTitle>
                <CardDescription>{formatAiPresencePeriodShort(timeRange)} · daily bars</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <BarChart data={revenueChartData.slice(-7)}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} tickMargin={10} height={36} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Channel Performance</CardTitle>
              <CardDescription>Revenue attribution by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {channelPerformance.map((channel) => (
                  <div key={channel.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{channel.revenue}</p>
                        <p className="text-sm text-muted-foreground">{channel.roas} ROAS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${channel.share}%` }} />
                      </div>
                      <span className="w-10 text-xs text-muted-foreground">{channel.share}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Deliverables tab ── */}
        {hasAiBrief && (
          <TabsContent value="deliverables" className="space-y-4">
            <h2 className="text-lg font-semibold">Deliverables</h2>
            {aiCampaign.deliverables.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Rocket className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No deliverables yet. Use the "Get Started" button on any task to begin creating content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {aiCampaign.deliverables.map((d) => (
                  <Card key={d.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{d.type}</Badge>
                        <Badge
                          variant={d.status === "published" ? "default" : "outline"}
                          className={
                            d.status === "approved"
                              ? "text-green-600 border-green-600"
                              : d.status === "review"
                                ? "text-amber-600 border-amber-600"
                                : ""
                          }
                        >
                          {d.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{d.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ── Chats tab ── */}
        {hasAiBrief && (
          <TabsContent value="chats" className="space-y-4">
            <h2 className="text-lg font-semibold">Chats</h2>
            {aiCampaign.chats.map((chat) => (
              <Card key={chat.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{chat.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Just now
                  </span>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>

      {/* Task chat dialog */}
      <Dialog open={!!taskChat} onOpenChange={(open) => { if (!open) setTaskChat(null) }}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {taskChat?.title}
            </DialogTitle>
            <DialogDescription>Aeris is helping you create this deliverable.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 space-y-4 overflow-y-auto py-4">
            {taskChatMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {taskChatLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t pt-4">
            <Input
              placeholder="Type a message..."
              value={taskChatInput}
              onChange={(e) => setTaskChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTaskChatSend() }}
            />
            <Button size="icon" onClick={handleTaskChatSend} disabled={taskChatLoading || !taskChatInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit campaign dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit campaign</DialogTitle>
            <DialogDescription>
              Update name, budget, and targeting. In production this would save to your backend.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label htmlFor="campaign-edit-name" className="text-sm font-medium">
                Campaign name
              </label>
              <Input id="campaign-edit-name" defaultValue={campaign.name} autoComplete="off" />
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign-edit-budget" className="text-sm font-medium">
                Daily budget
              </label>
              <Input id="campaign-edit-budget" placeholder="$0.00" type="text" autoComplete="off" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setEditOpen(false)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
