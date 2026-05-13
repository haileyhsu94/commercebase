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

function MainContent() {
  const { isOpen, panelWidth } = useAIAssistant()
  const { mode } = useHomeMode()
  const { pathname } = useLocation()
  const isAgentHome = mode === "ai" && pathname === "/"
  const isAutopilotFlowEditor = pathname.startsWith("/autopilot/") && pathname.endsWith("/edit")
  const isFullBleedMain = isAgentHome || isAutopilotFlowEditor

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
          isFullBleedMain ? "flex min-h-0 flex-col overflow-hidden" : "overflow-y-auto p-4 pt-0"
        )}
      >
        <Outlet />
      </main>
    </SidebarInset>
  )
}

function InnerLayout() {
  const { mode } = useHomeMode()
  const { pathname } = useLocation()
  const isAgentHome = mode === "ai" && pathname === "/"
  const isAutopilotFlowEditor = pathname.startsWith("/autopilot/") && pathname.endsWith("/edit")

  return (
    <SidebarProvider className={isAgentHome || isAutopilotFlowEditor ? "!h-svh !min-h-0" : undefined}>
      <AppSidebar />
      <MainContent />
      <AIAssistantPanel />
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
