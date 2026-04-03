import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCheck, Inbox as InboxIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getInboxNotifications,
  isInboxItemRead,
  markAllInboxRead,
  markInboxNotificationRead,
  type InboxNotification,
} from "@/lib/inbox-mock"
import { cn } from "@/lib/utils"

function InboxRow({
  item,
  onMarkRead,
}: {
  item: InboxNotification
  onMarkRead: (id: string) => void
}) {
  const read = isInboxItemRead(item)

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border/80 p-4 transition-colors sm:flex-row sm:items-start sm:justify-between",
        !read && "border-destructive/25 bg-destructive/[0.06]"
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {!read && (
            <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-destructive" aria-hidden />
          )}
          <h2 className="text-sm font-semibold leading-tight">{item.title}</h2>
          <span className="text-xs text-muted-foreground">{item.time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{item.body}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {item.actionHref && item.actionLabel && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to={item.actionHref}>
                {item.actionLabel}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
          {!read && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onMarkRead(item.id)}>
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function Inbox() {
  const [tick, setTick] = useState(0)
  const items = useMemo(() => getInboxNotifications(), [tick])

  const unreadCount = items.filter((n) => !isInboxItemRead(n)).length

  const refresh = () => setTick((t) => t + 1)

  const handleMarkRead = (id: string) => {
    markInboxNotificationRead(id)
    refresh()
  }

  const handleMarkAll = () => {
    markAllInboxRead()
    refresh()
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
            <InboxIcon className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              Notifications and updates sent to you. Unread items are highlighted.
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2" onClick={handleMarkAll}>
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All messages</CardTitle>
          <CardDescription>
            {unreadCount === 0
              ? "You're caught up."
              : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <Separator className="mb-4" />
          {items.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="flex flex-col gap-3 px-6 pb-6">
              {items.map((item) => (
                <li key={item.id}>
                  <InboxRow item={item} onMarkRead={handleMarkRead} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
