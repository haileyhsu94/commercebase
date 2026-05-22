import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Home,
  Inbox as InboxIcon,
  Megaphone,
  MessageSquare,
  PenSquare,
  Pin,
  Workflow,
  Wrench,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarTrialCard } from "@/components/layout/SidebarTrialCard"
import { UserAccountMenu } from "@/components/layout/UserAccountMenu"
import { useUnreadInboxCount } from "@/hooks/use-inbox-unread"
import { getAgentChats, AGENT_STORAGE_EVENT } from "@/lib/agent/storage"
import type { AgentChat } from "@/types/agent"
import { cn } from "@/lib/utils"

const PRIMARY_NAV: {
  title: string
  href: string
  icon: typeof Home
  match: (p: string) => boolean
  badge?: string
}[] = [
  { title: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  { title: "Campaigns", href: "/agent/campaigns", icon: Megaphone, match: (p: string) => p.startsWith("/agent/campaign") },
  { title: "Fix with Aeris", href: "/agent/fix-with-aeris", icon: Wrench, match: (p: string) => p.startsWith("/agent/fix-with-aeris") },
  { title: "Autopilot", href: "/agent/flows", icon: Workflow, match: (p: string) => p.startsWith("/agent/flow"), badge: "Next phase" },
  { title: "Widgets", href: "/agent/widgets", icon: BarChart3, match: (p: string) => p.startsWith("/agent/widget"), badge: "Next phase" },
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
                    {item.badge && (
                      <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-700 group-data-[collapsible=icon]:hidden dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        {item.badge}
                      </span>
                    )}
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
        {sidebarOpen && <SidebarTrialCard />}
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
            <UserAccountMenu />
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
