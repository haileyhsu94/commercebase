import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowUp,
  Braces,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code as CodeIcon,
  CornerDownRight,
  Expand,
  GitFork,
  Globe,
  Hand,
  HelpCircle,
  Mail,
  Maximize2,
  MessageSquare,
  Minus,
  Play,
  MoreHorizontal,
  MousePointer2,
  Pencil,
  Plus,
  Redo2,
  Repeat,
  Search,
  Sparkles,
  Tag as TagIcon,
  Trash2,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  AGENT_STORAGE_EVENT,
  deleteFlowArtifact,
  getFlowArtifacts,
  upsertFlowArtifact,
} from "@/lib/agent/storage"
import { AUDIENCE_SEGMENTS, findSegment } from "@/lib/agent/segments"
import type { AutopilotArtifact, FlowInput, FlowNode, FlowNodeType } from "@/types/agent"
import { FlowGraph } from "@/components/agent/FlowGraph"
import { cn } from "@/lib/utils"
import { newId } from "@/lib/agent/skill-mocks"

type LeftTab = "nodes" | "assistant"

// Library `id` is the display key; `nodeType` is the runtime FlowNodeType the
// canvas knows how to render. Multiple display items can map to the same type.
type LibraryItem = {
  id: string
  title: string
  icon: typeof GitFork
  nodeType: FlowNodeType
}
type LibrarySection = { section: string; items: readonly LibraryItem[] }

