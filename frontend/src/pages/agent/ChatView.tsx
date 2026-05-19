import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AGENT_STORAGE_EVENT, getAgentChats } from "@/lib/agent/storage"
import type { AgentChat } from "@/types/agent"
import { SkillSidePanel } from "@/components/agent/SkillSidePanel"

export function ChatView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [chat, setChat] = useState<AgentChat | null>(null)

  useEffect(() => {
    const load = () => {
      const list = getAgentChats()
      setChat(list.find((c) => c.id === id) ?? null)
    }
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [id])

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

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/agent/chats")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="truncate text-base font-semibold">{chat.title}</h1>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="mx-auto max-w-2xl text-sm text-muted-foreground">
            <p>
              This chat didn't produce a Campaign, Autopilot, or Widget artifact yet. Keep chatting in the panel — the
              agent can convert the thread into a skill anytime.
            </p>
          </div>
        </div>
      </div>
      <SkillSidePanel chatId={chat.id} title={chat.title} contextLabel="Conversation" />
    </div>
  )
}
