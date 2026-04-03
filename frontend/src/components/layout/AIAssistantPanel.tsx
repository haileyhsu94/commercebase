import { useState, useRef, useEffect, useCallback } from "react"
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  GripVertical,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAIAssistant, type Message } from "@/contexts/AIAssistantContext"
import { cn } from "@/lib/utils"

function formatRelativeTime(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 45) return "a few seconds ago"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return date.toLocaleDateString()
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "flex max-w-[min(100%,20rem)] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-indigo-100 px-3 py-2 text-sm leading-relaxed text-slate-900 ring-1 ring-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-50 dark:ring-indigo-800/50">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm leading-relaxed text-slate-800 dark:text-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.actions && message.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {message.actions.map((action, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={action.variant || "outline"}
                    className="h-8 rounded-xl border-indigo-200/80 bg-white text-indigo-900 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-transparent dark:text-indigo-100 dark:hover:bg-indigo-950/40"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-[11px] text-muted-foreground">
          {isUser ? "Me" : "Aeris"} • {formatRelativeTime(message.timestamp)}
        </span>
        {!isUser && (
          <div className="flex items-center gap-0.5 opacity-60">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-6 text-muted-foreground hover:text-foreground"
              aria-label="Helpful"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-6 text-muted-foreground hover:text-foreground"
              aria-label="Not helpful"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SuggestedQuestion({ question, onClick }: { question: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-indigo-200/90 bg-white px-3 py-2 text-left text-sm text-indigo-950 transition-colors",
        "hover:bg-indigo-50/90 dark:border-indigo-800/60 dark:bg-indigo-950/25 dark:text-indigo-100 dark:hover:bg-indigo-950/45"
      )}
    >
      {question}
    </button>
  )
}

export function AIAssistantPanel() {
  const {
    isOpen,
    setIsOpen,
    panelWidth,
    setPanelWidth,
    messages,
    clearMessages,
    isLoading,
    sendAssistantQuery,
    currentContext,
    suggestedQuestions,
  } = useAIAssistant()

  const [input, setInput] = useState("")
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, setPanelWidth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    await sendAssistantQuery(userMessage)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-50 flex h-full flex-col border-l border-transparent bg-sidebar text-sidebar-foreground"
      )}
      style={{ width: panelWidth }}
    >
      <div className="flex h-full min-h-0 flex-1 flex-row">
        {/* Resize handle */}
        <div
          className={cn(
            "flex w-1.5 shrink-0 cursor-ew-resize flex-col items-center justify-center bg-sidebar transition-colors",
            isResizing ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
          )}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/70" />
        </div>

        {/* Inset chat shell */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col py-1.5 pl-0.5 pr-1">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-background">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold tracking-tight">Aeris</span>
                    <Badge
                      variant="secondary"
                      className="h-5 border border-indigo-200/90 bg-indigo-100 px-2 text-[10px] font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                    >
                      Beta
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px] text-muted-foreground">
                      ⌘/
                    </kbd>{" "}
                    to toggle
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearMessages}
                  title="Clear chat"
                  className="text-muted-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Context */}
            <div className="shrink-0 border-b border-border/50 bg-muted/15 px-3 py-1.5">
              <p className="text-[11px] text-muted-foreground">
                Viewing: <span className="font-medium text-foreground/80">{currentContext.page}</span>
              </p>
            </div>

            {/* Messages */}
            <div
              className={cn(
                "min-h-0 flex-1 overflow-auto px-3 py-3",
                messages.length === 0 && "flex flex-col justify-center"
              )}
            >
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">How can I help you?</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask about campaigns, analytics, or AI visibility.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Suggested
                    </p>
                    <div className="flex flex-col gap-2">
                      {suggestedQuestions.map((question) => (
                        <SuggestedQuestion
                          key={question}
                          question={question}
                          onClick={() => handleSuggestedQuestion(question)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        </div>
                        <div className="flex gap-1 pt-1">
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0.12s]" />
                          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0.24s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <Separator className="bg-border/60" />

            {/* Composer */}
            <form onSubmit={handleSubmit} className="shrink-0 space-y-2 p-3">
              {messages.length > 0 && suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.slice(0, 3).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSuggestedQuestion(q)}
                      className="rounded-lg border border-indigo-200/80 bg-indigo-50/50 px-2 py-1 text-[11px] text-indigo-900 transition-colors hover:bg-indigo-100/80 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-200 dark:hover:bg-indigo-950/50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Aeris…"
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-border/80 bg-muted/40 py-2 text-sm shadow-none focus-visible:ring-indigo-500/25 dark:bg-muted/25"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 rounded-xl"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-center text-[11px] leading-snug text-muted-foreground">
                Aeris can make mistakes. Check important info.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
