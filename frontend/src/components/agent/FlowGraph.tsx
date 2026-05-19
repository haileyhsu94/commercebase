import {
  Brain,
  Braces,
  Clock,
  Code as CodeIcon,
  Flag,
  GitFork,
  Globe,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Repeat,
  Search,
  Sparkles,
  Tag,
  Webhook,
  Zap,
} from "lucide-react"
import { useRef } from "react"
import type { FlowNode, FlowNodeType } from "@/types/agent"
import { cn } from "@/lib/utils"

interface Props {
  nodes: FlowNode[]
  activeId?: string
  onSelect?: (id: string) => void
  onAddBetween?: (parentId: string) => void
  zoom?: number
  tool?: "pan" | "select"
}

const NODE_META: Record<
  FlowNodeType,
  { icon: typeof Zap; tint: string }
> = {
  start: { icon: Play, tint: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" },
  end: { icon: Flag, tint: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" },
  trigger: { icon: Zap, tint: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" },
  "web-scrape": { icon: Globe, tint: "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200" },
  "prompt-llm": { icon: Sparkles, tint: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" },
  "google-search": { icon: Search, tint: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" },
  "exa-search": { icon: Brain, tint: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-200" },
  "perplexity-search": { icon: Brain, tint: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200" },
  code: { icon: CodeIcon, tint: "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200" },
  "call-api": { icon: Braces, tint: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-200" },
  conditional: { icon: GitFork, tint: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" },
  iteration: { icon: Repeat, tint: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
  slack: { icon: MessageSquare, tint: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-200" },
  "send-email": { icon: Mail, tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" },
  "send-sms": { icon: MessageSquare, tint: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-200" },
  delay: { icon: Clock, tint: "bg-slate-50 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200" },
  tag: { icon: Tag, tint: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" },
  webhook: { icon: Webhook, tint: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200" },
}

const OUTPUT_TYPE_META: Record<NonNullable<FlowNode["outputType"]>, { icon: string; tint: string }> = {
  text: { icon: "T", tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" },
  json: { icon: "{ }", tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" },
  list: { icon: "≡", tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" },
  boolean: { icon: "?", tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" },
}

interface Layout {
  node: FlowNode
  depth: number
  col: number
}

interface Edge {
  from: Layout
  to: Layout
  branch?: "true" | "false"
  childId: string
  parentId: string
}

function layoutNodes(nodes: FlowNode[]): { layouts: Layout[]; columns: number; depth: number } {
  const childrenOf = new Map<string | undefined, FlowNode[]>()
  for (const n of nodes) {
    const key = n.parentId
    if (!childrenOf.has(key)) childrenOf.set(key, [])
    childrenOf.get(key)!.push(n)
  }
  const layouts: Layout[] = []
  function visit(node: FlowNode, depth: number, col: number) {
    layouts.push({ node, depth, col })
    const children = childrenOf.get(node.id) ?? []
    children.sort((a, b) => {
      const bias = (x: FlowNode) => (x.branch === "true" ? -1 : x.branch === "false" ? 1 : 0)
      return bias(a) - bias(b)
    })
    if (children.length === 1) visit(children[0], depth + 1, col)
    else if (children.length === 2) {
      visit(children[0], depth + 1, col - 1)
      visit(children[1], depth + 1, col + 1)
    } else children.forEach((c, i) => visit(c, depth + 1, col - children.length / 2 + i + 0.5))
  }
  const roots = childrenOf.get(undefined) ?? []
  roots.forEach((r) => visit(r, 0, 0))
  const minCol = Math.min(0, ...layouts.map((l) => l.col))
  const normalized = layouts.map((l) => ({ ...l, col: l.col - minCol }))
  const columns = (Math.max(...normalized.map((l) => l.col)) || 0) + 1
  const depth = Math.max(...normalized.map((l) => l.depth))
  return { layouts: normalized, columns, depth }
}

export function FlowGraph({
  nodes,
  activeId,
  onSelect,
  onAddBetween,
  zoom = 1,
  tool = "select",
}: Props) {
  const { layouts, columns, depth: maxDepth } = layoutNodes(nodes)

  const COL_WIDTH = 280
  const ROW_HEIGHT = 130

  const byId = new Map(layouts.map((l) => [l.node.id, l]))
  const edges = layouts.reduce<Edge[]>((acc, child) => {
    if (!child.node.parentId) return acc
    const parent = byId.get(child.node.parentId)
    if (!parent) return acc
    acc.push({
      from: parent,
      to: child,
      branch: child.node.branch,
      childId: child.node.id,
      parentId: parent.node.id,
    })
    return acc
  }, [])

  // Inner container is exactly as wide as the column count; `mx-auto` then
  // horizontally centers a narrow (e.g. single-column) flow inside the
  // wider scroll area.
  const width = columns * COL_WIDTH
  const height = (maxDepth + 1) * ROW_HEIGHT + 60

  const nodeX = (col: number) => col * COL_WIDTH + COL_WIDTH / 2
  const nodeY = (depth: number) => depth * ROW_HEIGHT + 30

  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; sl: number; st: number } | null>(null)

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "relative h-full w-full overflow-auto bg-[radial-gradient(circle_at_1px_1px,theme(colors.border)_1px,transparent_0)] [background-size:16px_16px]",
        tool === "pan" ? "cursor-grab select-none active:cursor-grabbing" : "cursor-default",
      )}
      onMouseDown={(e) => {
        if (tool !== "pan") return
        const el = scrollerRef.current
        if (!el) return
        dragRef.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop }
        // Prevent text selection / node-click while panning
        e.preventDefault()
      }}
      onMouseMove={(e) => {
        const drag = dragRef.current
        const el = scrollerRef.current
        if (!drag || !el || tool !== "pan") return
        el.scrollLeft = drag.sl - (e.clientX - drag.x)
        el.scrollTop = drag.st - (e.clientY - drag.y)
      }}
      onMouseUp={() => {
        dragRef.current = null
      }}
      onMouseLeave={() => {
        dragRef.current = null
      }}
    >
      <div
        style={{ width, height, transform: `scale(${zoom})`, transformOrigin: "top center" }}
        className={cn(
          "relative mx-auto transition-transform",
          // In pan mode, swallow pointer events on nodes/buttons so drags scroll the canvas
          tool === "pan" && "[&_button]:pointer-events-none",
        )}
      >
        <svg width={width} height={height} className="pointer-events-none absolute inset-0">
          {edges.map((e, i) => {
            const x1 = nodeX(e.from.col)
            const y1 = nodeY(e.from.depth) + 42
            const x2 = nodeX(e.to.col)
            const y2 = nodeY(e.to.depth) - 4
            const midY = (y1 + y2) / 2
            return (
              <g key={i}>
                <path
                  d={`M${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  className="stroke-border"
                  strokeWidth={1.5}
                />
                {e.branch && (
                  <foreignObject x={(x1 + x2) / 2 - 28} y={midY - 12} width={56} height={20}>
                    <div
                      className={cn(
                        "flex h-5 items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold",
                        e.branch === "true"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-rose-300 bg-rose-50 text-rose-700",
                      )}
                    >
                      {e.branch === "true" ? "✓ True" : "✕ False"}
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}
        </svg>

        {/* "+" inserters between linearly connected nodes */}
        {edges.map((e) =>
          e.from.col === e.to.col ? (
            <button
              key={`add-${e.parentId}-${e.childId}`}
              type="button"
              onClick={() => onAddBetween?.(e.parentId)}
              aria-label="Insert node"
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background p-0.5 text-muted-foreground opacity-60 transition hover:bg-accent hover:text-foreground hover:opacity-100"
              style={{
                left: nodeX(e.from.col),
                top: (nodeY(e.from.depth) + 42 + nodeY(e.to.depth) - 4) / 2,
              }}
            >
              <Plus className="h-3 w-3" />
            </button>
          ) : null,
        )}

        {layouts.map((l) => (
          <div
            key={l.node.id}
            className="absolute -translate-x-1/2"
            style={{ left: nodeX(l.col), top: nodeY(l.depth) }}
          >
            <NodeCard layout={l} active={l.node.id === activeId} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NodeCard({
  layout,
  active,
  onSelect,
}: {
  layout: Layout
  active: boolean
  onSelect?: (id: string) => void
}) {
  const { node } = layout
  const meta =
    NODE_META[node.type] ??
    ({ icon: Sparkles, tint: "bg-muted text-muted-foreground" } as (typeof NODE_META)[FlowNodeType])
  const Icon = meta.icon
  const isCap = node.type === "start" || node.type === "end"
  const summary = describeNode(node)
  return (
    <button
      type="button"
      onClick={() => onSelect?.(node.id)}
      className={cn(
        "w-56 overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow",
        active ? "ring-2 ring-foreground" : "",
      )}
    >
      <div className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium", meta.tint)}>
        <Icon className="h-3.5 w-3.5" />
        {node.title}
      </div>
      {!isCap && (
        <div className="border-t bg-background px-3 py-2 text-[11px]">
          {summary && (
            <div className="mb-1 truncate font-medium text-foreground" title={summary}>
              {summary}
            </div>
          )}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Output</span>
            {node.outputLabel && node.outputType && (
              <OutputChip label={node.outputLabel} type={node.outputType} />
            )}
          </div>
        </div>
      )}
      {isCap && (summary || node.subtitle) && (
        <div className="border-t bg-background px-3 py-2 text-[11px] text-muted-foreground">
          {summary ?? node.subtitle}
          <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded bg-muted px-1 text-[10px] font-medium text-foreground">
            1
          </span>
        </div>
      )}
    </button>
  )
}

// Human-readable summary of a node based on its config — keeps the canvas
// readable at a glance instead of forcing the user to open the right panel.
function describeNode(node: FlowNode): string | undefined {
  const c = (node.config ?? {}) as Record<string, unknown>
  switch (node.type) {
    case "start":
    case "trigger": {
      const kind = c.kind as string | undefined
      if (kind === "schedule") {
        const h = (c.hour as number | undefined) ?? 9
        const m = (c.minute as number | undefined) ?? 0
        const label = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`
        return `at ${label}${m ? `:${String(m).padStart(2, "0")}` : ""}`
      }
      if (kind === "webhook") return "on webhook"
      if (kind === "event") return (c.event as string) ? `on ${c.event}` : "on event"
      return undefined
    }
    case "prompt-llm":
      return (c.model as string) ?? undefined
    case "web-scrape":
      return (c.url as string) ?? undefined
    case "google-search":
    case "exa-search":
    case "perplexity-search":
      return (c.query as string) ?? undefined
    case "call-api":
      return c.method ? `${c.method} ${(c.url as string) ?? ""}`.trim() : (c.url as string) ?? undefined
    case "conditional": {
      const left = c.left as string | undefined
      const op = (c.op as string | undefined) ?? "=="
      const right = c.right as string | undefined
      return left ? `${left} ${op} ${right ?? ""}`.trim() : undefined
    }
    case "iteration":
      return c.items ? `for each ${(c.itemName as string) ?? "item"} in ${c.items}` : undefined
    case "slack":
      return c.channel ? String(c.channel).replace(/^#?/, "#") : undefined
    case "send-email":
    case "send-sms": {
      const a = c.audience as string | undefined
      if (!a) return undefined
      // Look up the friendly segment name if the value is a segment id.
      const known: Record<string, string> = {
        vip: "VIP segment",
        "high-intent": "High-intent shoppers",
        "cart-abandoners": "Cart abandoners",
        "lapsed-90d": "Lapsed (90d)",
        subscribers: "Email subscribers",
        "all-customers": "All customers",
      }
      return `to ${known[a] ?? a}`
    }
    case "delay":
      return c.amount ? `wait ${c.amount} ${c.unit ?? "min"}` : undefined
    case "tag":
      return c.tag ? `tag "${c.tag}"` : undefined
    case "webhook":
      return (c.url as string) ?? undefined
    case "code":
      return (c.language as string) ?? "code"
    case "end":
      return node.subtitle ?? "Outputs"
  }
  return node.subtitle
}

function OutputChip({ label, type }: { label: string; type: NonNullable<FlowNode["outputType"]> }) {
  const meta = OUTPUT_TYPE_META[type]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium", meta.tint)}>
      <span className="font-mono text-[10px]">{meta.icon}</span>
      {label}
    </span>
  )
}

export { NODE_META, OUTPUT_TYPE_META }
