import { useCallback, useState } from "react"
import { GripVertical, LayoutGrid } from "lucide-react"
import { currentUser } from "@/lib/mock-data"
import {
  getHomeLayout,
  getVisibleWidgetsInOrder,
  HOME_WIDGET_LABELS,
  type HomeLayoutState,
  type HomeWidgetId,
  resetHomeLayoutToDefault,
  saveHomeLayout,
} from "@/lib/home-layout"
import { AlertsPanel } from "@/components/shared/AlertsPanel"
import { EfficiencyMetricsCard } from "@/components/shared/EfficiencyMetricsCard"
import { HealthScoreCard } from "@/components/shared/HealthScoreCard"
import { AIVisibilityScoreCard } from "@/components/shared/AIVisibilityScoreCard"
import { QuickActions } from "@/components/shared/QuickActions"
import { CampaignSummary } from "@/components/shared/CampaignSummary"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  AiPresenceTimeRangeControl,
  defaultAiPresenceTimeRange,
  formatAiPresencePeriodShort,
  type AiPresenceTimeRange,
} from "@/pages/ai-presence/ai-presence-time-range"

const DND_TYPE = "application/x-commercebase-home-widget"

function reorderWidgets(order: HomeWidgetId[], fromIndex: number, toIndex: number): HomeWidgetId[] {
  if (fromIndex === toIndex) return order
  const next = [...order]
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed!)
  return next
}

export function Home() {
  const [timeRange, setTimeRange] = useState<AiPresenceTimeRange>(defaultAiPresenceTimeRange)
  const [layout, setLayout] = useState<HomeLayoutState>(() => getHomeLayout())
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [draggingId, setDraggingId] = useState<HomeWidgetId | null>(null)
  const [dragOverId, setDragOverId] = useState<HomeWidgetId | null>(null)

  const persist = useCallback((next: HomeLayoutState) => {
    setLayout(next)
    saveHomeLayout(next)
  }, [])

  const reorderByDrag = useCallback(
    (fromId: HomeWidgetId, toId: HomeWidgetId) => {
      if (fromId === toId) return
      const { order } = layout
      const from = order.indexOf(fromId)
      const to = order.indexOf(toId)
      if (from < 0 || to < 0) return
      persist({ ...layout, order: reorderWidgets(order, from, to) })
    },
    [layout, persist]
  )

  const toggleHidden = useCallback(
    (id: HomeWidgetId) => {
      const hidden = new Set(layout.hidden)
      if (hidden.has(id)) hidden.delete(id)
      else hidden.add(id)
      persist({ ...layout, hidden: [...hidden] })
    },
    [layout, persist]
  )

  const handleResetLayout = useCallback(() => {
    resetHomeLayoutToDefault()
    setLayout(getHomeLayout())
  }, [])

  const visibleOrdered = getVisibleWidgetsInOrder(layout)

  return (
    <>
      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your campaigns — {formatAiPresencePeriodShort(timeRange)}.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setCustomizeOpen(true)}
          >
            <LayoutGrid className="size-4" />
            Customize home
          </Button>
          <AiPresenceTimeRangeControl value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      <div className="space-y-6">
        {visibleOrdered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            All sections are hidden. Use <span className="font-medium text-foreground">Customize home</span> to show
            them again.
          </p>
        ) : (
          visibleOrdered.map((id) => <HomeWidgetBlock key={id} id={id} timeRange={timeRange} />)
        )}
      </div>

      <Dialog
        open={customizeOpen}
        onOpenChange={(open) => {
          setCustomizeOpen(open)
          if (!open) {
            setDraggingId(null)
            setDragOverId(null)
          }
        }}
      >
        <DialogContent className="max-h-[min(90vh,560px)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize home</DialogTitle>
            <DialogDescription>
              Drag the handle to reorder sections. Use the switch to show or hide. Your layout is saved in this
              browser.
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-3 py-2" role="list">
            {layout.order.map((id) => {
              const shown = !layout.hidden.includes(id)
              const isDragging = draggingId === id
              const isOver = dragOverId === id && draggingId !== id
              return (
                <li
                  key={id}
                  role="listitem"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                    if (draggingId && draggingId !== id) setDragOverId(id)
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverId((cur) => (cur === id ? null : cur))
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const fromId = e.dataTransfer.getData(DND_TYPE) as HomeWidgetId
                    if (fromId && fromId !== id) reorderByDrag(fromId, id)
                    setDraggingId(null)
                    setDragOverId(null)
                  }}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    isDragging && "opacity-50",
                    isOver && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <button
                      type="button"
                      draggable
                      className={cn(
                        "flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
                      )}
                      aria-label={`Reorder ${HOME_WIDGET_LABELS[id]}`}
                      title="Drag to reorder"
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DND_TYPE, id)
                        e.dataTransfer.effectAllowed = "move"
                        setDraggingId(id)
                      }}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDragOverId(null)
                      }}
                    >
                      <GripVertical className="size-4" aria-hidden />
                    </button>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{HOME_WIDGET_LABELS[id]}</span>
                      <div className="flex items-center gap-2">
                        <span className="sr-only" id={`home-show-${id}`}>
                          Show {HOME_WIDGET_LABELS[id]}
                        </span>
                        <Switch
                          checked={shown}
                          onCheckedChange={() => toggleHidden(id)}
                          aria-labelledby={`home-show-${id}`}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={handleResetLayout}>
              Reset to default
            </Button>
            <Button type="button" onClick={() => setCustomizeOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function HomeWidgetBlock({
  id,
  timeRange,
}: {
  id: HomeWidgetId
  timeRange: AiPresenceTimeRange
}) {
  switch (id) {
    case "quickActions":
      return <QuickActions />
    case "alerts":
      return <AlertsPanel timeRange={timeRange} />
    case "healthAi":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <HealthScoreCard timeRange={timeRange} />
          <AIVisibilityScoreCard timeRange={timeRange} />
        </div>
      )
    case "efficiency":
      return <EfficiencyMetricsCard timeRange={timeRange} />
    case "campaignSummary":
      return <CampaignSummary timeRange={timeRange} />
    default:
      return null
  }
}
