import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Accordion } from "@base-ui/react/accordion"
import { BarChart3, ChevronDown, Inbox, MessageSquare, Package, PenSquare, Pin, Settings, Workflow } from "lucide-react"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { aiPresenceSubnav } from "@/lib/ai-presence-mock"
import {
  analyticsSubnav,
  analyticsSubItemActive,
  assetsSubnav,
  assetsSubItemActive,
} from "@/lib/sidebar-nav"
import { useUnreadInboxCount } from "@/hooks/use-inbox-unread"
import { navigationItems, currentUser } from "@/lib/mock-data"
import { useHomeMode } from "@/contexts/HomeModeContext"

const pinnedConversations = [
  { id: "p1", title: "Q2 campaign strategy planning" },
]

const recentConversations = [
  { id: "r1", title: "Optimize sneaker campaign ROAS" },
  { id: "r2", title: "AI visibility gap analysis" },
  { id: "r3", title: "FW26 audience refinement ideas" },
  { id: "r4", title: "Product feed sync troubleshooting" },
  { id: "r5", title: "Revenue trends last 90 days" },
  { id: "r6", title: "Competitor benchmarking report" },
  { id: "r7", title: "Budget reallocation suggestions" },
]

const AI_PRESENCE_HREF = "/ai-presence" as const
const platformNavItems = navigationItems.filter((i) => i.href !== AI_PRESENCE_HREF)
const aiVisibilityNavItem = navigationItems.find((i) => i.href === AI_PRESENCE_HREF)

function aiPresenceHref(path: string) {
  return path === "" ? "/ai-presence" : `/ai-presence/${path}`
}

function aiPresenceSubActive(pathname: string, path: string) {
  if (path === "") return pathname === "/ai-presence"
  return pathname === aiPresenceHref(path)
}

