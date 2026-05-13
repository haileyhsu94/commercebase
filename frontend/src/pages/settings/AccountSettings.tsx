import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, Brain, ExternalLink, Shield, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationCombobox } from "@/components/ui/location-combobox"
import { COUNTRIES, CITIES } from "@/lib/location-options"
import { cn } from "@/lib/utils"
import { currentUser, simpleIconSvgUrl } from "@/lib/mock-data"
import { getCompanyProfile, saveCompanyProfile } from "@/lib/company-profile"
import {
  buildPlanCatalog,
  CURRENT_PLAN_ID,
  getMediaPlan,
  planBulletsLine,
} from "@/lib/media-plans"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ThemeAppearanceCard } from "@/components/theme-appearance-card"
import { IntegrationsHubContent } from "@/pages/settings/IntegrationsHubContent"
import { SettingsTabNav } from "@/pages/settings/SettingsTabNav"

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "501+"] as const

const industryOptions = [
  "Fashion & apparel",
  "Beauty & cosmetics",
  "Electronics & technology",
  "Home & furniture",
  "Sports & outdoors",
  "Food & beverage",
  "Health & wellness",
  "Other",
] as const

const authenticatorApps = [
  {
    id: "google",
    name: "Google Authenticator",
    description: "Free app for Android and iOS",
    /** Simple Icons slug — brand mark for recognition */
    iconSlug: "google",
  },
  {
    id: "microsoft",
    name: "Microsoft Authenticator",
    description: "Works with personal and work accounts",
    iconSlug: "microsoft",
  },
  {
    id: "authy",
    name: "Authy",
    description: "Multi-device and backups",
    iconSlug: "authy",
  },
  {
    id: "onepassword",
    name: "1Password",
    description: "Built-in OTP in your password manager",
    iconSlug: "1password",
  },
] as const

function AuthenticatorBrandIcon({
  iconSlug,
  name,
}: {
  iconSlug: string
  name: string
}) {
  const [failed, setFailed] = useState(false)
  const initial = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 1) || "?"

  if (failed) {
    return (
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border/60"
        aria-hidden
      >
        {initial}
      </div>
    )
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50 ring-1 ring-border/60">
      <img
        src={simpleIconSvgUrl(iconSlug)}
        alt=""
        className="h-5 w-5 object-contain dark:invert"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

const timeZoneOptions = [
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "UTC", label: "UTC" },
] as const

const catalogQuickFill: { label: string; value: string }[] = [
  { label: "Shopify", value: "Shopify storefront catalog (connect in Integrations for automatic sync)" },
  { label: "Google Merchant Center", value: "Google Merchant Center product feed" },
  { label: "Custom XML / CSV", value: "Custom product feed (XML or CSV URL)" },
  { label: "Amazon", value: "Amazon Seller Central catalog" },
]

type ApiKeyRow = { id: string; name: string; masked: string; lastUsed: string }

function generateApiSecret(): string {
  const chars = "0123456789abcdef"
  let tail = ""
  for (let i = 0; i < 32; i++) tail += chars[Math.floor(Math.random() * 16)]
  return `cb_live_${tail}`
}

function maskSecret(secret: string): string {
  const last4 = secret.slice(-4)
  return `cb_live_••••••••••••••••${last4}`
}

const initialApiKeys: ApiKeyRow[] = [
  {
    id: "1",
    name: "Production",
    masked: "cb_live_••••••••••••••••8f2a",
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    name: "Staging / CI",
    masked: "cb_test_••••••••••••••••a91b",
    lastUsed: "3 days ago",
  },
]

const currentMediaPlan = getMediaPlan(CURRENT_PLAN_ID)!
const allMediaPlansCatalog = buildPlanCatalog(CURRENT_PLAN_ID)

const SETTINGS_MAIN_TABS = new Set([
  "profile",
  "company",
  "billing",
  "api-keys",
  "notifications",
  "memory",
  "integrations",
  "security",
])

