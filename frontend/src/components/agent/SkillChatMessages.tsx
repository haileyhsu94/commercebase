import { useRef, useState } from "react"
import { ArrowUp, Brain, Sparkles } from "lucide-react"
import type { AgentChatChoice, AgentChatMessage } from "@/types/agent"
import { cn } from "@/lib/utils"

/**
 * Renders an array of agent chat messages — text bubbles, memory chips, skill-activated
 * pills, and interactive question cards. Used in both the side panel and the full-canvas
 * chat view so the rendering stays consistent.
 */
export function SkillChatMessages({
  messages,
  onChoice,
}: {
  messages: AgentChatMessage[]
  onChoice?: (messageId: string, choice: AgentChatChoice) => void
}) {
  return (
    <>
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          onChoice={(c) => onChoice?.(m.id, c)}
        />
      ))}
    </>
  )
}

function MessageBubble({
  message,
  onChoice,
}: {
  message: AgentChatMessage
  onChoice?: (choice: AgentChatChoice) => void
}) {
  if (message.kind === "question") {
    return <QuestionCard message={message} onChoice={onChoice} />
  }
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

function QuestionCard({
  message,
  onChoice,
}: {
  message: AgentChatMessage
  onChoice?: (choice: AgentChatChoice) => void
}) {
  const { questionTag, questionContext, questionChoices, questionAnswered } = message.meta ?? {}
  const answered = !!questionAnswered
  const [otherText, setOtherText] = useState("")
  const otherInputRef = useRef<HTMLInputElement>(null)

  function submitOther() {
    const text = otherText.trim()
    if (!text) return
    onChoice?.({ label: text })
    setOtherText("")
  }

  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 p-3 pb-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={cn(
              "mt-1 size-1.5 shrink-0 rounded-full",
              answered ? "bg-emerald-500" : "bg-amber-500",
            )}
            aria-hidden
          />
          <p className="text-sm font-semibold leading-snug">{message.content}</p>
        </div>
        {questionTag && (
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
            {questionTag}
          </span>
        )}
      </div>
      {questionContext && (
        <div className="mx-3 mb-2 rounded-md border bg-muted/30 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-foreground/80">
          {questionContext}
        </div>
      )}
      <div className="space-y-1 border-t bg-muted/10 p-1.5">
        {[...(questionChoices ?? [])]
          .sort((a, b) => Number(!!b.recommended) - Number(!!a.recommended))
          .map((choice) => (
            <button
              key={choice.label}
              type="button"
              disabled={answered}
              onClick={() => onChoice?.(choice)}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                answered
                  ? "cursor-default opacity-50"
                  : choice.recommended
                    ? "border border-primary/30 bg-primary/10 text-foreground hover:bg-primary/15"
                    : "border border-transparent hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="font-medium">{choice.label}</span>
              {(choice.recommended || choice.hint) && (
                <span className="text-[11px] text-muted-foreground">
                  {choice.recommended && (
                    <span className="font-medium text-primary">Recommended</span>
                  )}
                  {choice.recommended && choice.hint && <span> · </span>}
                  {choice.hint}
                </span>
              )}
            </button>
          ))}
        {!answered && (
          <div className="flex items-center gap-1.5 rounded-md border bg-background px-1 py-0.5 focus-within:ring-1 focus-within:ring-ring">
            <input
              ref={otherInputRef}
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  submitOther()
                }
              }}
              placeholder="Other — type your own answer…"
              className="min-w-0 flex-1 bg-transparent px-1.5 py-1 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={submitOther}
              disabled={!otherText.trim()}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
              aria-label="Send custom answer"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      {answered && (
        <div className="border-t bg-muted/10 px-3 py-1.5 text-[11px] text-muted-foreground">
          You answered: <span className="font-medium text-foreground">{questionAnswered}</span>
        </div>
      )}
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
