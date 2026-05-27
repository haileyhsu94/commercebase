import { Navigate, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AIAssistantProvider, useAIAssistant } from "@/contexts/AIAssistantContext"
import { GlobalSearchProvider } from "@/contexts/GlobalSearchContext"
import { cn } from "@/lib/utils"
import { HomeModeProvider, useHomeMode } from "@/contexts/HomeModeContext"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header"
import { AIAssistantPanel } from "./AIAssistantPanel"
import { GlobalSearchDialog } from "./GlobalSearchDialog"
import { AgentSidebar } from "@/components/agent/AgentSidebar"
import { AgentLayout } from "@/components/agent/AgentLayout"
import { PageTutorial } from "@/components/shared/PageTutorial"

function DashboardSurface() {
  const { isOpen, panelWidth } = useAIAssistant()
  const { mode } = useHomeMode()
  const { pathname } = useLocation()
  const isAgentHome = mode === "ai" && pathname === "/"

  return (
    <SidebarInset
      className={isOpen ? "md:!shadow-none" : undefined}
      style={{
        marginRight: isOpen ? panelWidth : 4,
        transition: "margin-right 150ms ease-in-out",
      }}
    >
      <Header />
      <main
        className={cn(
          "min-w-0 flex-1 overflow-x-hidden",
          isAgentHome ? "flex flex-col overflow-hidden" : "overflow-y-auto p-4 pt-0",
        )}
      >
        {!isAgentHome && <PageTutorial />}
        <Outlet />
      </main>
    </SidebarInset>
  )
}

function InnerLayout() {
  const { mode } = useHomeMode()
  const isAgent = mode === "ai"
  const { pathname, search } = useLocation()

  // In agent mode, the dashboard-only Campaigns list shouldn't render inside the
  // agent shell — send users to the agent campaigns experience instead. The
  // create/duplicate wizard deep-links are preserved so those still open.
  if (isAgent && pathname === "/campaigns") {
    const params = new URLSearchParams(search)
    if (!params.has("create") && !params.has("duplicate")) {
      return <Navigate to="/agent/campaigns" replace />
    }
  }

  return (
    <SidebarProvider className={isAgent ? "!h-svh !min-h-0" : undefined}>
      {isAgent ? <AgentSidebar /> : <AppSidebar />}
      {isAgent ? <AgentLayout /> : <DashboardSurface />}
      {!isAgent && <AIAssistantPanel />}
      <GlobalSearchDialog />
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  )
}

export function RootLayout() {
  return (
    <AIAssistantProvider>
      <GlobalSearchProvider>
        <HomeModeProvider>
          <InnerLayout />
        </HomeModeProvider>
      </GlobalSearchProvider>
    </AIAssistantProvider>
  )
}
