import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AIAssistantProvider, useAIAssistant } from "@/contexts/AIAssistantContext"
import { GlobalSearchProvider } from "@/contexts/GlobalSearchContext"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header"
import { AIAssistantPanel } from "./AIAssistantPanel"
import { GlobalSearchDialog } from "./GlobalSearchDialog"

function MainContent() {
  const { isOpen, panelWidth } = useAIAssistant()

  return (
    <SidebarInset
      className={isOpen ? "md:!shadow-none" : undefined}
      style={{
        marginRight: isOpen ? panelWidth : 4,
        transition: "margin-right 150ms ease-in-out",
      }}
    >
      <Header />
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pt-0">
        <Outlet />
      </main>
    </SidebarInset>
  )
}

export function RootLayout() {
  return (
    <AIAssistantProvider>
      <GlobalSearchProvider>
        <SidebarProvider>
          <AppSidebar />
          <MainContent />
          <AIAssistantPanel />
          <GlobalSearchDialog />
          <Toaster richColors position="bottom-right" />
        </SidebarProvider>
      </GlobalSearchProvider>
    </AIAssistantProvider>
  )
}
