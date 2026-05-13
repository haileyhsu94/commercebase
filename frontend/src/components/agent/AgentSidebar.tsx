import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Home,
  Inbox as InboxIcon,
  Layers,
  MessageSquare,
  PenSquare,
  Pin,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUnreadInboxCount } from "@/hooks/use-inbox-unread"
import { currentUser } from "@/lib/mock-data"
import { getAgentChats, AGENT_STORAGE_EVENT } from "@/lib/agent/storage"
import type { AgentChat } from "@/types/agent"
import { cn } from "@/lib/utils"

const PRIMARY_NAV = [
  { title: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  { title: "Campaigns", href: "/agent/campaigns", icon: Sparkles, match: (p: string) => p.startsWith("/agent/campaign") },
  { title: "Autopilot", href: "/agent/flows", icon: Workflow, match: (p: string) => p.startsWith("/agent/flow") },
  { title: "Widgets", href: "/agent/widgets", icon: BarChart3, match: (p: string) => p.startsWith("/agent/widget") },
]

export function AgentSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { open: sidebarOpen } = useSidebar()
  const unreadInboxCount = useUnreadInboxCount()
  const [chats, setChats] = useState<AgentChat[]>([])

  useEffect(() => {
    const refresh = () => setChats(getAgentChats())
    refresh()
    const onUpdate = () => refresh()
    window.addEventListener(AGENT_STORAGE_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(AGENT_STORAGE_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [])

  const pinned = chats.filter((c) => c.pinned).slice(0, 5)
  const recents = chats.filter((c) => !c.pinned).slice(0, 8)

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-1.5 p-1.5">
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="lg"
              tooltip="CommerceBase"
              className="w-fit max-w-full group-data-[collapsible=icon]:justify-center"
              render={<Link to="/" aria-label="CommerceBase home" />}
            >
              <img
                src="/commercebase-logo.svg"
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 object-contain dark:invert"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-1.5">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="New chat"
                  onClick={() => navigate("/")}
                  className="font-medium"
                >
                  <PenSquare />
                  <span>New chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-1.5 pt-0 pb-1.5">
          <SidebarGroupContent>
            <SidebarMenu>
              {PRIMARY_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={item.match(pathname)}
                    tooltip={item.title}
                    render={<Link to={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sidebarOpen && pinned.length > 0 && (
          <SidebarGroup className="px-1.5">
            <SidebarGroupLabel className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
              <Pin className="h-3 w-3" />
              Pinned
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinned.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton
                      tooltip={c.title}
                      render={<Link to={chatRoute(c)} />}
                    >
                      <MessageSquare className="shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {sidebarOpen && recents.length > 0 && (
          <SidebarGroup className="px-1.5">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recents.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton
                      tooltip={c.title}
                      render={<Link to={chatRoute(c)} />}
                    >
                      <MessageSquare className="shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-1.5 p-1.5">
        {sidebarOpen && <TrialCard />}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={
                unreadInboxCount > 0
                  ? `Inbox (${unreadInboxCount} unread)`
                  : "Inbox — notifications sent to you"
              }
              aria-label={
                unreadInboxCount > 0
                  ? `Inbox — ${unreadInboxCount} unread notifications`
                  : "Inbox — notifications sent to you"
              }
              title="Notifications sent to you"
              className={unreadInboxCount > 0 ? "pr-8" : undefined}
              render={<Link to="/inbox" />}
              isActive={pathname === "/inbox"}
            >
              <InboxIcon />
              <span>Inbox</span>
            </SidebarMenuButton>
            {unreadInboxCount > 0 && (
              <SidebarMenuBadge
                aria-hidden
                className={cn(
                  "border-0 bg-destructive text-destructive-foreground shadow-none ring-0",
                  "peer-hover/menu-button:text-destructive-foreground peer-data-active/menu-button:text-destructive-foreground",
                  "group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:translate-y-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[10px]",
                )}
              >
                {unreadInboxCount > 99 ? "99+" : unreadInboxCount}
              </SidebarMenuBadge>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Account & settings"
              render={<Link to="/settings" />}
              isActive={pathname.startsWith("/settings")}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="rounded-lg">{currentUser.initials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold leading-tight">
                {currentUser.name}
              </span>
            </SidebarMenuButton>
            <SidebarMenuAction
              render={<Link to="/settings" aria-label="Settings" />}
              title="Settings"
            >
              <Settings />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function chatRoute(chat: AgentChat) {
  if (chat.artifactRef?.type === "campaign") return `/agent/campaign/${chat.artifactRef.id}`
  if (chat.artifactRef?.type === "autopilot") return `/agent/flow/${chat.artifactRef.id}`
  if (chat.artifactRef?.type === "widget") return `/agent/widget/${chat.artifactRef.id}`
  return `/agent/chats/${chat.id}`
}

function TrialCard() {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Layers className="h-3.5 w-3.5" />
        CommerceBase Pro Trial
      </div>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
        Upgrade to keep unlimited skills, connectors, and approvals.
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-3/4 rounded-full bg-foreground" />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">14 of 14 days remaining</p>
      <Button size="sm" className="mt-2 h-7 w-full text-xs">
        Upgrade
      </Button>
    </div>
  )
}
