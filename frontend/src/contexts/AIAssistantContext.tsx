import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { getMockResponse } from "@/lib/assistant-mock"

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
  addMessage: (content: string, role: MessageRole) => void
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
      "Create a new campaign",
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

function getPageContext(pathname: string): { name: string; questions: string[] } {
  const exactMatch = pageContextMap[pathname]
  if (exactMatch) return exactMatch

  const baseMatch = Object.entries(pageContextMap).find(([key]) => 
    pathname.startsWith(key) && key !== "/"
  )
  if (baseMatch) return baseMatch[1]

  return pageContextMap["/"]
}

interface AIAssistantProviderProps {
  children: ReactNode
}

const MIN_PANEL_WIDTH = 320
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 400

export function AIAssistantProvider({ children }: AIAssistantProviderProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>(["view"])
  const loadingLock = useRef(false)

  const pageContext = getPageContext(location.pathname)

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const addMessage = useCallback((content: string, role: MessageRole) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }, [])

  const sendAssistantQuery = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || loadingLock.current) return
    loadingLock.current = true
    addMessage(trimmed, "user")
    setIsOpen(true)
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      addMessage(getMockResponse(trimmed), "assistant")
    } finally {
      setIsLoading(false)
      loadingLock.current = false
    }
  }, [addMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
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
  }

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  )
}
