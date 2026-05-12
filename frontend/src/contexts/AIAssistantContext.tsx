import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  AERIS_EXAMPLE_PROMPT_GROUPS,
  type AerisExamplePromptGroup,
} from "@/lib/aeris-example-prompts"
import { getMockResponse } from "@/lib/assistant-mock"
import {
  CAMPAIGN_WIZARD_AI_DRAFT_KEY,
  tryBuildAiCampaignCopy,
} from "@/lib/campaign-ai-copy-mock"
import { generateCampaignFromPrompt } from "@/lib/campaign-brief-mock"
import { addLaunchedCampaign } from "@/lib/campaign-storage"

export type MessageRole = "user" | "assistant"

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  actions?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "destructive"
  }[]
}

export type Permission = "view" | "campaigns" | "budgets" | "catalog" | "publishers"

interface AIAssistantContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleOpen: () => void
  /** GA4-style NL: send from global search without using the panel composer. */
  sendAssistantQuery: (content: string) => Promise<void>
  panelWidth: number
  setPanelWidth: (width: number) => void
  messages: Message[]
  addMessage: (
    content: string,
    role: MessageRole,
    options?: Pick<Message, "actions">
  ) => void
  clearMessages: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  permissions: Permission[]
  grantPermission: (permission: Permission) => void
  revokePermission: (permission: Permission) => void
  hasPermission: (permission: Permission) => boolean
  currentContext: {
    page: string
    entityId?: string
  }
  suggestedQuestions: string[]
  examplePromptGroups: AerisExamplePromptGroup[]
  /** Opens the panel and pre-fills the composer (user can edit before sending). */
  openPanelWithComposerText: (text: string) => void
  pendingComposerText: string | null
  clearPendingComposerText: () => void
}

const AIAssistantContext = createContext<AIAssistantContextType | null>(null)

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (!context) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider")
  }
  return context
}

