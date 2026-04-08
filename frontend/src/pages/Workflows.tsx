import { Plus, Zap, Bot, Megaphone, ArrowRight, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"

const templateWorkflows = [
  {
    id: "w1",
    name: "New product → AI optimise → activate",
    description: "When a new product is added to the catalog, trigger Aeris to enrich attributes, then auto-activate across channels.",
    nodes: ["Catalog trigger", "Aeris: Enrich attributes", "CommerceMax: Activate"],
    category: "Catalog",
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
  },
  {
    id: "w2",
    name: "ROAS drop → rebalance budget",
    description: "When any channel's ROAS drops below target for 24h, automatically rebalance spend toward higher-performing channels.",
    nodes: ["Performance alert", "Condition: ROAS < target", "CommerceMax: Rebalance"],
    category: "Optimisation",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
  },
  {
    id: "w3",
    name: "High-intent audience → retarget campaign",
    description: "When a shopper enters the high-intent pool (score >80), automatically add them to a retargeting campaign with a personalised bid uplift.",
    nodes: ["Audience signal", "Condition: Intent score >80", "Campaign: Add to retarget"],
    category: "Audiences",
    color: "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800",
  },
  {
    id: "w4",
    name: "Competitor gap → opportunity → agent",
    description: "When a new competitor gap is detected, generate an opportunity and send it to Auto Agent for automated content and bid response.",
    nodes: ["Competitor monitor", "Gap detected", "Auto Agent: Draft response"],
    category: "AI Visibility",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
  },
]

export function WorkflowsPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title="Workflows"
        description="Build automated pipelines that connect your catalog, campaigns, audiences, and AI agents — no manual monitoring required."
        actions={
          <Button className="gap-1.5" disabled>
            <Plus className="size-4" />
            New workflow
          </Button>
        }
      />

      <div className="min-h-0 min-w-0 flex-1">

        {/* Empty state canvas */}
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary shadow-sm">
            <GitBranch className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold">No workflows yet</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Workflows let you connect triggers, conditions, and actions into visual pipelines — like n8n, but built for commerce.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button className="gap-1.5" disabled>
              <Plus className="size-4" />
              Build from scratch
            </Button>
            <Button variant="outline" className="gap-1.5" disabled>
              Start from template
            </Button>
          </div>
          <Badge variant="secondary" className="mt-4 text-xs">Coming soon</Badge>
        </div>

        {/* Template workflows */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Workflow templates</h2>
          <span className="text-xs text-muted-foreground">Preview only — full builder coming soon</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {templateWorkflows.map((wf) => (
            <Card key={wf.id} className="relative overflow-hidden opacity-80">
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className={cn("text-[10px] font-medium", wf.color)}>
                  {wf.category}
                </Badge>
              </div>
              <CardHeader className="pb-3 pr-24">
                <CardTitle className="text-sm font-semibold leading-snug">{wf.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{wf.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Node preview strip */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {wf.nodes.map((node, i) => (
                    <div key={node} className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] font-medium text-foreground shadow-xs">
                        {i === 0 && <Zap className="size-3 text-muted-foreground" />}
                        {node.startsWith("Aeris") && <Bot className="size-3 text-muted-foreground" />}
                        {node.startsWith("Campaign") && <Megaphone className="size-3 text-muted-foreground" />}
                        {node}
                      </div>
                      {i < wf.nodes.length - 1 && (
                        <ArrowRight className="size-3 shrink-0 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
