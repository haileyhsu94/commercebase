import { useState, useRef, useEffect, useCallback } from "react"
import {
  Plus,
  Wand2,
  BarChart3,
  Eye,
  FileText,
  Package,
  Send,
  Loader2,
  Pencil,
  Check,
  X,
  Rocket,
  Save,
  ExternalLink,
} from "lucide-react"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { currentUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  addLaunchedCampaign,
  makeNewCampaignRow,
} from "@/lib/campaign-storage"
import {
  TARGET_MARKET_OPTIONS,
  CAMPAIGN_OBJECTIVE_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  type CampaignWizardFormData,
  initialCampaignWizardForm,
} from "@/types/campaign-wizard"

/* ------------------------------------------------------------------ */
/*  Suggestion cards (Gemini-style)                                    */
/* ------------------------------------------------------------------ */

const suggestionCards = [
  {
    text: "Create a new campaign to drive sales for my store",
    icon: Wand2,
    color: "text-indigo-500",
  },
  {
    text: "Analyze my campaign performance and suggest improvements",
    icon: BarChart3,
    color: "text-emerald-500",
  },
  {
    text: "Check my AI visibility and find missed opportunities",
    icon: Eye,
    color: "text-amber-500",
  },
  {
    text: "Generate a report on revenue trends this month",
    icon: FileText,
    color: "text-blue-500",
  },
]

const quickActions = [
  { label: "Create Campaign", icon: Wand2 },
  { label: "Analyze", icon: BarChart3 },
  { label: "AI Visibility", icon: Eye },
  { label: "Reports", icon: FileText },
  { label: "Catalog", icon: Package },
]

/* ------------------------------------------------------------------ */
/*  Campaign conversation types                                        */
/* ------------------------------------------------------------------ */

type ConversationStep =
  | "idle"
  | "thinking"
  | "questions"
  | "waiting_answers"
  | "processing"
  | "plan"
  | "creating"
  | "done"

interface CampaignAnswers {
  objective: string
  storeUrl: string
  budget: string
  targetMarket: string
  campaignType: string
  maxCpc: string
  startDate: string
  endDate: string
  conversionGoal: string
  other: string
}