const NODE_LIBRARY: readonly LibrarySection[] = [
  {
    section: "Logic",
    items: [
      { id: "conditional", title: "Conditional", icon: GitFork, nodeType: "conditional" },
      { id: "iteration", title: "Iteration", icon: Repeat, nodeType: "iteration" },
    ],
  },
  {
    section: "AI",
    items: [{ id: "prompt-llm", title: "Prompt LLM", icon: Sparkles, nodeType: "prompt-llm" }],
  },
  {
    section: "Web Research",
    items: [
      { id: "get-sitemap", title: "Get Sitemap", icon: Globe, nodeType: "web-scrape" },
      { id: "web-scrape", title: "Web Page Scrape", icon: Globe, nodeType: "web-scrape" },
      { id: "parallel-deep", title: "Parallel Deep Research", icon: Brain, nodeType: "perplexity-search" },
      { id: "parallel-web", title: "Parallel Web Search", icon: Brain, nodeType: "perplexity-search" },
      { id: "perplexity-search", title: "Perplexity Search", icon: Brain, nodeType: "perplexity-search" },
      { id: "google-search", title: "Google Search", icon: Search, nodeType: "google-search" },
      { id: "exa-search", title: "Exa", icon: Brain, nodeType: "exa-search" },
    ],
  },
  {
    section: "Code",
    items: [
      { id: "call-api", title: "Call API", icon: Braces, nodeType: "call-api" },
      { id: "code", title: "Code", icon: CodeIcon, nodeType: "code" },
    ],
  },
  {
    section: "Channels",
    items: [
      { id: "send-email", title: "Send Email", icon: Mail, nodeType: "send-email" },
      { id: "send-sms", title: "Send SMS", icon: MessageSquare, nodeType: "send-sms" },
      { id: "delay", title: "Delay", icon: Clock, nodeType: "delay" },
      { id: "tag", title: "Tag Customer", icon: TagIcon, nodeType: "tag" },
    ],
  },
  {
    section: "Integrations",
    items: [
      { id: "slack", title: "Slack", icon: MessageSquare, nodeType: "slack" },
      { id: "v0", title: "v0", icon: Sparkles, nodeType: "call-api" },
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
  const [tool, setTool] = useState<"pan" | "select">("select")
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [history, setHistory] = useState<AutopilotArtifact[]>([])
  const [future, setFuture] = useState<AutopilotArtifact[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [testRun, setTestRun] = useState<{
    state: "running" | "done" | "error"
    steps: Array<{ nodeId: string; title: string; status: "pending" | "running" | "ok" | "fail"; output?: string }>
    error?: string
  } | null>(null)
  const [insertParentId, setInsertParentId] = useState<string | null>(null)

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

  const update = useCallback(
    (patch: Partial<AutopilotArtifact>, opts: { history?: boolean } = { history: true }) => {
      if (!artifact) return
      const next = { ...artifact, ...patch }
      if (opts.history !== false) {
        setHistory((h) => [...h.slice(-49), artifact])
        setFuture([])
      }
      setArtifact(next)
      upsertFlowArtifact(next)
    },
    [artifact],
  )

  const undo = useCallback(() => {
    if (history.length === 0 || !artifact) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setFuture((f) => [artifact, ...f.slice(0, 49)])
    setArtifact(prev)
    upsertFlowArtifact(prev)
  }, [artifact, history])

  const redo = useCallback(() => {
    if (future.length === 0 || !artifact) return
    const next = future[0]
    setFuture((f) => f.slice(1))
    setHistory((h) => [...h.slice(-49), artifact])
    setArtifact(next)
    upsertFlowArtifact(next)
  }, [artifact, future])

  // Simulate executing each non-end node in topological order. No backend
  // wired yet, so this is a visual stub — useful for demoing flow logic.
  function runTest() {
    if (!artifact) return
    const ordered = topoOrder(artifact.nodes).filter((n) => n.type !== "end")
    const steps = ordered.map((n) => ({
      nodeId: n.id,
      title: n.title,
      status: "pending" as const,
      output: mockOutputFor(n),
    }))
    setTestRun({ state: "running", steps })
    let i = 0
    const tick = () => {
      setTestRun((prev) => {
        if (!prev || prev.state !== "running") return prev
        const next = { ...prev, steps: prev.steps.map((s, idx) => (idx === i ? { ...s, status: "ok" as const } : s)) }
        return next
      })
      i++
      if (i < ordered.length) setTimeout(tick, 400)
      else
        setTimeout(
          () => setTestRun((prev) => (prev && prev.state === "running" ? { ...prev, state: "done" } : prev)),
          200,
        )
    }
    setTimeout(tick, 200)
  }

  function findLeafChildOf(nodes: FlowNode[], anchorId: string | undefined): string | undefined {
    // Walk down to a node with no children to use as the insertion parent.
    const childrenOf = new Map<string | undefined, FlowNode[]>()
    for (const n of nodes) {
      const key = n.parentId
      if (!childrenOf.has(key)) childrenOf.set(key, [])
      childrenOf.get(key)!.push(n)
    }
    let cursor = anchorId
    // Prefer to drop before an "end" node — append between its parent and itself.
    const endNode = nodes.find((n) => n.type === "end")
    if (!cursor) cursor = endNode?.parentId
    while (cursor) {
      const kids = childrenOf.get(cursor) ?? []
      if (kids.length === 0) return cursor
      // Skip into the non-end branch if possible
      const next = kids.find((k) => k.type !== "end") ?? kids[0]
      if (!next) return cursor
      cursor = next.id
    }
    return undefined
  }

  // Insert a new node on the link between `parentId` and its (single) child.
  // The existing child is re-parented onto the new node, preserving the chain.
  function handleInsertBetween(parentId: string, nodeType: FlowNodeType, title: string) {
    if (!artifact) return
    const child = artifact.nodes.find((n) => n.parentId === parentId)
    const newId = `n_${Math.random().toString(36).slice(2, 8)}`
    const newNode: FlowNode = {
      id: newId,
      type: nodeType,
      title,
      parentId,
      outputLabel: nodeType === "conditional" ? "Branch" : "Output",
      outputType: nodeType === "conditional" ? "boolean" : "text",
    }
    const nextNodes = artifact.nodes
      .map((n) => (child && n.id === child.id ? { ...n, parentId: newId } : n))
      .concat(newNode)
    update({ nodes: nextNodes })
    setActiveNodeId(newId)
    setInsertParentId(null)
  }

  function handleDropNode(nodeType: FlowNodeType, title: string) {
    if (!artifact) return
    const parentId = findLeafChildOf(artifact.nodes, activeNodeId)
    // If parent has an "end" child, re-parent it onto the new node.
    const endChild = artifact.nodes.find((n) => n.parentId === parentId && n.type === "end")
    const newId = `n_${Math.random().toString(36).slice(2, 8)}`
    const newNode: FlowNode = {
      id: newId,
      type: nodeType,
      title,
      parentId,
      outputLabel: nodeType === "conditional" ? "Branch" : "Output",
      outputType: nodeType === "conditional" ? "boolean" : "text",
    }
    const nextNodes = artifact.nodes
      .map((n) => (endChild && n.id === endChild.id ? { ...n, parentId: newId } : n))
      .concat(newNode)
    update({ nodes: nextNodes })
    setActiveNodeId(newId)
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Flow actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  const next = window.prompt("Rename flow", artifact.name)
                  if (next && next.trim()) update({ name: next.trim() })
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const copy = {
                    ...artifact,
                    id: `flow_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`,
                    name: `${artifact.name} (copy)`,
                    status: "draft" as const,
                    createdAt: new Date().toISOString(),
                  }
                  upsertFlowArtifact(copy)
                  navigate(`/agent/flow/${copy.id}`)
                }}
              >
                <Plus className="mr-2 h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${artifact.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <Braces className="mr-2 h-3.5 w-3.5" /> Export JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm(`Delete "${artifact.name}"? This can't be undone.`)) {
                    deleteFlowArtifact(artifact.id)
                    navigate("/agent/flows")
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={runTest}
            disabled={testRun?.state === "running"}
            className="gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {testRun?.state === "running" ? "Running…" : "Run test"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5">
                {artifact.status === "active" ? "Active" : artifact.status === "paused" ? "Paused" : "Publish"}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => update({ status: "active" })}>
                <span className="mr-2 inline-block size-2 rounded-full bg-emerald-500" />
                Active
                {artifact.status === "active" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ status: "paused" })}>
                <span className="mr-2 inline-block size-2 rounded-full bg-muted-foreground" />
                Paused
                {artifact.status === "paused" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ status: "draft" })}>
                <span className="mr-2 inline-block size-2 rounded-full bg-amber-500" />
                Draft
                {artifact.status === "draft" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={runTest} disabled={testRun?.state === "running"}>
                Run a test
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Left rail */}
        <aside className="flex min-h-0 flex-col border-r bg-card/40">
          <Tabs
            value={leftTab}
            onValueChange={(v) => setLeftTab(v as LeftTab)}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <TabsList className="m-1.5 grid h-8 shrink-0 grid-cols-2">
              <TabsTrigger value="nodes" className="text-xs">
                Nodes
              </TabsTrigger>
              <TabsTrigger value="assistant" className="text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="flex min-h-0 flex-1 flex-col">
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
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "copy"
                              e.dataTransfer.setData(
                                "application/x-flow-node",
                                JSON.stringify({ type: item.nodeType, title: item.title }),
                              )
                            }}
                            onClick={() => handleDropNode(item.nodeType, item.title)}
                            title="Drag onto the canvas, or click to append"
                            className="flex w-full cursor-grab items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent active:cursor-grabbing"
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
            </TabsContent>

            <TabsContent value="assistant" className="flex min-h-0 flex-1 flex-col">
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
            </TabsContent>
          </Tabs>
        </aside>

        {/* Canvas */}
        <div
          className={cn(
            "relative min-h-0 overflow-hidden bg-muted/15",
            fullscreen && "fixed inset-0 z-50 bg-background",
            dragOver && "ring-2 ring-inset ring-primary/60",
          )}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("application/x-flow-node")) {
              e.preventDefault()
              e.dataTransfer.dropEffect = "copy"
              if (!dragOver) setDragOver(true)
            }
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const raw = e.dataTransfer.getData("application/x-flow-node")
            if (!raw) return
            try {
              const { type, title } = JSON.parse(raw) as { type: FlowNodeType; title: string }
              handleDropNode(type, title)
            } catch {
              /* ignore */
            }
          }}
        >
          <FlowGraph
            nodes={artifact.nodes}
            activeId={activeNodeId}
            onSelect={setActiveNodeId}
            onAddBetween={setInsertParentId}
            zoom={zoom}
            tool={tool}
          />
          {insertParentId && (
            <InsertNodePicker
              onPick={(t) => handleInsertBetween(insertParentId, t.nodeType, t.title)}
              onClose={() => setInsertParentId(null)}
            />
          )}
          {testRun && (
            <TestRunPanel run={testRun} onClose={() => setTestRun(null)} onRerun={runTest} />
          )}
          <CanvasToolbar
            tool={tool}
            onToolChange={setTool}
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
            onZoomOut={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
            onFit={() => setZoom(1)}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen((v) => !v)}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onUndo={undo}
            onRedo={redo}
          />
        </div>

        {/* Right properties */}
        <aside className="flex min-h-0 flex-col border-l bg-card/40">
          {activeNode ? (
            <PropertiesPanel
              node={activeNode}
              artifact={artifact}
              onChange={update}
              onChangeNode={(nodeId, patch) => {
                update({
                  nodes: artifact.nodes.map((n) =>
                    n.id === nodeId ? { ...n, ...patch, config: { ...(n.config ?? {}), ...(patch.config ?? {}) } } : n,
                  ),
                })
              }}
              onDuplicateNode={(nodeId) => {
                const src = artifact.nodes.find((n) => n.id === nodeId)
                if (!src) return
                const newId = `n_${Math.random().toString(36).slice(2, 8)}`
                const copy: FlowNode = {
                  ...src,
                  id: newId,
                  title: `${src.title} (copy)`,
                  parentId: src.id,
                }
                // Re-parent src's existing child (if any) onto the copy.
                const downstream = artifact.nodes.find((n) => n.parentId === src.id)
                const nextNodes = artifact.nodes
                  .map((n) => (downstream && n.id === downstream.id ? { ...n, parentId: newId } : n))
                  .concat(copy)
                update({ nodes: nextNodes })
                setActiveNodeId(newId)
              }}
              onDeleteNode={(nodeId) => {
                const src = artifact.nodes.find((n) => n.id === nodeId)
                if (!src || src.type === "start" || src.type === "end") return
                // Reattach children to the deleted node's parent so the chain survives.
                const nextNodes = artifact.nodes
                  .filter((n) => n.id !== nodeId)
                  .map((n) => (n.parentId === nodeId ? { ...n, parentId: src.parentId } : n))
                update({ nodes: nextNodes })
                setActiveNodeId(src.parentId)
              }}
            />
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

// Floating picker shown when the user clicks a "+" inserter on the canvas.
// Lists the same library entries as the left rail; picking one calls back
// with the node type/title so FlowSkill can splice it into the link.
function InsertNodePicker({
  onPick,
  onClose,
}: {
  onPick: (item: { nodeType: FlowNodeType; title: string }) => void
  onClose: () => void
}) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/40 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Insert node"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80%] w-72 overflow-y-auto rounded-xl border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-medium">Insert node</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <Plus className="h-3 w-3 rotate-45" />
          </button>
        </div>
        <div className="p-2">
          {NODE_LIBRARY.map((section) => (
            <div key={section.section} className="mb-2">
              <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                {section.section}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onPick({ nodeType: item.nodeType, title: item.title })}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-left">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TestRunPanel({
  run,
  onClose,
  onRerun,
}: {
  run: {
    state: "running" | "done" | "error"
    steps: Array<{ nodeId: string; title: string; status: "pending" | "running" | "ok" | "fail"; output?: string }>
    error?: string
  }
  onClose: () => void
  onRerun: () => void
}) {
  const done = run.steps.filter((s) => s.status === "ok").length
  return (
    <div className="pointer-events-auto absolute top-3 left-1/2 z-20 w-[min(420px,calc(100%-24px))] -translate-x-1/2 rounded-xl border bg-background/95 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span
          className={cn(
            "inline-flex size-2 rounded-full",
            run.state === "running" ? "animate-pulse bg-amber-500" : run.state === "done" ? "bg-emerald-500" : "bg-rose-500",
          )}
        />
        <span className="text-xs font-medium">
          {run.state === "running" ? "Test running…" : run.state === "done" ? "Test passed" : "Test failed"}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {done} / {run.steps.length} steps
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <Plus className="h-3 w-3 rotate-45" />
        </button>
      </div>
      <ol className="max-h-[280px] space-y-1.5 overflow-y-auto p-3 text-xs">
        {run.steps.map((s) => (
          <li key={s.nodeId} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                s.status === "ok" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
                s.status === "fail" && "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
                s.status === "running" && "animate-pulse bg-amber-100 text-amber-700",
                s.status === "pending" && "bg-muted text-muted-foreground",
              )}
            >
              {s.status === "ok" ? "✓" : s.status === "fail" ? "!" : "·"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{s.title}</div>
              {s.status === "ok" && s.output && (
                <div className="truncate text-muted-foreground" title={s.output}>
                  {s.output}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {run.state !== "running" && (
        <div className="flex items-center justify-end gap-1.5 border-t px-3 py-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={onRerun} className="gap-1.5">
            <Play className="h-3 w-3 fill-current" />
            Run again
          </Button>
        </div>
      )}
    </div>
  )
}

function topoOrder(nodes: FlowNode[]): FlowNode[] {
  // Simple parent-first order — good enough for the mock test runner.
  const byParent = new Map<string | undefined, FlowNode[]>()
  for (const n of nodes) {
    const key = n.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(n)
  }
  const out: FlowNode[] = []
  function visit(n: FlowNode) {
    out.push(n)
    for (const c of byParent.get(n.id) ?? []) visit(c)
  }
  for (const r of byParent.get(undefined) ?? []) visit(r)
  return out
}

function mockOutputFor(n: FlowNode): string {
  const c = (n.config ?? {}) as Record<string, unknown>
  switch (n.type) {
    case "start":
    case "trigger":
      return c.kind === "schedule" ? "Fired at scheduled time" : "Triggered"
    case "prompt-llm":
      return `(${(c.model as string) ?? "claude-sonnet-4-6"}) "${(c.prompt as string)?.slice(0, 40) ?? "…"}…"`
    case "call-api":
      return `${(c.method as string) ?? "GET"} 200 OK`
    case "conditional":
      return "True"
    case "slack":
      return `Posted to ${(c.channel as string) ?? "#channel"}`
    case "send-email":
      return `Sent to ${(c.audience as string) ?? "audience"}`
    case "send-sms":
      return `SMS to ${(c.audience as string) ?? "audience"}`
    case "web-scrape":
      return `Scraped ${(c.url as string) ?? "page"}`
    case "google-search":
    case "exa-search":
    case "perplexity-search":
      return `5 results for "${(c.query as string) ?? "query"}"`
    case "iteration":
      return "Looped 3 items"
    case "delay":
      return `Slept ${(c.amount as number) ?? 1}${(c.unit as string) ?? "h"}`
    case "tag":
      return `Tagged ${(c.tag as string) ?? ""}`
    default:
      return "ok"
  }
}

function PropertiesPanel({
  node,
  artifact,
  onChange,
  onChangeNode,
  onDuplicateNode,
  onDeleteNode,
}: {
  node: FlowNode
  artifact: AutopilotArtifact
  onChange: (p: Partial<AutopilotArtifact>) => void
  onChangeNode: (nodeId: string, patch: Partial<FlowNode>) => void
  onDuplicateNode: (nodeId: string) => void
  onDeleteNode: (nodeId: string) => void
}) {
  const isCap = node.type === "start" || node.type === "end"

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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Node actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                const next = window.prompt("Rename node", node.title)
                if (next && next.trim()) onChangeNode(node.id, { title: next.trim() })
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicateNode(node.id)}
              disabled={isCap}
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm(`Delete "${node.title}"? Children will reconnect to its parent.`)) {
                  onDeleteNode(node.id)
                }
              }}
              disabled={isCap}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {node.type === "start" && (
          <>
            <NodeConfigForm node={node} onChangeNode={onChangeNode} />
            <div className="mt-5 mb-2 text-xs font-medium">Inputs</div>
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
          <NodeConfigForm node={node} onChangeNode={onChangeNode} />
        )}
      </div>
    </div>
  )
}

// Type-dispatched config form. Each node type owns a small, opinionated set
// of fields; everything writes back through onChangeNode(id, {config: {...}}).
function NodeConfigForm({
  node,
  onChangeNode,
}: {
  node: FlowNode
  onChangeNode: (nodeId: string, patch: Partial<FlowNode>) => void
}) {
  const cfg = (node.config ?? {}) as Record<string, unknown>
  const setCfg = (patch: Record<string, unknown>) => onChangeNode(node.id, { config: patch })
  const titleField = (
    <Field label="Title">
      <Input
        value={node.title}
        onChange={(e) => onChangeNode(node.id, { title: e.target.value })}
        className="h-8 text-sm"
      />
    </Field>
  )

  switch (node.type) {
    case "start":
    case "trigger": {
      const kind = (cfg.kind as string) ?? "webhook"
      return (
        <div className="space-y-3 text-sm">
          <Field label="Trigger type">
            <Select value={kind} onChange={(v) => setCfg({ kind: v })}>
              <option value="schedule">Recurring schedule</option>
              <option value="webhook">Webhook</option>
              <option value="event">Event</option>
            </Select>
          </Field>
          {kind === "schedule" && <SchedulePicker cfg={cfg} onChange={setCfg} />}
          {kind === "webhook" && (
            <Field label="Webhook URL">
              <Input
                value={(cfg.url as string) ?? ""}
                onChange={(e) => setCfg({ url: e.target.value })}
                placeholder="https://…"
                className="h-8 text-sm font-mono"
              />
            </Field>
          )}
          {kind === "event" && (
            <Field label="Event name">
              <Input
                value={(cfg.event as string) ?? ""}
                onChange={(e) => setCfg({ event: e.target.value })}
                placeholder="e.g. catalog.synced"
                className="h-8 text-sm"
              />
            </Field>
          )}
        </div>
      )
    }
    case "prompt-llm":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Model">
            <Select
              value={(cfg.model as string) ?? "claude-sonnet-4-6"}
              onChange={(v) => setCfg({ model: v })}
            >
              <option value="claude-opus-4-7">Claude Opus 4.7</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
              <option value="gpt-4o">GPT-4o</option>
            </Select>
          </Field>
          <Field label="Prompt">
            <Textarea
              rows={6}
              value={(cfg.prompt as string) ?? ""}
              onChange={(e) => setCfg({ prompt: e.target.value })}
              placeholder="Write the prompt. Reference upstream outputs with {{variable}}."
            />
          </Field>
          <Field label="Output variable">
            <Input
              value={(cfg.outputVar as string) ?? node.outputLabel ?? "result"}
              onChange={(e) => setCfg({ outputVar: e.target.value })}
              className="h-8 text-sm font-mono"
            />
          </Field>
        </div>
      )
    case "web-scrape":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="URL">
            <Input
              value={(cfg.url as string) ?? ""}
              onChange={(e) => setCfg({ url: e.target.value })}
              placeholder="https://example.com/path"
              className="h-8 text-sm font-mono"
            />
          </Field>
          <Field label="Selector (optional)">
            <Input
              value={(cfg.selector as string) ?? ""}
              onChange={(e) => setCfg({ selector: e.target.value })}
              placeholder="article.body"
              className="h-8 text-sm font-mono"
            />
          </Field>
        </div>
      )
    case "google-search":
    case "exa-search":
    case "perplexity-search":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Query">
            <Input
              value={(cfg.query as string) ?? ""}
              onChange={(e) => setCfg({ query: e.target.value })}
              placeholder='e.g. "best AI shopping assistant"'
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Max results">
            <Input
              type="number"
              value={(cfg.maxResults as number) ?? 5}
              onChange={(e) => setCfg({ maxResults: Number(e.target.value) })}
              className="h-8 w-24 text-sm"
            />
          </Field>
        </div>
      )
    case "call-api":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <div className="flex gap-2">
            <Field label="Method">
              <Select value={(cfg.method as string) ?? "GET"} onChange={(v) => setCfg({ method: v })}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </Select>
            </Field>
            <div className="flex-1">
              <Field label="URL">
                <Input
                  value={(cfg.url as string) ?? ""}
                  onChange={(e) => setCfg({ url: e.target.value })}
                  placeholder="https://api.example.com/v1/…"
                  className="h-8 text-sm font-mono"
                />
              </Field>
            </div>
          </div>
          <Field label="Body (JSON)">
            <Textarea
              rows={4}
              value={(cfg.body as string) ?? ""}
              onChange={(e) => setCfg({ body: e.target.value })}
              placeholder='{ "key": "value" }'
              mono
            />
          </Field>
        </div>
      )
    case "code":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Language">
            <Select
              value={(cfg.language as string) ?? "javascript"}
              onChange={(v) => setCfg({ language: v })}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </Select>
          </Field>
          <Field label="Source">
            <Textarea
              rows={8}
              value={(cfg.source as string) ?? ""}
              onChange={(e) => setCfg({ source: e.target.value })}
              placeholder="// Write code; return value becomes the output."
              mono
            />
          </Field>
        </div>
      )
    case "conditional":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Left">
            <Input
              value={(cfg.left as string) ?? ""}
              onChange={(e) => setCfg({ left: e.target.value })}
              placeholder="{{ROAS}}"
              className="h-8 text-sm font-mono"
            />
          </Field>
          <Field label="Operator">
            <Select value={(cfg.op as string) ?? "=="} onChange={(v) => setCfg({ op: v })}>
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value="<">&lt;</option>
              <option value="<=">&le;</option>
              <option value=">">&gt;</option>
              <option value=">=">&ge;</option>
              <option value="contains">contains</option>
            </Select>
          </Field>
          <Field label="Right">
            <Input
              value={(cfg.right as string) ?? ""}
              onChange={(e) => setCfg({ right: e.target.value })}
              placeholder="2.0"
              className="h-8 text-sm font-mono"
            />
          </Field>
        </div>
      )
    case "iteration":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Items (list expression)">
            <Input
              value={(cfg.items as string) ?? ""}
              onChange={(e) => setCfg({ items: e.target.value })}
              placeholder="{{products}}"
              className="h-8 text-sm font-mono"
            />
          </Field>
          <Field label="Item variable name">
            <Input
              value={(cfg.itemName as string) ?? "item"}
              onChange={(e) => setCfg({ itemName: e.target.value })}
              className="h-8 text-sm font-mono"
            />
          </Field>
        </div>
      )
    case "slack":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Channel">
            <Input
              value={(cfg.channel as string) ?? ""}
              onChange={(e) => setCfg({ channel: e.target.value })}
              placeholder="#commerce-alerts"
              className="h-8 text-sm font-mono"
            />
          </Field>
          <Field label="Message">
            <Textarea
              rows={4}
              value={(cfg.message as string) ?? ""}
              onChange={(e) => setCfg({ message: e.target.value })}
              placeholder="ROAS dropped on {{channel}}. New plan: {{plan}}."
            />
          </Field>
        </div>
      )
    case "send-email":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <SegmentPicker value={cfg.audience as string} onChange={(v) => setCfg({ audience: v })} />
          <Field label="From">
            <Input
              value={(cfg.from as string) ?? ""}
              onChange={(e) => setCfg({ from: e.target.value })}
              placeholder="hello@brand.com"
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Subject">
            <Input
              value={(cfg.subject as string) ?? ""}
              onChange={(e) => setCfg({ subject: e.target.value })}
              placeholder="Your daily picks"
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Body">
            <Textarea
              rows={6}
              value={(cfg.body as string) ?? ""}
              onChange={(e) => setCfg({ body: e.target.value })}
              placeholder="Hi {{first_name}}, here's what we picked for you…"
            />
          </Field>
        </div>
      )
    case "send-sms":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <SegmentPicker value={cfg.audience as string} onChange={(v) => setCfg({ audience: v })} />
          <Field label="Message">
            <Textarea
              rows={3}
              value={(cfg.message as string) ?? ""}
              onChange={(e) => setCfg({ message: e.target.value })}
              placeholder="Forgot something? {{cart_link}}"
            />
          </Field>
        </div>
      )
    case "delay":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <div className="flex gap-2">
            <Field label="Amount">
              <Input
                type="number"
                value={(cfg.amount as number) ?? 1}
                onChange={(e) => setCfg({ amount: Number(e.target.value) })}
                className="h-8 w-24 text-sm"
              />
            </Field>
            <Field label="Unit">
              <Select value={(cfg.unit as string) ?? "hour"} onChange={(v) => setCfg({ unit: v })}>
                <option value="minute">minutes</option>
                <option value="hour">hours</option>
                <option value="day">days</option>
              </Select>
            </Field>
          </div>
        </div>
      )
    case "tag":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Tag">
            <Input
              value={(cfg.tag as string) ?? ""}
              onChange={(e) => setCfg({ tag: e.target.value })}
              placeholder="vip"
              className="h-8 text-sm"
            />
          </Field>
          <Field label="Apply to">
            <Input
              value={(cfg.target as string) ?? ""}
              onChange={(e) => setCfg({ target: e.target.value })}
              placeholder="{{customer_id}}"
              className="h-8 text-sm font-mono"
            />
          </Field>
        </div>
      )
    case "webhook":
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="URL">
            <Input
              value={(cfg.url as string) ?? ""}
              onChange={(e) => setCfg({ url: e.target.value })}
              placeholder="https://…"
              className="h-8 text-sm font-mono"
            />
          </Field>
          <Field label="Secret (optional)">
            <Input
              value={(cfg.secret as string) ?? ""}
              onChange={(e) => setCfg({ secret: e.target.value })}
              className="h-8 text-sm font-mono"
            />
          </Field>
        </div>
      )
    default:
      return (
        <div className="space-y-3 text-sm">
          {titleField}
          <Field label="Notes">
            <Textarea
              rows={4}
              value={(cfg.notes as string) ?? ""}
              onChange={(e) => setCfg({ notes: e.target.value })}
              placeholder="Describe what this node does…"
            />
          </Field>
        </div>
      )
  }
}

