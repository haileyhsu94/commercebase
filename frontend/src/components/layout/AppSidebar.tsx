import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Accordion } from "@base-ui/react/accordion"
import { BarChart3, ChevronDown, Inbox, Package, Settings, Star } from "lucide-react"
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
import { isStarredHrefAllowed, useStarredNav } from "@/lib/starred-nav"

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

function SidebarNavStar({
  href,
  starred,
  onToggle,
}: {
  href: string
  starred: boolean
  onToggle: () => void
}) {
  if (!isStarredHrefAllowed(href)) return null
  return (
    <SidebarMenuAction
      showOnHover
      render={<button type="button" />}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      title={starred ? "Remove from starred" : "Add to starred"}
      aria-label={starred ? "Remove from starred" : "Add to starred"}
      aria-pressed={starred}
      className={cn(
        starred &&
          "text-amber-500 opacity-100 hover:text-amber-500 md:opacity-100 peer-data-active/menu-button:text-amber-500"
      )}
    >
      <Star className={cn(starred && "fill-amber-400/40")} strokeWidth={starred ? 1.5 : 2} />
    </SidebarMenuAction>
  )
}

function SubNavStar({
  href,
  starred,
  onToggle,
}: {
  href: string
  starred: boolean
  onToggle: () => void
}) {
  if (!isStarredHrefAllowed(href)) return null
  return (
    <button
      type="button"
      className={cn(
        "absolute right-0.5 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden",
        !starred &&
          "opacity-0 group-hover/menu-sub-item:opacity-100 group-focus-within/menu-sub-item:opacity-100",
        starred && "text-amber-500 opacity-100 hover:text-amber-500"
      )}
      aria-label={starred ? "Remove from starred" : "Add to starred"}
      aria-pressed={starred}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
    >
      <Star className={cn("size-3.5", starred && "fill-amber-400/40")} strokeWidth={starred ? 1.5 : 2} />
    </button>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()
  const { starredEntries, toggle, isStarred } = useStarredNav()
  const unreadInboxCount = useUnreadInboxCount()

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
                  <SidebarNavStar
                    href={item.href}
                    starred={isStarred(item.href)}
                    onToggle={() => toggle(item.href)}
                  />
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
                                  className="pr-7"
                                  isActive={aiPresenceSubActive(pathname, path)}
                                  render={<Link to={href} />}
                                >
                                  <span className="truncate">{label}</span>
                                </SidebarMenuSubButton>
                                <SubNavStar
                                  href={href}
                                  starred={isStarred(href)}
                                  onToggle={() => toggle(href)}
                                />
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
                              className="pr-7"
                              isActive={analyticsSubItemActive(pathname, href)}
                              render={<Link to={href} />}
                            >
                              <span className="truncate">{label}</span>
                            </SidebarMenuSubButton>
                            <SubNavStar
                              href={href}
                              starred={isStarred(href)}
                              onToggle={() => toggle(href)}
                            />
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
                              className="pr-7"
                              isActive={assetsSubItemActive(pathname, href)}
                              render={<Link to={href} />}
                            >
                              <span className="truncate">{label}</span>
                            </SidebarMenuSubButton>
                            <SubNavStar
                              href={href}
                              starred={isStarred(href)}
                              onToggle={() => toggle(href)}
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion.Root>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {starredEntries.length > 0 && (
          <SidebarGroup className="px-1.5 pb-1.5 pt-2">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">Starred</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {starredEntries.map((entry) => (
                  <SidebarMenuItem key={entry.href}>
                    <SidebarMenuButton
                      isActive={isActive(entry.href)}
                      tooltip={entry.title}
                      render={<Link to={entry.href} />}
                    >
                      <entry.Icon />
                      <span className="truncate">{entry.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
