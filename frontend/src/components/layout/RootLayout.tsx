import { Outlet, useLocation } from "react-router-dom"
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
        <Outlet />
      </main>
    </SidebarInset>
  )
}

function InnerLayout() {
  const { mode } = useHomeMode()
  const isAgent = mode === "ai"

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