const pageContextMap: Record<string, { name: string; questions: string[] }> = {
  "/": {
    name: "Home",
    questions: [
      "How are my campaigns performing?",
      "What needs my attention today?",
      "Why is ROAS below target?",
    ],
  },
  "/campaigns": {
    name: "Campaigns",
    questions: [
      "Which campaign has the best CVR?",
      "Copy my best-performing campaign with a higher daily budget",
      "Pause underperforming campaigns",
    ],
  },
  "/ai-presence": {
    name: "AI Visibility",
    questions: [
      "Why am I not showing up in ChatGPT?",
      "How do I improve merchant checkout share?",
      "Compare me to competitors",
    ],
  },
  "/analytics": {
    name: "Analytics",
    questions: [
      "Show me revenue trends",
      "Which channel performs best?",
      "Compare this week to last week",
    ],
  },
  "/products": {
    name: "Products",
    questions: [
      "Which products convert best?",
      "Are there any sync issues?",
      "Optimize product descriptions",
    ],
  },
  "/settings": {
    name: "Settings",
    questions: [
      "What permissions does AI have?",
      "How do I connect Shopify?",
      "Update my notification settings",
    ],
  },
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

function getPageContext(pathname: string): { name: string; questions: string[] } {
  const p = normalizePathname(pathname)
  const exactMatch = pageContextMap[p]
  if (exactMatch) return exactMatch

  const baseMatch = Object.entries(pageContextMap).find(([key]) => 
    p.startsWith(key) && key !== "/"
  )
  if (baseMatch) return baseMatch[1]

  return pageContextMap["/"]
}

function isCampaignCreationIntent(text: string): boolean {
  const lower = text.toLowerCase()
  const intentPatterns = [
    /\b(create|launch|start|build|plan|draft|set up|kick off|begin)\b.*\b(campaign|content program|marketing|advertising|promotion)\b/,
    /\bcampaign\b.*\b(create|launch|start|build|plan)\b/,
    /\bget started\b.*\bcampaign\b/,
    /\bfirst campaign\b/,
    /\bnew campaign\b/,
    /\bgrow\b.*\baudience\b/,
    /\bthought leadership\b/,
    /\bcontent\b.*\b(strategy|plan|calendar|program)\b/,
    /\bdrive\b.*\b(sales|revenue|traffic|awareness)\b/,
    /\bboost\b.*\b(sales|revenue|visibility|awareness)\b/,
  ]
  return intentPatterns.some((p) => p.test(lower))
}

interface AIAssistantProviderProps {
  children: ReactNode
}

const MIN_PANEL_WIDTH = 320
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 400

export function AIAssistantProvider({ children }: AIAssistantProviderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>(["view"])
  const [pendingComposerText, setPendingComposerText] = useState<string | null>(null)
  const loadingLock = useRef(false)

  const pageContext = getPageContext(location.pathname)

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const addMessage = useCallback(
    (content: string, role: MessageRole, options?: Pick<Message, "actions">) => {
      const message: Message = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
        ...options,
      }
      setMessages((prev) => [...prev, message])
    },
    []
  )

  const sendAssistantQuery = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || loadingLock.current) return
      loadingLock.current = true
      addMessage(trimmed, "user")
      setIsOpen(true)
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const copyResult = tryBuildAiCampaignCopy(trimmed, location.pathname)
        if (copyResult.matched) {
          const draftSnapshot = copyResult.draft
          addMessage(copyResult.summary, "assistant", {
            actions: [
              {
                label: "Open copy in wizard",
                variant: "default",
                onClick: () => {
                  try {
                    sessionStorage.setItem(
                      CAMPAIGN_WIZARD_AI_DRAFT_KEY,
                      JSON.stringify(draftSnapshot)
                    )
                  } catch {
                    /* ignore quota / private mode */
                  }
                  navigate("/campaigns?create=1")
                  setIsOpen(false)
                },
              },
            ],
          })
          return
        }

        const campaignIntent = isCampaignCreationIntent(trimmed)
        if (campaignIntent) {
          addMessage("Listed memory contents.\n\nRead \u{1F310} Brand Profile , \u{1F310} ICP , \u{1F310} Messaging & Positioning\n\nGreat context — I have everything I need from memory. Let me activate the campaign skill and build this out.", "assistant")
          await new Promise((resolve) => setTimeout(resolve, 1500))
          const { campaign, responseText } = generateCampaignFromPrompt(trimmed, "CommerceBase")
          addLaunchedCampaign(campaign)
          addMessage(responseText, "assistant", {
            actions: [
              {
                label: "View campaign",
                variant: "default",
                onClick: () => {
                  navigate(`/campaigns/${campaign.id}`)
                  setIsOpen(false)
                },
              },
            ],
          })
          return
        }

        addMessage(getMockResponse(trimmed), "assistant")
      } finally {
        setIsLoading(false)
        loadingLock.current = false
      }
    },
    [addMessage, location.pathname, navigate]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const clearPendingComposerText = useCallback(() => {
    setPendingComposerText(null)
  }, [])

  const openPanelWithComposerText = useCallback((text: string) => {
    setPendingComposerText(text)
    setIsOpen(true)
  }, [])

  const grantPermission = useCallback((permission: Permission) => {
    setPermissions((prev) => 
      prev.includes(permission) ? prev : [...prev, permission]
    )
  }, [])

  const revokePermission = useCallback((permission: Permission) => {
    setPermissions((prev) => prev.filter((p) => p !== permission))
  }, [])

  const hasPermission = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘/ / Ctrl+/ — toggles Aeris (two keys; ⌘K is search in GlobalSearchProvider).
      if (e.repeat) return
      if (
        (e.metaKey || e.ctrlKey) &&
        e.code === "Slash" &&
        !e.shiftKey &&
        !e.altKey
      ) {
        e.preventDefault()
        toggleOpen()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleOpen])

  const handleSetPanelWidth = useCallback((width: number) => {
    setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width)))
  }, [])

  const value: AIAssistantContextType = {
    isOpen,
    setIsOpen,
    toggleOpen,
    sendAssistantQuery,
    panelWidth,
    setPanelWidth: handleSetPanelWidth,
    messages,
    addMessage,
    clearMessages,
    isLoading,
    setIsLoading,
    permissions,
    grantPermission,
    revokePermission,
    hasPermission,
    currentContext: {
      page: pageContext.name,
      entityId: undefined,
    },
    suggestedQuestions: pageContext.questions,
    examplePromptGroups: AERIS_EXAMPLE_PROMPT_GROUPS,
    openPanelWithComposerText,
    pendingComposerText,
    clearPendingComposerText,
  }

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  )
}