// Picks an audience segment by id/name and shows its membership criteria +
// estimated reach below the field. Answers "who is in this segment?" inline.
function SegmentPicker({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (v: string) => void
}) {
  const segment = findSegment(value)
  // Preserve free-text values (e.g. typed before segments existed) by adding a
  // synthetic "custom" entry at the top of the list.
  const isCustom = !!value && !segment
  return (
    <Field label="Audience">
      <div className="space-y-1.5">
        <Select value={segment?.id ?? (isCustom ? "__custom__" : "")} onChange={onChange}>
          <option value="" disabled>
            Pick a segment…
          </option>
          {isCustom && <option value="__custom__">{value} (custom)</option>}
          {AUDIENCE_SEGMENTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.count.toLocaleString()}
            </option>
          ))}
        </Select>
        {segment && (
          <div className="rounded-md border bg-card/60 px-2 py-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium">{segment.name}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                ~{segment.count.toLocaleString()} customers
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{segment.description}</p>
            <code className="mt-1 block truncate font-mono text-[10px] text-muted-foreground" title={segment.criteria}>
              {segment.criteria}
            </code>
          </div>
        )}
      </div>
    </Field>
  )
}

function SchedulePicker({
  cfg,
  onChange,
}: {
  cfg: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}) {
  return (
    <>
      <Field label="Schedule (UTC)">
        <div />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Minute">
          <Select
            value={String((cfg.minute as number) ?? 0)}
            onChange={(v) => onChange({ minute: Number(v) })}
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                :{String(m).padStart(2, "0")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Hour">
          <Select
            value={String((cfg.hour as number) ?? 9)}
            onChange={(v) => onChange({ hour: Number(v) })}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}:00 ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Day of month">
          <Select
            value={(cfg.dayOfMonth as string) ?? "*"}
            onChange={(v) => onChange({ dayOfMonth: v })}
          >
            <option value="*">Every day</option>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={String(d)}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Month">
          <Select value={(cfg.month as string) ?? "*"} onChange={(v) => onChange({ month: v })}>
            <option value="*">Every month</option>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
              (m, i) => (
                <option key={m} value={String(i + 1)}>
                  {m}
                </option>
              ),
            )}
          </Select>
        </Field>
        <Field label="Day of week">
          <Select
            value={(cfg.dayOfWeek as string) ?? "*"}
            onChange={(v) => onChange({ dayOfWeek: v })}
          >
            <option value="*">Every day</option>
            <option value="1-5">Weekdays</option>
            <option value="0,6">Weekends</option>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <option key={d} value={String(i)}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </>
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full appearance-none rounded-md border bg-background pr-7 pl-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

