import { useEffect, useRef, useState } from "react"
import { ArrowUp, Paperclip, Sparkles, X } from "lucide-react"
import type { AgentChat, AgentChatMessage, AgentChatChoice } from "@/types/agent"
import { getAgentChats, upsertAgentChat } from "@/lib/agent/storage"
import { newId } from "@/lib/agent/skill-mocks"
import { cn } from "@/lib/utils"
import { SkillChatMessages } from "./SkillChatMessages"

interface Props {
  chatId?: string
  title?: string
  onClose?: () => void
  contextLabel?: string
}

const WIDTH_STORAGE_KEY = "commercebase_skill_panel_width_v1"
const MIN_WIDTH = 320
const MAX_WIDTH = 720
const DEFAULT_WIDTH = 420

function loadWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH
  const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY)
  const n = raw ? Number(raw) : NaN
  if (Number.isFinite(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n
  return DEFAULT_WIDTH
}

export function SkillSidePanel({ chatId, title, onClose, contextLabel }: Props) {
  const [chat, setChat] = useState<AgentChat | null>(null)
  const [draft, setDraft] = useState("")
  const [width, setWidth] = useState<number>(() => loadWidth())
  const [resizing, setResizing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!chatId) return
    const list = getAgentChats()
    const found = list.find((c) => c.id === chatId)
    if (found) setChat(found)
  }, [chatId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chat?.messages.length])

  useEffect(() => {
    if (!resizing) return
    function onMove(e: MouseEvent) {
      const aside = asideRef.current
      if (!aside) return
      const rect = aside.getBoundingClientRect()
      // Panel is anchored to the right edge — width is from cursor to right.
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, rect.right - e.clientX))
      setWidth(next)
    }
    function onUp() {
      setResizing(false)
      window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width))
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }
  }, [resizing, width])

  function sendText(content: string, ack?: string) {
    if (!chat) return
    const userMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "user",
      content,
      kind: "text",
      timestamp: new Date().toISOString(),
    }
    const ackMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "assistant",
      content:
        ack ??
        "Got it — I'll update the artifact and keep going. Let me know if you want me to revise anything specific.",
      kind: "text",
      timestamp: new Date().toISOString(),
    }
    const next: AgentChat = {
      ...chat,
      messages: [...chat.messages, userMsg, ackMsg],
      updatedAt: new Date().toISOString(),
    }
    setChat(next)
    upsertAgentChat(next)
  }

  function send() {
    if (!draft.trim()) return
    sendText(draft.trim())
    setDraft("")
  }

  function answerQuestion(messageId: string, choice: AgentChatChoice) {
    if (!chat) return
    // Mark the question as answered (so its buttons disable) and append the user reply.
    const updated = chat.messages.map((m) =>
      m.id === messageId
        ? {
            ...m,
            meta: { ...(m.meta ?? {}), questionAnswered: choice.label },
          }
        : m
    )
    const userMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "user",
      content: choice.label,
      kind: "text",
      timestamp: new Date().toISOString(),
    }
    const ackMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "assistant",
      content: `Noted — I'll factor that in and continue drafting.`,
      kind: "text",
      timestamp: new Date().toISOString(),
    }
    const next: AgentChat = {
      ...chat,
      messages: [...updated, userMsg, ackMsg],
      updatedAt: new Date().toISOString(),
    }
    setChat(next)
    upsertAgentChat(next)
  }

  return (
    <aside
      ref={asideRef}
      className="relative flex h-full min-h-0 shrink-0 flex-col border-l bg-card"
      style={{ width }}
    >
      {/* Drag handle on the left edge */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat panel"
        onMouseDown={(e) => {
          e.preventDefault()
          setResizing(true)
        }}
        className={cn(
          "absolute top-0 -left-1 z-10 h-full w-2 cursor-col-resize",
          "after:absolute after:top-0 after:left-1 after:h-full after:w-px after:bg-transparent",
          "hover:after:bg-border data-[resizing=true]:after:bg-foreground/40",
          resizing && "after:bg-foreground/40"
        )}
        data-resizing={resizing}
      />
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-foreground" />
          <span className="truncate text-sm font-medium">{title ?? chat?.title ?? "Aeris"}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close chat panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {contextLabel && (
        <div className="shrink-0 border-b bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
          Context: {contextLabel}
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {!chat && (
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            Start a chat from the home screen to see the agent reasoning here.
          </div>
        )}
        {chat && (
          <SkillChatMessages
            messages={chat.messages}
            onChoice={(messageId, choice) => answerQuestion(messageId, choice)}
          />
        )}
      </div>

      {(() => {
        const lastMsg = chat?.messages[chat.messages.length - 1]
        const waiting =
          !!lastMsg && lastMsg.kind === "question" && !lastMsg.meta?.questionAnswered
        if (!waiting) return null
        return (
          <div className="shrink-0 px-3 py-1.5">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
              Aeris is waiting for your answer…
            </div>
          </div>
        )
      })()}

      <div className="shrink-0 border-t p-2">
        <div className="rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <textarea
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Attach
            </button>
            <button
              type="button"
              onClick={send}
              className="inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
              disabled={!draft.trim()}
              aria-label="Send"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

