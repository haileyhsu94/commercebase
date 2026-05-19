import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AGENT_STORAGE_EVENT, getAgentChats } from "@/lib/agent/storage"
import { describeSkill } from "@/lib/agent/skill-detect"
import type { AgentChat } from "@/types/agent"

export function ChatsList() {
  const [chats, setChats] = useState<AgentChat[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = () => setChats(getAgentChats())
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [])

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chat history</h1>
          <p className="text-sm text-muted-foreground">Every conversation with Aeris and the artifacts it produced.</p>
        </div>
        <Button onClick={() => navigate("/")} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      {chats.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed bg-card/50 p-8 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />
          <h2 className="mt-2 text-base font-semibold">No conversations yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Start a chat from the home screen — every message and artifact lives here.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-1">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                to={chatRoute(c)}
                className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:border-foreground/30 hover:bg-accent/30"
              >
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.title}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {describeSkill(c.artifactRef?.type ?? "chat")} · {c.preview}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function chatRoute(chat: AgentChat) {
  if (chat.artifactRef?.type === "campaign") return `/agent/campaign/${chat.artifactRef.id}`
  if (chat.artifactRef?.type === "autopilot") return `/agent/flow/${chat.artifactRef.id}`
  if (chat.artifactRef?.type === "widget") return `/agent/widget/${chat.artifactRef.id}`
  return `/agent/chats/${chat.id}`
}
