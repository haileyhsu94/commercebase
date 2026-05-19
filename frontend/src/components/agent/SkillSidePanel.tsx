import { useEffect, useRef, useState } from "react"
import { ArrowUp, Brain, Paperclip, Sparkles, X } from "lucide-react"
import type { AgentChat, AgentChatMessage } from "@/types/agent"
import { getAgentChats, upsertAgentChat } from "@/lib/agent/storage"
import { newId } from "@/lib/agent/skill-mocks"

interface Props {
  chatId?: string
  title?: string
  onClose?: () => void
  contextLabel?: string
}

export function SkillSidePanel({ chatId, title, onClose, contextLabel }: Props) {
  const [chat, setChat] = useState<AgentChat | null>(null)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) return
    const list = getAgentChats()
    const found = list.find((c) => c.id === chatId)
    if (found) setChat(found)
  }, [chatId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chat?.messages.length])

  function send() {
    if (!draft.trim() || !chat) return
    const userMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "user",
      content: draft.trim(),
      kind: "text",
      timestamp: new Date().toISOString(),
    }
    const ackMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "assistant",
      content: "Got it — I'll update the artifact and keep going. Let me know if you want me to revise anything specific.",
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
    setDraft("")
  }

  return (
    <aside className="flex h-full min-h-0 w-full max-w-[420px] flex-col border-l bg-card">
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
        {chat?.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

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

function MessageBubble({ message }: { message: AgentChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-muted px-3 py-2 text-sm">
          {message.content}
        </div>
      </div>
    )
  }
  if (message.kind === "memory") {
    return (
      <div className="space-y-1.5 text-xs">
        <div className="text-muted-foreground">Listed memory contents.</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(message.meta?.memoryItems ?? []).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
            >
              <Brain className="h-3 w-3" />
              {item}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (message.kind === "skill-activated") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md border bg-muted/60 px-2 py-1 text-xs font-medium text-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        {message.content.replace(/\*\*/g, "")}
      </div>
    )
  }
  return (
    <div className="max-w-[92%] text-sm whitespace-pre-wrap text-foreground">
      {renderInline(message.content)}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <span key={i} className="font-semibold">
          {p.slice(2, -2)}
        </span>
      )
    }
    return <span key={i}>{p}</span>
  })
}