export function AccountSettings() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const rawTab = searchParams.get("tab") || "profile"
  const tab = SETTINGS_MAIN_TABS.has(rawTab) ? rawTab : "profile"

  useEffect(() => {
    if (searchParams.get("tab") === "team") {
      navigate("/settings/team", { replace: true })
    }
  }, [searchParams, navigate])

  const skipApiKeyCloseConfirmRef = useRef(false)
  const [billingDialogOpen, setBillingDialogOpen] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [apiKeyStep, setApiKeyStep] = useState<"name" | "secret">("name")
  const [newKeyNameInput, setNewKeyNameInput] = useState("")
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null)
  const [savedKeyAck, setSavedKeyAck] = useState(false)
  const [totpSetupOpen, setTotpSetupOpen] = useState(false)
  const [selectedAuthenticator, setSelectedAuthenticator] = useState<string | null>(null)

  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>(initialApiKeys)
  const [notificationPrefs, setNotificationPrefs] = useState({
    campaignAlerts: true,
    aiPresence: true,
    weeklyDigest: true,
    productUpdates: true,
  })

  const [aerisMemoryEnabled, setAerisMemoryEnabled] = useState(true)
  const [memoryFacts, setMemoryFacts] = useState<
    { id: string; text: string; updatedAt: string }[]
  >([
    {
      id: "1",
      text: "Primary catalog is athletic apparel; paid ROAS goal is roughly 4×.",
      updatedAt: "May 8, 2026",
    },
    {
      id: "2",
      text: "Reporting and budgets are preferred in USD, with weekly summaries.",
      updatedAt: "May 4, 2026",
    },
  ])

  const [companyName, setCompanyName] = useState(() => getCompanyProfile().companyName)
  const [website, setWebsite] = useState(() => getCompanyProfile().website)
  const [country, setCountry] = useState(() => getCompanyProfile().country ?? "")
  const [city, setCity] = useState(() => getCompanyProfile().city ?? "")
  const [catalogSource, setCatalogSource] = useState(
    () => getCompanyProfile().catalogSource ?? ""
  )
  const [primaryEmail, setPrimaryEmail] = useState(
    () => getCompanyProfile().primaryEmail ?? ""
  )
  const [industry, setIndustry] = useState(() => getCompanyProfile().industry ?? "")
  const [industryOther, setIndustryOther] = useState(() => getCompanyProfile().industryOther ?? "")
  const [companySize, setCompanySize] = useState(() => getCompanyProfile().companySize ?? "")
  const [timeZone, setTimeZone] = useState(() => getCompanyProfile().timeZone ?? "")

  function handleDeleteApiKey(id: string) {
    setApiKeys((keys) => keys.filter((k) => k.id !== id))
  }

  function openCreateApiKeyDialog() {
    setApiKeyStep("name")
    setNewKeyNameInput("")
    setRevealedSecret(null)
    setSavedKeyAck(false)
    setApiKeyDialogOpen(true)
  }

  function handleApiKeyDialogOpenChange(open: boolean) {
    if (!open) {
      if (
        !skipApiKeyCloseConfirmRef.current &&
        apiKeyStep === "secret" &&
        revealedSecret
      ) {
        const ok = window.confirm(
          "You will not be able to see this secret again. Close without adding this key to your active keys?"
        )
        if (!ok) return
      }
      skipApiKeyCloseConfirmRef.current = false
      setApiKeyDialogOpen(false)
      setApiKeyStep("name")
      setRevealedSecret(null)
      setSavedKeyAck(false)
      setNewKeyNameInput("")
    } else {
      setApiKeyDialogOpen(true)
    }
  }

  function handleSubmitApiKeyName() {
    const name = newKeyNameInput.trim()
    if (!name) return
    setRevealedSecret(generateApiSecret())
    setApiKeyStep("secret")
    setSavedKeyAck(false)
  }

  function handleFinishApiKey() {
    if (!revealedSecret || !savedKeyAck || !newKeyNameInput.trim()) return
    setApiKeys((keys) => [
      {
        id: `gen-${Date.now()}`,
        name: newKeyNameInput.trim(),
        masked: maskSecret(revealedSecret),
        lastUsed: "Never",
      },
      ...keys,
    ])
    handleApiKeyDialogOpenChange(false)
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard?.writeText(text)
  }

  const selectedAuthLabel =
    authenticatorApps.find((a) => a.id === selectedAuthenticator)?.name ?? "your app"

  function handleSaveCompany() {
    saveCompanyProfile({
      companyName,
      website,
      primaryEmail,
      industry,
      industryOther: industry === "Other" ? industryOther.trim() || undefined : undefined,
      companySize,
      timeZone,
      country,
      city,
      catalogSource,
    })
  }

  return (
    <>
      <div className="py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, billing, API keys, Aeris memory, and integrations.
        </p>
      </div>

      <Tabs value={tab} orientation="vertical" className="w-full gap-4 md:gap-8">
        <SettingsTabNav />

        <TabsContent value="profile" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your personal information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
                <Button variant="outline" size="sm" className="sm:ml-auto">
                  Change Photo
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-first">
                    First name
                  </label>
                  <Input id="profile-first" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-last">
                    Last name
                  </label>
                  <Input id="profile-last" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-email">
                    Email
                  </label>
                  <Input id="profile-email" type="email" defaultValue={currentUser.email} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="profile-phone">
                    Phone
                  </label>
                  <Input id="profile-phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <Button type="button">Save profile</Button>
            </CardContent>
          </Card>
          <ThemeAppearanceCard />
        </TabsContent>

        <TabsContent value="company" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company details</CardTitle>
              <CardDescription>
                Legal or brand name, public site, and a contact email for billing and product notices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium" htmlFor="company-name">
                    Company name
                  </label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company-website">
                    Website
                  </label>
                  <Input
                    id="company-website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company-primary-email">
                    Primary email
                  </label>
                  <Input
                    id="company-primary-email"
                    type="email"
                    value={primaryEmail}
                    onChange={(e) => setPrimaryEmail(e.target.value)}
                    placeholder="billing@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business & defaults</CardTitle>
              <CardDescription>
                Used for reporting segments, AI context, and regional defaults in the app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company-industry">
                    Industry
                  </label>
                  <Select
                    value={industry || undefined}
                    onValueChange={(v) => {
                      setIndustry(v ?? "")
                      if (v !== "Other") setIndustryOther("")
                    }}
                  >
                    <SelectTrigger id="company-industry" className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company-size">
                    Company size
                  </label>
                  <Select
                    value={companySize || undefined}
                    onValueChange={(v) => setCompanySize(v ?? "")}
                  >
                    <SelectTrigger id="company-size" className="w-full">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {industry === "Other" && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor="company-industry-other">
                      Describe your industry
                    </label>
                    <Input
                      id="company-industry-other"
                      value={industryOther}
                      onChange={(e) => setIndustryOther(e.target.value)}
                      placeholder="e.g. Industrial supplies, B2B SaaS for logistics…"
                      autoComplete="off"
                    />
                  </div>
                )}
                <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                  <label className="text-sm font-medium" htmlFor="company-timezone">
                    Time zone
                  </label>
                  <Select value={timeZone || undefined} onValueChange={(v) => setTimeZone(v ?? "")}>
                    <SelectTrigger id="company-timezone" className="w-full">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZoneOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
              <CardDescription>
                Country and city for regional defaults. Type in each field to filter the list, then pick a
                match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company-country">
                    Country
                  </label>
                  <LocationCombobox
                    id="company-country"
                    ariaLabel="Company country"
                    options={COUNTRIES}
                    value={country}
                    onValueChange={setCountry}
                    placeholder="Search countries…"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company-city">
                    City
                  </label>
                  <LocationCombobox
                    id="company-city"
                    ariaLabel="Company city"
                    options={CITIES}
                    value={city}
                    onValueChange={setCity}
                    placeholder="Search cities…"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product catalog source</CardTitle>
              <CardDescription>Optional. Describe where your sellable catalog lives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use this for AI context, campaign defaults, and onboarding when you are not using a live
                integration. If you connect a store under{" "}
                <Link
                  to="/settings?tab=integrations"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Integrations
                </Link>
                , that connection is treated as primary and you can leave this blank or add notes.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="w-full text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Quick fill
                </span>
                {catalogQuickFill.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCatalogSource(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Textarea
                id="catalog-source"
                value={catalogSource}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setCatalogSource(e.target.value)
                }
                placeholder="e.g. Google Merchant Center feed URL, Shopify (manual), partner XML endpoint…"
                rows={3}
                className="resize-y min-h-[72px]"
              />
              <p className="text-xs text-muted-foreground">
                Tip: For automated sync, open{" "}
                <Link to="/settings?tab=integrations" className="text-foreground underline-offset-4 hover:underline">
                  Integrations
                </Link>{" "}
                and connect your storefront or feed—no need to duplicate details here.
              </p>
            </CardContent>
          </Card>

          <Button type="button" onClick={handleSaveCompany}>
            Save company profile
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Choose how you hear about campaigns, AI visibility, and product news.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(
                [
                  {
                    key: "campaignAlerts" as const,
                    label: "Campaign alerts",
                    description: "Performance changes and issues",
                  },
                  {
                    key: "aiPresence" as const,
                    label: "AI Visibility updates",
                    description: "Visibility changes and opportunities",
                  },
                  {
                    key: "weeklyDigest" as const,
                    label: "Weekly digest",
                    description: "Summary of your performance",
                  },
                  {
                    key: "productUpdates" as const,
                    label: "Product updates",
                    description: "New features and improvements",
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={notificationPrefs[item.key]}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs((p) => ({ ...p, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" aria-hidden />
                Aeris memory
              </CardTitle>
              <CardDescription>
                Control whether Aeris keeps long-term context from your conversations. You can review or delete
                individual facts at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">Use saved context in new chats</p>
                  <p className="text-xs text-muted-foreground">
                    When on, Aeris can use the facts below in new chats. When off, context stays session-only until you
                    turn memory back on.
                  </p>
                </div>
                <Switch checked={aerisMemoryEnabled} onCheckedChange={setAerisMemoryEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved facts</CardTitle>
              <CardDescription>
                Derived from chats and edits you have confirmed. Removing a fact updates what Aeris can reference
                next time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!aerisMemoryEnabled && (
                <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  Memory is turned off. Turn it on above to use these facts in new conversations.
                </p>
              )}
              {memoryFacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved facts yet.</p>
              ) : (
                <ul className="space-y-2" role="list">
                  {memoryFacts.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/20 p-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm text-foreground">{m.text}</p>
                        <p className="text-xs text-muted-foreground">Updated {m.updatedAt}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove memory: ${m.text.slice(0, 48)}${m.text.length > 48 ? "…" : ""}`}
                        onClick={() => setMemoryFacts((rows) => rows.filter((r) => r.id !== m.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={memoryFacts.length === 0}
                  onClick={() => {
                    if (memoryFacts.length === 0) return
                    const ok = window.confirm("Remove all saved memory facts for this workspace?")
                    if (ok) setMemoryFacts([])
                  }}
                >
                  Clear all facts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current plan
              </p>
              <CardTitle className="text-2xl font-semibold">{currentMediaPlan.name}</CardTitle>
              <CardDescription className="text-pretty">{currentMediaPlan.tagline}</CardDescription>
              <p className="text-sm text-muted-foreground">{planBulletsLine(currentMediaPlan)}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Monthly spend
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {currentMediaPlan.priceDisplay}
                </p>
                <p className="text-xs text-muted-foreground">Billed monthly</p>
              </div>
              <Button variant="outline" type="button" onClick={() => setBillingDialogOpen(true)}>
                Manage billing
              </Button>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-3 text-sm font-medium">All plans</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              No lock-in. No minimums after onboarding. Scale from free to enterprise as you grow.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {allMediaPlansCatalog.map((plan) => (
                <Card key={plan.id} className={plan.relation === "current" ? "ring-2 ring-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {plan.relation === "current" && <Badge>Current</Badge>}
                    </div>
                    <CardDescription className="text-foreground">
                      <span className="text-lg font-semibold tabular-nums">{plan.priceDisplay}</span>
                      {plan.period}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                    <ul className="space-y-1">
                      {plan.highlights.map((h) => (
                        <li key={h} className="text-xs text-muted-foreground">
                          &bull; {h}
                        </li>
                      ))}
                    </ul>
                    {plan.relation === "current" && (
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        Current plan
                      </Button>
                    )}
                    {plan.relation === "upgrade" && (
                      <Button size="sm" type="button" className="w-full">
                        {plan.id === "enterprise" ? "Contact sales" : `Upgrade to ${plan.name}`}
                      </Button>
                    )}
                    {plan.relation === "downgrade" && (
                      <Button size="sm" variant="outline" type="button" className="w-full">
                        Downgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base">API keys</CardTitle>
                <CardDescription>
                  Programmatic access to Commercebase APIs. Full secret is shown only once when you
                  create a key—store it safely.
                </CardDescription>
              </div>
              <Button type="button" onClick={openCreateApiKeyDialog}>
                Generate new key
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Active keys</p>
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No API keys yet. Generate one above.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border">
                    {apiKeys.map((key) => (
                      <li
                        key={key.id}
                        className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{key.name}</p>
                          <Input
                            readOnly
                            value={key.masked}
                            className="mt-1 font-mono text-xs"
                            aria-label={`Masked key for ${key.name}`}
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Last used: {key.lastUsed}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteApiKey(key.id)}
                            aria-label={`Delete key ${key.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Access</CardTitle>
              <CardDescription>Build custom integrations with our API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Developer API</p>
                  <p className="text-sm text-muted-foreground">
                    Access the CommerceBase API for custom integrations
                  </p>
                </div>
                <Button type="button" variant="outline" className="shrink-0">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0 min-w-0 flex-1 space-y-4">
          <Card size="sm" className="gap-3 py-3">
            <CardHeader className="px-3 pb-0 pt-0">
              <CardTitle className="text-sm font-medium">Password</CardTitle>
              <CardDescription className="text-xs">Change your sign-in password.</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="pw-current">
                      Current
                    </label>
                    <Input
                      id="pw-current"
                      type="password"
                      autoComplete="current-password"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="pw-new">
                      New
                    </label>
                    <Input id="pw-new" type="password" autoComplete="new-password" className="h-8" />
                  </div>
                </div>
                <Button type="button" variant="secondary" size="sm" className="w-full shrink-0 sm:w-auto">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Two-factor authentication</CardTitle>
              <CardDescription>
                Choose which authenticator app you will use, then continue to scan a QR code and enter
                6-digit codes at sign-in. This is separate from face or fingerprint unlock—those are
                covered under passkeys below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium">Authenticator app (TOTP)</p>
                <p className="text-xs text-muted-foreground">
                  Select the app you will use. Each option opens the same QR setup flow in your chosen
                  app.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {authenticatorApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedAuthenticator(app.id)}
                      className={cn(
                        "flex gap-3 rounded-lg border p-3 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selectedAuthenticator === app.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <AuthenticatorBrandIcon iconSlug={app.iconSlug} name={app.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  disabled={!selectedAuthenticator}
                  onClick={() => setTotpSetupOpen(true)}
                >
                  Continue setup
                </Button>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border/80 pt-6">
                <div>
                  <p className="text-sm font-medium">Passkeys & device sign-in</p>
                  <p className="text-xs text-muted-foreground">
                    Face ID, Touch ID, or Windows Hello can unlock a passkey for passwordless sign-in.
                    Optional; works alongside or instead of an authenticator depending on policy.
                  </p>
                </div>
                <Switch defaultChecked={false} disabled aria-label="Enable passkeys" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Assistant</CardTitle>
              <CardDescription>
                Policies for what the AI can access and automate in your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/settings/ai-permissions"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">AI Assistant Permissions</p>
                  <p className="text-xs text-muted-foreground">Scopes, tools, and data access</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
              <CardDescription>Irreversible actions for your workspace account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" type="button">
                Delete account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-0 min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Integrations</h2>
              <p className="text-sm text-muted-foreground">
                Connect CommerceBase with stores, feeds, and analytics—separate from API keys and AI policy.
              </p>
            </div>
            <IntegrationsHubContent />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Billing & payment</DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                Commercebase uses{" "}
                <span className="font-medium text-foreground">Stripe</span> for subscriptions and
                invoicing. In production, &quot;Manage billing&quot; calls Stripe&apos;s{" "}
                <span className="font-medium text-foreground">Billing Portal</span> API (
                <code className="rounded bg-muted px-1 py-0.5 text-[0.75rem] text-foreground">
                  POST /v1/billing_portal/sessions
                </code>
                ) with your Stripe Customer ID. Stripe returns a{" "}
                <span className="font-medium text-foreground">short-lived URL</span> to a Stripe-hosted
                page where customers update payment methods, download invoices, and manage
                subscriptions—features you enable in the Stripe Dashboard.
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                After changes, Stripe sends webhooks (e.g.{" "}
                <span className="font-medium text-foreground">customer.subscription.updated</span>) so
                your app stays in sync. Sessions are created on demand and expire for security.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Default payment method
              </p>
              <p className="mt-1 font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12 / 2028</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Next invoice
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{currentMediaPlan.priceDisplay}.00</p>
              <p className="text-xs text-muted-foreground">
                Due Feb 1, 2026 · {currentMediaPlan.name} (media package)
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setBillingDialogOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() =>
                window.open(
                  "https://docs.stripe.com/customer-management/integrate-customer-portal",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe portal integration docs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={apiKeyDialogOpen} onOpenChange={handleApiKeyDialogOpenChange}>
        <DialogContent className="sm:max-w-lg">
          {apiKeyStep === "name" ? (
            <>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Name this key so you can revoke it later (e.g. &quot;Production API&quot;,
                  &quot;GitHub Actions&quot;). The secret is shown only on the next step—same pattern as
                  Google Cloud and Figma.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <label className="text-sm font-medium" htmlFor="api-key-name">
                  Key name
                </label>
                <Input
                  id="api-key-name"
                  value={newKeyNameInput}
                  onChange={(e) => setNewKeyNameInput(e.target.value)}
                  placeholder="e.g. Production backend"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleApiKeyDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmitApiKeyName} disabled={!newKeyNameInput.trim()}>
                  Create key
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Save your API key</DialogTitle>
                <DialogDescription>
                  Copy your secret now. You will not be able to see it again after you close this
                  dialog.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100">
                  Make sure you have saved this key somewhere safe. If you lose it, revoke this key and
                  create a new one.
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Your secret key</span>
                  <Input readOnly className="font-mono text-xs" value={revealedSecret ?? ""} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => revealedSecret && copyToClipboard(revealedSecret)}
                >
                  Copy key
                </Button>
                <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 rounded border-input"
                    checked={savedKeyAck}
                    onChange={(e) => setSavedKeyAck(e.target.checked)}
                  />
                  <span>I have copied and stored this key in a secure place.</span>
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleApiKeyDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleFinishApiKey} disabled={!savedKeyAck}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={totpSetupOpen} onOpenChange={setTotpSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up {selectedAuthLabel}</DialogTitle>
            <DialogDescription>
              In production, we display a QR code and a manual entry key. Scan with {selectedAuthLabel},
              then enter the 6-digit code to verify.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-2">
            <div
              className="flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/50 text-xs text-muted-foreground"
              aria-hidden
            >
              QR code
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Can&apos;t scan? Use the setup key shown in your authenticator app flow.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTotpSetupOpen(false)}>
              Close
            </Button>
            <Button type="button" disabled>
              Verify code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
