import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowUp,
  Braces,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code as CodeIcon,
  CornerDownRight,
  Expand,
  GitFork,
  Globe,
  Hand,
  HelpCircle,
  Maximize2,
  MessageSquare,
  Minus,
  MoreHorizontal,
  MousePointer2,
  Pencil,
  Plus,
  Redo2,
  Repeat,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  Workflow,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AGENT_STORAGE_EVENT, getFlowArtifacts, upsertFlowArtifact } from "@/lib/agent/storage"
import type { AutopilotArtifact, FlowInput, FlowNode } from "@/types/agent"
import { FlowGraph } from "@/components/agent/FlowGraph"
import { cn } from "@/lib/utils"
import { newId } from "@/lib/agent/skill-mocks"

type LeftTab = "nodes" | "assistant"

const NODE_LIBRARY = [
  {
    section: "Logic",
    items: [
      { id: "conditional", title: "Conditional", icon: GitFork },
      { id: "iteration", title: "Iteration", icon: Repeat },
    ],
  },
  {
    section: "AI",
    items: [{ id: "prompt-llm", title: "Prompt LLM", icon: Sparkles }],
  },
  {
    section: "Web Research",
    items: [
      { id: "get-sitemap", title: "Get Sitemap", icon: Globe },
      { id: "web-scrape", title: "Web Page Scrape", icon: Globe },
      { id: "parallel-deep", title: "Parallel Deep Research", icon: Brain },
      { id: "parallel-web", title: "Parallel Web Search", icon: Brain },
      { id: "perplexity-search", title: "Perplexity Search", icon: Brain },
      { id: "google-search", title: "Google Search", icon: Search },
      { id: "exa-search", title: "Exa", icon: Brain },
    ],
  },
  {
    section: "Code",
    items: [
      { id: "call-api", title: "Call API", icon: Braces },
      { id: "code", title: "Code", icon: CodeIcon },
    ],
  },
  {
    section: "Integrations",
    items: [
      { id: "slack", title: "Slack", icon: MessageSquare },
      { id: "v0", title: "v0", icon: Sparkles },
    ],
  },
] as const

const ASSISTANT_SUGGESTIONS = [
  "Create a Competitor Analysis Report",
  "Create a Content Optimization Agent",
  "Create a Query Fanout Agent",
]