const emptyAnswers: CampaignAnswers = {
  objective: "",
  storeUrl: "",
  budget: "",
  targetMarket: "",
  campaignType: "",
  maxCpc: "",
  startDate: "",
  endDate: "",
  conversionGoal: "",
  other: "",
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const CONVERSION_GOAL_OPTIONS = [
  "Purchases",
  "Add to cart",
  "Sign-ups",
  "Page views",
  "Lead form submissions",
]

/* ------------------------------------------------------------------ */
/*  Campaign detail panel (right-side expandable)                      */
/* ------------------------------------------------------------------ */

interface CampaignPlan {
  name: string
  objective: string
  campaignType: string
  budget: string
  targetMarket: string
  maxCpc: string
  startDate: string
  endDate: string
  conversionGoal: string
  storeUrl: string
  channels: string[]
  estimatedReach: string
  estimatedClicks: string
  estimatedConversions: string
}

function CampaignDetailPanel({
  plan,
  onClose,
  onSave,
  onPublish,
  onFieldChange,
}: {
  plan: CampaignPlan
  onClose: () => void
  onSave: () => void
  onPublish: () => void
  onFieldChange: (field: keyof CampaignPlan, value: string) => void
}) {
  const [editField, setEditField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const startEdit = (field: string, currentValue: string) => {
    setEditField(field)
    setEditValues({ ...editValues, [field]: currentValue })
  }

  const saveEdit = (field: keyof CampaignPlan) => {
    const newValue = editValues[field]
    if (newValue != null) {
      onFieldChange(field, newValue)
    }
    setEditField(null)
  }

  const cancelEdit = () => setEditField(null)

  const renderField = (label: string, field: keyof CampaignPlan, value: string) => (
    <div className="group flex items-start justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {editField === field ? (
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type={field === "startDate" || field === "endDate" ? "date" : "text"}
              value={editValues[field] ?? value}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              autoFocus
            />
            <button type="button" onClick={() => saveEdit(field)} className="text-green-600 hover:text-green-700">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-foreground">{value || "—"}</p>
        )}
      </div>
      {editField !== field && (
        <button
          type="button"
          onClick={() => startEdit(field, value)}
          className="mt-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  )

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Campaign Details</h3>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        <div className="space-y-0.5">
          {renderField("Campaign Name", "name", plan.name)}
          {renderField("Objective", "objective", plan.objective)}
          {renderField("Campaign Type", "campaignType", plan.campaignType)}
          {renderField("Budget", "budget", plan.budget)}
          {renderField("Target Market", "targetMarket", plan.targetMarket)}
          {renderField("Max CPC", "maxCpc", plan.maxCpc)}
          {renderField("Start Date", "startDate", plan.startDate)}
          {renderField("End Date", "endDate", plan.endDate)}
          {renderField("Conversion Goal", "conversionGoal", plan.conversionGoal)}
          {renderField("Store URL", "storeUrl", plan.storeUrl)}
        </div>

        <div className="mt-4 border-t border-border px-3 pt-4">
          <p className="text-xs font-medium text-muted-foreground">Channels</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {plan.channels.map((ch) => (
              <span key={ch} className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-foreground">
                {ch}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-border px-3 pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Estimated Performance</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-center">
              <p className="text-lg font-semibold text-foreground">{plan.estimatedReach}</p>
              <p className="text-[10px] text-muted-foreground">Reach</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-center">
              <p className="text-lg font-semibold text-foreground">{plan.estimatedClicks}</p>
              <p className="text-[10px] text-muted-foreground">Clicks</p>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-center">
              <p className="text-lg font-semibold text-foreground">{plan.estimatedConversions}</p>
              <p className="text-[10px] text-muted-foreground">Conversions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onSave}>
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </Button>
        <Button size="sm" className="flex-1 gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={onPublish}>
          <Rocket className="h-3.5 w-3.5" />
          Publish
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AIHomeView() {
  const { sendAssistantQuery, setIsOpen } = useAIAssistant()
  const [input, setInput] = useState("")
  const [conversationStep, setConversationStep] = useState<ConversationStep>("idle")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [answers, setAnswers] = useState<CampaignAnswers>(emptyAnswers)
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const firstName = currentUser.name.split(" ")[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, conversationStep])

  const addChatMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: new Date() },
    ])
  }, [])

  const isCampaignIntent = (text: string): boolean => {
    const lower = text.toLowerCase()
    return (
      lower.includes("create") && (lower.includes("campaign") || /\bad\b/.test(lower)) ||
      lower.includes("launch") && lower.includes("campaign") ||
      lower.includes("new campaign") ||
      lower.includes("set up") && lower.includes("campaign") ||
      lower.includes("start a campaign")
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const query = input.trim()
    setInput("")

    if (conversationStep === "idle") {
      if (isCampaignIntent(query)) {
        addChatMessage("user", query)
        setConversationStep("thinking")
        await new Promise((r) => setTimeout(r, 1500))
        addChatMessage(
          "assistant",
          "I'd love to help you create a campaign! Let me gather some details so I can put together the best plan for you.\n\nPlease fill out the information below, and feel free to skip any fields you're unsure about — I can suggest defaults."
        )
        setConversationStep("questions")
      } else {
        setIsOpen(true)
        await sendAssistantQuery(query)
      }
    }
  }

  const handleQuickAction = (label: string) => {
    if (label === "Create Campaign") {
      setInput("")
      addChatMessage("user", "Help me create a new campaign")
      setConversationStep("thinking")
      setTimeout(async () => {
        addChatMessage(
          "assistant",
          "I'd love to help you create a campaign! Let me gather some details so I can put together the best plan for you.\n\nPlease fill out the information below, and feel free to skip any fields you're unsure about — I can suggest defaults."
        )
        setConversationStep("questions")
      }, 1500)
      return
    }

    const prompts: Record<string, string> = {
      Analyze: "How are my campaigns performing?",
      "AI Visibility": "Where am I losing to competitors in AI search?",
      Reports: "Show me revenue trends for the last 28 days",
      Catalog: "Which product attributes are weakest for AI answers?",
    }
    const prompt = prompts[label] ?? `Help me with ${label}`
    setInput("")
    setIsOpen(true)
    sendAssistantQuery(prompt)
  }

  const handleSuggestionCard = (text: string) => {
    setInput(text)
  }

  const buildPlanFromAnswers = (a: CampaignAnswers): CampaignPlan => {
    const objectiveLabel =
      CAMPAIGN_OBJECTIVE_OPTIONS.find((o) => o.value === a.objective)?.label ?? a.objective
    const typeLabel =
      CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === a.campaignType)?.label ?? a.campaignType
    const marketLabel =
      TARGET_MARKET_OPTIONS.find((o) => o.value === a.targetMarket)?.label ?? a.targetMarket

    return {
      name: `${objectiveLabel} Campaign — ${marketLabel}`,
      objective: objectiveLabel,
      campaignType: typeLabel,
      budget: a.budget ? `$${a.budget}/day` : "$50/day",
      targetMarket: marketLabel,
      maxCpc: a.maxCpc ? `$${a.maxCpc}` : "$1.50",
      startDate: a.startDate || new Date().toISOString().split("T")[0]!,
      endDate:
        a.endDate ||
        new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]!,
      conversionGoal: a.conversionGoal || "Purchases",
      storeUrl: a.storeUrl || "https://example.com",
      channels: ["Google Shopping", "AI Search", "Perplexity", "ChatGPT"],
      estimatedReach: "45K",
      estimatedClicks: "2.8K",
      estimatedConversions: "142",
    }
  }

  const handleSubmitAnswers = async () => {
    const filledAnswers = Object.entries(answers)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `• ${k}: ${v}`)
      .join("\n")

    addChatMessage("user", filledAnswers || "Use defaults for everything")
    setConversationStep("processing")

    await new Promise((r) => setTimeout(r, 2000))

    const plan = buildPlanFromAnswers(answers)
    setCampaignPlan(plan)

    addChatMessage(
      "assistant",
      `Here's the campaign plan I've put together:\n\n**${plan.name}**\n• Objective: ${plan.objective}\n• Type: ${plan.campaignType}\n• Budget: ${plan.budget}\n• Market: ${plan.targetMarket}\n• Max CPC: ${plan.maxCpc}\n• Dates: ${plan.startDate} → ${plan.endDate}\n• Conversion Goal: ${plan.conversionGoal}\n• Channels: ${plan.channels.join(", ")}\n\n**Estimated Performance:**\n• Reach: ${plan.estimatedReach}\n• Clicks: ${plan.estimatedClicks}\n• Conversions: ${plan.estimatedConversions}\n\nWould you like to approve this plan, or do you have any changes?`
    )
    setConversationStep("plan")
  }

  const handleApprovePlan = async () => {
    addChatMessage("user", "Looks good, let's create it!")
    setConversationStep("creating")

    await new Promise((r) => setTimeout(r, 2500))

    if (campaignPlan) {
      const wizardSnapshot: CampaignWizardFormData = {
        ...initialCampaignWizardForm,
        name: campaignPlan.name,
        objective:
          CAMPAIGN_OBJECTIVE_OPTIONS.find(
            (o) => o.label === campaignPlan.objective
          )?.value ?? "sales",
        campaignType:
          CAMPAIGN_TYPE_OPTIONS.find(
            (o) => o.label === campaignPlan.campaignType
          )?.value ?? "performance",
        budget: campaignPlan.budget.replace(/[^0-9.]/g, ""),
        targetMarket:
          TARGET_MARKET_OPTIONS.find(
            (o) => o.label === campaignPlan.targetMarket
          )?.value ?? "global",
        maxCpc: campaignPlan.maxCpc.replace(/[^0-9.]/g, ""),
        startDate: campaignPlan.startDate,
        endDate: campaignPlan.endDate,
        conversionGoals: [campaignPlan.conversionGoal.toLowerCase().replace(/\s+/g, "_")],
      }

      const campaign = makeNewCampaignRow(
        campaignPlan.name,
        "$",
        wizardSnapshot
      )
      addLaunchedCampaign(campaign)
    }

    addChatMessage(
      "assistant",
      "Your campaign has been created successfully! 🎉\n\nYou can review and edit the details in the panel on the right. When you're ready, you can publish it directly or save it as a draft."
    )
    setConversationStep("done")
    setShowDetailPanel(true)
  }

  const handleSaveDraft = () => {
    setSavedMessage("Campaign saved as draft!")
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const handlePublish = () => {
    setSavedMessage("Campaign published successfully!")
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const isConversationActive = conversationStep !== "idle"

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-background dark:to-background">
        {/* Saved notification toast */}
        {savedMessage && (
          <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 shadow-lg dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {savedMessage}
            </div>
          </div>
        )}

        {!isConversationActive ? (
          /* ---- Idle state: Gemini-style greeting ---- */
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
            <div className="flex w-full max-w-2xl flex-col items-center gap-8">
              {/* Greeting — no icon, like Gemini */}
              <div className="text-center">
                <p className="text-lg text-muted-foreground">Hi {firstName}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  What should we do today?
                </h1>
              </div>

              {/* Suggestion cards */}
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestionCards.map((card) => (
                  <button
                    key={card.text}
                    type="button"
                    onClick={() => handleSuggestionCard(card.text)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-border bg-background p-4 text-left text-sm text-foreground shadow-sm transition-all",
                      "hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800"
                    )}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <card.icon className={cn("h-4 w-4", card.color)} />
                    </div>
                    <span className="leading-snug">{card.text}</span>
                  </button>
                ))}
              </div>

              {/* Quick action pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleQuickAction(action.label)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors",
                      "hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <form
                onSubmit={handleSubmit}
                className="w-full rounded-2xl border border-border bg-muted/30 shadow-sm transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-200/50 dark:focus-within:border-indigo-700 dark:focus-within:ring-indigo-800/50"
              >
                <div className="px-4 pt-4 pb-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Aeris anything..."
                    className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between px-3 pb-3">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Attach file"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      input.trim()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "text-muted-foreground/50"
                    )}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* ---- Conversation active: Chat interface ---- */
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Messages scroll area */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
              <div className="mx-auto max-w-2xl space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "rounded-tr-md bg-indigo-100 text-slate-900 dark:bg-indigo-950/40 dark:text-indigo-50"
                          : "bg-muted/60 text-foreground dark:bg-muted/30"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {/* Thinking indicator */}
                {(conversationStep === "thinking" || conversationStep === "processing" || conversationStep === "creating") && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground dark:bg-muted/30">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {conversationStep === "thinking" && "Thinking..."}
                      {conversationStep === "processing" && "Building your campaign plan..."}
                      {conversationStep === "creating" && "Creating your campaign..."}
                    </div>
                  </div>
                )}

                {/* Question form */}
                {conversationStep === "questions" && (
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">
                      Tell me about your campaign
                    </h3>
                    <div className="space-y-4">
                      {/* Objective */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          What do you want to achieve?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CAMPAIGN_OBJECTIVE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAnswers({ ...answers, objective: opt.value })}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                answers.objective === opt.value
                                  ? "border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-100"
                                  : "border-border bg-background text-foreground hover:bg-muted/50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Store URL */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Store website address
                        </label>
                        <input
                          type="url"
                          value={answers.storeUrl}
                          onChange={(e) => setAnswers({ ...answers, storeUrl: e.target.value })}
                          placeholder="https://yourstore.com"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                        />
                      </div>

                      {/* Budget */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Daily budget (USD)
                        </label>
                        <input
                          type="text"
                          value={answers.budget}
                          onChange={(e) => setAnswers({ ...answers, budget: e.target.value })}
                          placeholder="e.g. 50"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                        />
                      </div>

                      {/* Target Market */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Target market (country/region)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TARGET_MARKET_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAnswers({ ...answers, targetMarket: opt.value })}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                answers.targetMarket === opt.value
                                  ? "border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-100"
                                  : "border-border bg-background text-foreground hover:bg-muted/50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Campaign Type */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Campaign type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CAMPAIGN_TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAnswers({ ...answers, campaignType: opt.value })}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                answers.campaignType === opt.value
                                  ? "border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-100"
                                  : "border-border bg-background text-foreground hover:bg-muted/50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Max CPC */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Max CPC (USD)
                        </label>
                        <input
                          type="text"
                          value={answers.maxCpc}
                          onChange={(e) => setAnswers({ ...answers, maxCpc: e.target.value })}
                          placeholder="e.g. 1.50"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                        />
                      </div>

                      {/* Date range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Start date
                          </label>
                          <input
                            type="date"
                            value={answers.startDate}
                            onChange={(e) => setAnswers({ ...answers, startDate: e.target.value })}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            End date
                          </label>
                          <input
                            type="date"
                            value={answers.endDate}
                            onChange={(e) => setAnswers({ ...answers, endDate: e.target.value })}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                          />
                        </div>
                      </div>

                      {/* Conversion Goal */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Conversion goal
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {CONVERSION_GOAL_OPTIONS.map((goal) => (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => setAnswers({ ...answers, conversionGoal: goal })}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                answers.conversionGoal === goal
                                  ? "border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-100"
                                  : "border-border bg-background text-foreground hover:bg-muted/50"
                              )}
                            >
                              {goal}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Other */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Anything else? (optional)
                        </label>
                        <textarea
                          value={answers.other}
                          onChange={(e) => setAnswers({ ...answers, other: e.target.value })}
                          placeholder="Additional context, product details, audience notes..."
                          rows={2}
                          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Button
                        onClick={handleSubmitAnswers}
                        className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                        size="sm"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Submit
                      </Button>
                    </div>
                  </div>
                )}

                {/* Plan approval buttons */}
                {conversationStep === "plan" && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleApprovePlan}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                      size="sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve & Create
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConversationStep("questions")
                        addChatMessage("user", "I'd like to make some changes")
                        addChatMessage("assistant", "No problem! Update the fields below and submit again.")
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                )}

                {/* Done: view campaign button */}
                {conversationStep === "done" && !showDetailPanel && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowDetailPanel(true)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Campaign Details
                    </Button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom input (for follow-up messages during conversation) */}
            {(conversationStep === "plan" || conversationStep === "done") && (
              <div className="border-t border-border bg-background/80 px-4 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!input.trim()) return
                    addChatMessage("user", input.trim())
                    setInput("")
                    setTimeout(() => {
                      addChatMessage(
                        "assistant",
                        "I'll take note of that. Is there anything else you'd like to adjust in the campaign?"
                      )
                    }, 1000)
                  }}
                  className="mx-auto flex max-w-2xl gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 rounded-xl border border-input bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                      input.trim()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-muted text-muted-foreground/50"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right panel: Campaign details */}
      {showDetailPanel && campaignPlan && (
        <div className="w-[380px] shrink-0">
          <CampaignDetailPanel
            plan={campaignPlan}
            onClose={() => setShowDetailPanel(false)}
            onSave={handleSaveDraft}
            onPublish={handlePublish}
            onFieldChange={(field, value) => {
              setCampaignPlan((prev) =>
                prev ? { ...prev, [field]: value } : prev
              )
            }}
          />
        </div>
      )}
    </div>
  )
}