const accordionTriggerClass =
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0"

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()
  const unreadInboxCount = useUnreadInboxCount()
  const { mode } = useHomeMode()

  const [aiOpen, setAiOpen] = useState<string[]>(() =>
    pathname.startsWith("/ai-presence") ? ["ai"] : []
  )
  const [analyticsOpen, setAnalyticsOpen] = useState<string[]>(() =>
    pathname.startsWith("/analytics") ? ["analytics"] : []
  )
  const [assetsOpen, setAssetsOpen] = useState<string[]>(() =>
    pathname.startsWith("/catalogs") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/publishers")
      ? ["assets"]
      : []
  )

  useEffect(() => {
    setAiOpen(pathname.startsWith("/ai-presence") ? ["ai"] : [])
  }, [pathname])

  useEffect(() => {
    setAnalyticsOpen(pathname.startsWith("/analytics") ? ["analytics"] : [])
  }, [pathname])

  useEffect(() => {
    setAssetsOpen(
      pathname.startsWith("/catalogs") ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/publishers")
        ? ["assets"]
        : []
    )
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  /** Icon rail: subnav is hidden until the sidebar is expanded — expand first and keep the section open. */
  const handleAiAccordionChange = (v: string[]) => {
    if (!sidebarOpen) {
      setSidebarOpen(true)
      setAiOpen(["ai"])
      return
    }
    setAiOpen(v)
  }

  const handleAnalyticsAccordionChange = (v: string[]) => {
    if (!sidebarOpen) {
      setSidebarOpen(true)
      setAnalyticsOpen(["analytics"])
      return
    }
    setAnalyticsOpen(v)
  }

  const handleAssetsAccordionChange = (v: string[]) => {
    if (!sidebarOpen) {
      setSidebarOpen(true)
      setAssetsOpen(["assets"])
      return
    }
    setAssetsOpen(v)
  }

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
        {mode === "ai" && pathname === "/" ? (
          <>
            <SidebarGroup className="p-1.5">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="New chat">
                      <PenSquare />
                      <span>New chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-1.5">
              <SidebarGroupLabel className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
                <Pin className="h-3 w-3" />
                Pinned
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {pinnedConversations.map((conv) => (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton tooltip={conv.title}>
                        <MessageSquare className="shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-1.5">
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
                Recents
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentConversations.map((conv) => (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton tooltip={conv.title}>
                        <MessageSquare className="shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup className="p-1.5">
            <SidebarGroupContent>
              <SidebarMenu>
                {platformNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      render={<Link to={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {aiVisibilityNavItem && (
                  <SidebarMenuItem>
                    <Accordion.Root value={aiOpen} onValueChange={handleAiAccordionChange} multiple={false}>
                      <Accordion.Item value="ai" className="border-0">
                        <Accordion.Header className="m-0 w-full p-0">
                          <Accordion.Trigger
                            className={cn(
                              accordionTriggerClass,
                              "h-8 text-sm data-[panel-open]:bg-sidebar-accent/80 [&[data-panel-open]_svg:last-child]:rotate-180"
                            )}
                          >
                            <aiVisibilityNavItem.icon />
                            <span className="truncate font-medium">AI Visibility</span>
                            <ChevronDown
                              aria-hidden
                              className="ml-auto shrink-0 transition-transform duration-200"
                            />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Panel className="overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-1">
                          <SidebarMenuSub className="gap-1 pt-2 pb-0.5">
                            {aiPresenceSubnav.map(({ path, label }) => {
                              const href = aiPresenceHref(path)
                              return (
                                <SidebarMenuSubItem key={path || "overview"}>
                                  <SidebarMenuSubButton
                                    isActive={aiPresenceSubActive(pathname, path)}
                                    render={<Link to={href} />}
                                  >
                                    <span className="truncate">{label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <Accordion.Root value={analyticsOpen} onValueChange={handleAnalyticsAccordionChange} multiple={false}>
                    <Accordion.Item value="analytics" className="border-0">
                      <Accordion.Header className="m-0 w-full p-0">
                        <Accordion.Trigger
                          className={cn(
                            accordionTriggerClass,
                            "h-8 text-sm data-[panel-open]:bg-sidebar-accent/80 [&[data-panel-open]_svg:last-child]:rotate-180"
                          )}
                        >
                          <BarChart3 />
                          <span className="truncate font-medium">Analytics</span>
                          <ChevronDown
                            aria-hidden
                            className="ml-auto shrink-0 transition-transform duration-200"
                          />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Panel className="overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-1">
                        <SidebarMenuSub className="gap-1 pt-2 pb-0.5">
                          {analyticsSubnav.map(({ href, label }) => (
                            <SidebarMenuSubItem key={href}>
                              <SidebarMenuSubButton
                                isActive={analyticsSubItemActive(pathname, href)}
                                render={<Link to={href} />}
                              >
                                <span className="truncate">{label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion.Root>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Accordion.Root value={assetsOpen} onValueChange={handleAssetsAccordionChange} multiple={false}>
                    <Accordion.Item value="assets" className="border-0">
                      <Accordion.Header className="m-0 w-full p-0">
                        <Accordion.Trigger
                          className={cn(
                            accordionTriggerClass,
                            "h-8 text-sm data-[panel-open]:bg-sidebar-accent/80 [&[data-panel-open]_svg:last-child]:rotate-180"
                          )}
                        >
                          <Package />
                          <span className="truncate font-medium">Assets</span>
                          <ChevronDown
                            aria-hidden
                            className="ml-auto shrink-0 transition-transform duration-200"
                          />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Panel className="overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-1">
                        <SidebarMenuSub className="gap-1 pt-2 pb-0.5">
                          {assetsSubnav.map(({ href, label }) => (
                            <SidebarMenuSubItem key={href}>
                              <SidebarMenuSubButton
                                isActive={assetsSubItemActive(pathname, href)}
                                render={<Link to={href} />}
                              >
                                <span className="truncate">{label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion.Root>
                </SidebarMenuItem>

                {/* Autopilot — top-level standalone */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/autopilot")}
                    tooltip="Autopilot"
                    render={<Link to="/autopilot" />}
                  >
                    <Workflow />
                    <span>Autopilot</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="gap-1.5 p-1.5">
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
              <Inbox />
              <span>Inbox</span>
            </SidebarMenuButton>
            {unreadInboxCount > 0 && (
              <SidebarMenuBadge
                aria-hidden
                className={cn(
                  "border-0 bg-destructive text-destructive-foreground shadow-none ring-0",
                  "peer-hover/menu-button:text-destructive-foreground peer-data-active/menu-button:text-destructive-foreground",
                  "group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:translate-y-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[10px]"
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
              isActive={isActive("/settings")}
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