export function FlowSkill() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [artifact, setArtifact] = useState<AutopilotArtifact | null>(null)
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>("n_start")
  const [leftTab, setLeftTab] = useState<LeftTab>("assistant")
  const [search, setSearch] = useState("")
  const [draft, setDraft] = useState("")

  useEffect(() => {
    const load = () => {
      const list = getFlowArtifacts()
      const found = list.find((a) => a.id === id) ?? null
      setArtifact(found)
      // Ensure artifact has inputs/outputs after data model change
      if (found && !found.inputs) {
        const next = { ...found, inputs: [] as FlowInput[] }
        upsertFlowArtifact(next)
        setArtifact(next)
      }
    }
    load()
    window.addEventListener(AGENT_STORAGE_EVENT, load)
    return () => window.removeEventListener(AGENT_STORAGE_EVENT, load)
  }, [id])

  function update(patch: Partial<AutopilotArtifact>) {
    if (!artifact) return
    const next = { ...artifact, ...patch }
    setArtifact(next)
    upsertFlowArtifact(next)
  }

  const filteredLibrary = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return NODE_LIBRARY
    return NODE_LIBRARY.map((s) => ({
      ...s,
      items: s.items.filter((i) => i.title.toLowerCase().includes(q)),
    })).filter((s) => s.items.length > 0)
  }, [search])

  if (!artifact) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Flow not found.
        <Button variant="link" onClick={() => navigate("/agent/flows")}>
          Back to flows
        </Button>
      </div>
    )
  }

  const activeNode = artifact.nodes.find((n) => n.id === activeNodeId) ?? artifact.nodes[0]

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/agent/flows")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="truncate text-sm font-semibold">{artifact.name}</h1>
          <Button variant="ghost" size="icon-sm" aria-label="More">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5">
            <span className="inline-flex size-3 items-center justify-center rounded-full bg-foreground text-[8px] text-background">
              ▶
            </span>
            Run test
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => update({ status: "active" })}
            className="gap-1.5"
          >
            {artifact.status === "active" ? "Active" : "Publish"}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Left rail */}
        <aside className="flex min-h-0 flex-col border-r bg-card/40">
          <div className="grid shrink-0 grid-cols-2 gap-1 p-1.5">
            <TabButton active={leftTab === "nodes"} onClick={() => setLeftTab("nodes")}>
              Nodes
            </TabButton>
            <TabButton active={leftTab === "assistant"} onClick={() => setLeftTab("assistant")}>
              <Sparkles className="h-3.5 w-3.5" />
              Assistant
            </TabButton>
          </div>

          {leftTab === "nodes" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 px-3 pb-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-8 pl-7 text-xs"
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
                {filteredLibrary.map((section) => (
                  <div key={section.section} className="mb-3">
                    <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      {section.section}
                    </div>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate text-left">{item.title}</span>
                            {item.id === "iteration" && (
                              <Plus className="h-3 w-3 text-muted-foreground" />
                            )}
                            {item.id === "exa-search" && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leftTab === "assistant" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 items-center justify-center px-6">
                <Sparkles className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="shrink-0 border-t px-3 py-3">
                <div className="mb-2 text-xs font-medium">Suggested</div>
                <ul className="mb-3 space-y-0.5">
                  {ASSISTANT_SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => setDraft(s)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <CornerDownRight className="h-3 w-3" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="relative">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-1 rounded-[18px] opacity-50 blur-md"
                    style={{
                      background:
                        "linear-gradient(110deg, rgba(251,146,60,0.35) 0%, rgba(244,114,182,0.18) 50%, rgba(45,212,191,0.35) 100%)",
                    }}
                  />
                  <div className="relative rounded-xl border bg-background p-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Describe your agent..."
                      rows={2}
                      className="w-full resize-none bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none"
                    />
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="size-6 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Voice"
                      >
                        <svg viewBox="0 0 24 24" className="mx-auto h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 18v3"/><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/></svg>
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
                        disabled={!draft.trim()}
                        aria-label="Send"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <div className="relative min-h-0 overflow-hidden bg-muted/15">
          <FlowGraph nodes={artifact.nodes} activeId={activeNodeId} onSelect={setActiveNodeId} />
          <CanvasToolbar />
        </div>

        {/* Right properties */}
        <aside className="flex min-h-0 flex-col border-l bg-card/40">
          {activeNode ? (
            <PropertiesPanel node={activeNode} artifact={artifact} onChange={update} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a node to edit
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function PropertiesPanel({
  node,
  artifact,
  onChange,
}: {
  node: FlowNode
  artifact: AutopilotArtifact
  onChange: (p: Partial<AutopilotArtifact>) => void
}) {
  const nodeIcon = (() => {
    switch (node.type) {
      case "start":
        return Zap
      case "end":
        return Workflow
      case "prompt-llm":
        return Sparkles
      case "web-scrape":
        return Globe
      case "google-search":
        return Search
      case "exa-search":
        return Brain
      case "call-api":
        return Braces
      default:
        return Sparkles
    }
  })()

  function addInput() {
    const next: FlowInput = {
      id: newId("in"),
      name: `Input ${(artifact.inputs?.length ?? 0) + 1}`,
      type: "text",
    }
    onChange({ inputs: [...(artifact.inputs ?? []), next] })
  }

  function updateInput(inputId: string, patch: Partial<FlowInput>) {
    onChange({
      inputs: (artifact.inputs ?? []).map((i) => (i.id === inputId ? { ...i, ...patch } : i)),
    })
  }

  function removeInput(inputId: string) {
    onChange({ inputs: (artifact.inputs ?? []).filter((i) => i.id !== inputId) })
  }

  const Icon = nodeIcon

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium underline-offset-2 hover:underline">{node.title}</span>
        </div>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {node.type === "start" && (
          <>
            <div className="mb-2 text-xs font-medium underline-offset-2 hover:underline">Input</div>
            <ul className="space-y-1.5">
              {(artifact.inputs ?? []).map((input) => (
                <li
                  key={input.id}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-card px-2.5 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="inline-flex size-5 items-center justify-center rounded bg-blue-50 text-[10px] font-mono font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                      T
                    </span>
                    <span className="truncate text-blue-700 dark:text-blue-200">{input.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const next = window.prompt("Input name", input.name)
                        if (next) updateInput(input.id, { name: next })
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeInput(input.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addInput}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed bg-background px-2 py-2 text-xs text-muted-foreground hover:border-input hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Add input
            </button>
          </>
        )}
        {node.type === "end" && (
          <>
            <div className="mb-2 text-xs font-medium">Outputs</div>
            <p className="text-xs text-muted-foreground">
              Connect upstream node outputs into this end node to expose them as the flow's result.
            </p>
          </>
        )}
        {node.type !== "start" && node.type !== "end" && (
          <PropsForOther node={node} />
        )}
      </div>
    </div>
  )
}

function PropsForOther({ node }: { node: FlowNode }) {
  return (
    <div className="space-y-3 text-sm">
      <Field label="Title">
        <Input defaultValue={node.title} className="h-8 text-sm" />
      </Field>
      {node.outputLabel && (
        <Field label="Output">
          <div className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1.5 text-xs">
            <span className="inline-flex size-5 items-center justify-center rounded bg-blue-50 text-[10px] font-mono font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
              {node.outputType === "json" ? "{ }" : node.outputType === "list" ? "≡" : "T"}
            </span>
            <span className="text-blue-700 dark:text-blue-200">{node.outputLabel}</span>
          </div>
        </Field>
      )}
      <Field label="Notes">
        <textarea
          rows={4}
          placeholder="Describe what this node does…"
          className="w-full resize-none rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
  )
}

function CanvasToolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border bg-background/95 px-1 py-1 shadow-sm backdrop-blur">
        <ToolbarBtn label="Pan"><Hand className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn label="Select"><MousePointer2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarBtn label="Zoom out"><Minus className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn label="Zoom in"><Plus className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn label="Fit"><Maximize2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn label="Expand"><Expand className="h-3.5 w-3.5" /></ToolbarBtn>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarBtn label="Undo"><Undo2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn label="Redo"><Redo2 className="h-3.5 w-3.5" /></ToolbarBtn>
      </div>
      <button
        type="button"
        className="pointer-events-auto ml-2 inline-flex size-7 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground"
        aria-label="Help"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function ToolbarBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  )
}
