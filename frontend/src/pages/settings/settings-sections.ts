/** Settings sidebar / mobile picker — keep in sync with `SettingsTabNav` triggers. */
export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", href: "/settings?tab=profile" },
  { id: "company", label: "Company", href: "/settings?tab=company" },
  { id: "team", label: "Team", href: "/settings/team" },
  { id: "billing", label: "Billing", href: "/settings?tab=billing" },
  { id: "api-keys", label: "API Keys", href: "/settings?tab=api-keys" },
  { id: "notifications", label: "Notifications", href: "/settings?tab=notifications" },
  { id: "integrations", label: "Integrations", href: "/settings?tab=integrations" },
  { id: "security", label: "Security", href: "/settings?tab=security" },
] as const

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"]
