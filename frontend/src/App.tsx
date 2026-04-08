import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { RootLayout } from "@/components/layout"
import {
  Home,
  CampaignList,
  CampaignDetail,
  PerformanceOverview,
  AudiencesPage,
  ChannelAttribution,
  ProductPerformance,
  RegionalBreakdown,
  PublishersPage,
  ProductList,
  ProductDetail,
  SyncStatus,
  AccountSettings,
  AIPermissions,
  Integrations,
  TeamSettings,
  AnalyticsLayout,
  AIPresenceLayout,
  AIPresenceOverview,
  MerchantsPage,
  ShoppingJourneyPage,
  AttributesPage,
  PromptsPage,
  OptimizePage,
  AutoAgentPage,
  CompetitorInsightsPage,
  Inbox,
} from "@/pages"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "inbox", element: <Inbox /> },
      { path: "campaigns", element: <CampaignList /> },
      { path: "campaigns/new", element: <Navigate to="/campaigns?create=1" replace /> },
      { path: "campaigns/:id", element: <CampaignDetail /> },
      {
        path: "ai-presence",
        element: <AIPresenceLayout />,
        children: [
          { index: true, element: <AIPresenceOverview /> },
          { path: "shopping-journey", element: <ShoppingJourneyPage /> },
          { path: "merchants", element: <MerchantsPage /> },
          { path: "attributes", element: <AttributesPage /> },
          { path: "prompts", element: <PromptsPage /> },
          { path: "optimize", element: <OptimizePage /> },
          { path: "seo-geo", element: <Navigate to="/ai-presence/optimize" replace /> },
          { path: "auto-agent", element: <AutoAgentPage /> },
          { path: "agent", element: <Navigate to="/ai-presence/auto-agent" replace /> },
          { path: "competitors", element: <CompetitorInsightsPage /> },
          { path: "opportunities", element: <Navigate to="/ai-presence/competitors?tab=opportunities" replace /> },
        ],
      },
      { path: "ai-visibility", element: <Navigate to="/ai-presence" replace /> },
      {
        path: "ai-visibility/competitors",
        element: <Navigate to="/ai-presence/competitors" replace />,
      },
      {
        path: "ai-visibility/opportunities",
        element: <Navigate to="/ai-presence/competitors?tab=opportunities" replace />,
      },
      {
        path: "analytics",
        element: <AnalyticsLayout />,
        children: [
          { index: true, element: <PerformanceOverview /> },
          { path: "channels", element: <ChannelAttribution /> },
          { path: "products", element: <ProductPerformance /> },
          { path: "audiences", element: <AudiencesPage /> },
          { path: "regions", element: <RegionalBreakdown /> },
        ],
      },
      { path: "catalogs", element: <Navigate to="/products" replace /> },
      { path: "publishers", element: <PublishersPage /> },
      { path: "products", element: <ProductList /> },
      { path: "products/sync", element: <SyncStatus /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "settings", element: <AccountSettings /> },
      { path: "settings/team", element: <TeamSettings /> },
      { path: "settings/ai-permissions", element: <AIPermissions /> },
      { path: "settings/integrations", element: <Integrations /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
