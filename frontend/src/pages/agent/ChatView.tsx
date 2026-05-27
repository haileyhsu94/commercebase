import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowRight, ArrowUp, ChevronLeft, FileText, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AGENT_STORAGE_EVENT,
  getAgentChats,
  getCampaignArtifacts,
  upsertAgentChat,
  upsertCampaignArtifact,
} from "@/lib/agent/storage"
import type { AgentChat, AgentChatChoice, AgentChatMessage } from "@/types/agent"
import { newId } from "@/lib/agent/skill-mocks"
import {
  applyIntakeAnswer,
  intakeAck,
  nextIntakeQuestion,
} from "@/lib/agent/campaign-intake"
import { SkillChatMessages } from "@/components/agent/SkillChatMessages"

/**
 * Full-canvas chat view. Used when a skill activation lands in chat first so the
 * agent can collect follow-up details before opening the brief.
 */
export function ChatView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [chat, setChat] = useState<AgentChat | null>(null)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = () => {
      const list = getAgentChats()
      setChat(list.find((c) => c.id === id) ?? null)
    }
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [id])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chat?.messages.length])

  const openQuestion = chat?.messages.find(
    (m) => m.kind === "question" && !m.meta?.questionAnswered,
  )
  const allQuestionsAnswered =
    !!chat &&
    chat.messages.some((m) => m.kind === "question") &&
    !openQuestion

  function answerQuestion(messageId: string, choice: AgentChatChoice) {
    if (!chat) return
    const answered = chat.messages.find((m) => m.id === messageId)
    const tag = answered?.meta?.questionTag
    const updated = chat.messages.map((m) =>
      m.id === messageId
        ? { ...m, meta: { ...(m.meta ?? {}), questionAnswered: choice.label } }
        : m,
    )
    const userMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "user",
      content: choice.label,
      kind: "text",
      timestamp: new Date().toISOString(),
    }

    // Apply the answer to the campaign artifact and advance the intake.
    let ackContent =
      "Noted — I'll factor that in. Your brief is ready when you are."
    let nextQuestion: AgentChatMessage | null = null
    if (tag && chat.artifactRef?.type === "campaign") {
      const artifact = getCampaignArtifacts().find(
        (a) => a.id === chat.artifactRef!.id,
      )
      if (artifact) {
        const updatedArtifact = applyIntakeAnswer(artifact, tag, {
          label: choice.label,
          value: choice.value,
        })
        upsertCampaignArtifact(updatedArtifact)
        const nq = nextIntakeQuestion(tag, chat.preview)
        if (nq) {
          ackContent = intakeAck(tag, updatedArtifact)
          nextQuestion = {
            id: newId("msg"),
            role: "assistant",
            content: nq.content,
            kind: "question",
            timestamp: new Date().toISOString(),
            meta: {
              questionTag: nq.tag,
              questionContext: nq.context,
              questionChoices: nq.choices,
            },
          }
        } else {
          ackContent = `${intakeAck(tag, updatedArtifact)} That's everything I need — your brief is ready.`
        }
      }
    }

    const ackMsg: AgentChatMessage = {
      id: newId("msg"),
      role: "assistant",
      content: ackContent,
      kind: "text",
      timestamp: new Date().toISOString(),
    }
    const next: AgentChat = {
      ...chat,
      messages: [
        ...updated,
        userMsg,
        ackMsg,
        ...(nextQuestion ? [nextQuestion] : []),
      ],
      updatedAt: new Date().toISOString(),
    }
    setChat(next)
    upsertAgentChat(next)
  }

  function sendDraft() {
    if (!draft.trim() || !chat) return
    // If a question is open, treat the typed message as its answer so the
    // intake keeps advancing.
    if (openQuestion) {
      answerQuestion(openQuestion.id, { label: draft.trim() })
      setDraft("")
      return
    }
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
      content: "Got it — I'll incorporate that. Let me know if there's anything else before we open the brief.",
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

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Chat not found.
        <Button variant="link" onClick={() => navigate("/agent/chats")}>
          Back to chats
        </Button>
      </div>
    )
  }

  const brief =
    chat.artifactRef?.type === "campaign"
      ? `/agent/campaign/${chat.artifactRef.id}`
      : chat.artifactRef?.type === "autopilot"
        ? `/agent/flow/${chat.artifactRef.id}`
        : chat.artifactRef?.type === "widget"
          ? `/agent/widget/${chat.artifactRef.id}`
          : null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate("/agent/chats")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="truncate text-base font-semibold">{chat.title}</h1>
        {allQuestionsAnswered && brief && (
          <Button
            type="button"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => navigate(brief)}
          >
            <FileText className="size-3.5" />
            Open brief
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-3 px-4 py-6">
          <SkillChatMessages
            messages={chat.messages}
            onChoice={answerQuestion}
          />
          {allQuestionsAnswered && brief && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold">Brief is ready</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You can keep chatting to refine details, or jump into the brief now.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => navigate(brief)}
              >
                <FileText className="size-3.5" />
                Open brief
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Waiting indicator */}
      {openQuestion && (
        <div className="shrink-0 px-4 py-1.5">
          <div className="mx-auto flex max-w-2xl items-center gap-2 text-[11px] text-muted-foreground">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
            Aeris is waiting for your answer…
          </div>
        </div>
      )}

      <div className="shrink-0 border-t bg-background p-3">
        <div className="mx-auto max-w-2xl rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendDraft()
              }
            }}
            rows={1}
            placeholder={openQuestion ? "Or type a custom answer…" : "Type a message…"}
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
              onClick={sendDraft}
              disabled={!draft.trim()}
              className="inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
              aria-label="Send"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
