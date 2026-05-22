import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Accordion } from "@base-ui/react/accordion"
import {
  BarChart3,
  Building2,
  ChevronDown,
  Inbox,
  MessageSquare,
  Package,
  PenSquare,
  Pin,
  Settings,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserAccountMenu } from "./UserAccountMenu"
import { SidebarTrialCard } from "./SidebarTrialCard"
import { cn } from "@/lib/utils"
import { aiPresenceSubnav } from "@/lib/ai-presence-mock"
import {
  analyticsSubnav,
  analyticsSubItemActive,
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

  useEffect(() => {
    setAiOpen(pathname.startsWith("/ai-presence") ? ["ai"] : [])
  }, [pathname])

  useEffect(() => {
    setAnalyticsOpen(pathname.startsWith("/analytics") ? ["analytics"] : [])
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
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Settings"
                      render={<Link to="/settings" />}
                      isActive={isActive("/settings")}
                    >
                      <Settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {sidebarOpen && (
              <>
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
            )}
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
                {/* Catalogs — top-level (all users) */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={
                      pathname.startsWith("/catalogs") || pathname.startsWith("/products")
                    }
                    tooltip="Catalogs"
                    render={<Link to="/catalogs" />}
                  >
                    <Package />
                    <span>Catalogs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Autopilot — top-level standalone */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={
                      pathname === "/autopilot" || pathname.startsWith("/autopilot/")
                    }
                    tooltip="Autopilot"
                    render={<Link to="/autopilot" />}
                  >
                    <Workflow />
                    <span>Autopilot</span>
                    <span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-700 group-data-[collapsible=icon]:hidden dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      Next phase
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Publishers — admin only, under its own "Internal" group */}
        {currentUser.isAdmin && (
          <SidebarGroup className="p-1.5">
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              Internal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/publishers")}
                    tooltip="Publishers"
                    render={<Link to="/publishers" />}
                  >
                    <Building2 />
                    <span>Publishers</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
            <UserAccountMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

