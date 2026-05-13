import type { ConnectorDef } from "@/types/agent"

export const CONNECTORS: ConnectorDef[] = [
  {
    id: "shopify",
    name: "Shopify",
    category: "store",
    description: "Sync your products, orders, and customers.",
    scopes: ["read_products", "read_orders", "read_customers"],
    brandColor: "#95BF47",
  },
  {
    id: "google-merchant",
    name: "Google Merchant Center",
    category: "store",
    description: "Feed product catalog into Google Shopping and AI Overviews.",
    scopes: ["content"],
    brandColor: "#4285F4",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    category: "ads",
    description: "Read performance and launch Performance Max campaigns.",
    scopes: ["adwords"],
    brandColor: "#FBBC04",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    category: "ads",
    description: "Run ads across Facebook, Instagram, and Messenger.",
    scopes: ["ads_management", "business_management"],
    brandColor: "#1877F2",
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    category: "ads",
    description: "Launch and measure ads on TikTok Spark and Shop.",
    scopes: ["ads.read", "ads.write"],
    brandColor: "#000000",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    category: "crm",
    description: "Sync email lists, segments, and lifecycle flows.",
    scopes: ["lists:read", "campaigns:write"],
    brandColor: "#1D2025",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "Pull CRM contacts and push back attribution.",
    scopes: ["contacts", "marketing"],
    brandColor: "#FF7A59",
  },
  {
    id: "slack",
    name: "Slack",
    category: "messaging",
    description: "Get alerts, approve drafts, and chat with Aeris in-channel.",
    scopes: ["chat:write", "channels:read"],
    brandColor: "#4A154B",
  },
]

export function getConnector(id: string): ConnectorDef | undefined {
  return CONNECTORS.find((c) => c.id === id)
}