function Textarea({
  rows,
  value,
  onChange,
  placeholder,
  mono,
}: {
  rows: number
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  mono?: boolean
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "w-full resize-y rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring",
        mono && "font-mono",
      )}
    />
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

interface CanvasToolbarProps {
  tool: "pan" | "select"
  onToolChange: (t: "pan" | "select") => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  fullscreen: boolean
  onToggleFullscreen: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

function CanvasToolbar({
  tool,
  onToolChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
  fullscreen,
  onToggleFullscreen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: CanvasToolbarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border bg-background/95 px-1 py-1 shadow-sm backdrop-blur">
        <ToolbarBtn label="Pan" active={tool === "pan"} onClick={() => onToolChange("pan")}>
          <Hand className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Select" active={tool === "select"} onClick={() => onToolChange("select")}>
          <MousePointer2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarBtn label="Zoom out" onClick={onZoomOut} disabled={zoom <= 0.5}>
          <Minus className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <span className="px-1 text-[10px] tabular-nums text-muted-foreground" aria-label="Zoom level">
          {Math.round(zoom * 100)}%
        </span>
        <ToolbarBtn label="Zoom in" onClick={onZoomIn} disabled={zoom >= 2}>
          <Plus className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Fit" onClick={onFit}>
          <Maximize2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          active={fullscreen}
          onClick={onToggleFullscreen}
        >
          <Expand className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarBtn label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
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

function ToolbarBtn({
  label,
  children,
  active,
  disabled,
  onClick,
}: {
  label: string
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground",
        disabled && "opacity-40 hover:bg-transparent hover:text-muted-foreground",
      )}
    >
      {children}
    </button>
  )
}
