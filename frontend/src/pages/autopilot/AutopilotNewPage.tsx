import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Zap } from "lucide-react"
import { AUTOPILOT_TEMPLATES } from "@/lib/autopilot-templates"
import { createFlow } from "@/lib/autopilot-storage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"

export function AutopilotNewPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  /** `null` = blank canvas */
  const [templateId, setTemplateId] = useState<string | null>(null)

  const previewName = useMemo(() => {
    if (name.trim()) return name.trim()
    if (templateId) {
      const t = AUTOPILOT_TEMPLATES.find((x) => x.id === templateId)
      return t?.name ?? "Untitled flow"
    }
    return "Untitled flow"
  }, [name, templateId])

  function handleCreate() {
    const flow = createFlow({
      name: previewName,
      templateId,
    })
    navigate(`/autopilot/${flow.id}/edit`, { replace: true })
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start gap-3">
        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" render={<Link to="/autopilot" />}>
          <ArrowLeft className="size-4" />
          All flows
        </Button>
        <PageHeader
          title="New flow"
          description="Choose a starter template tailored to commerce, or begin with an empty canvas. You’ll configure triggers and branching in the visual editor."
          className="min-w-0 flex-1 py-4"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="flow-name">
          Flow name
        </label>
        <Input
          id="flow-name"
          placeholder="Shown in your flow list and breadcrumbs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to save as <span className="font-medium text-foreground">{previewName}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-md",
            templateId === null ? "ring-2 ring-primary/35" : ""
          )}
          onClick={() => setTemplateId(null)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Plus className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Blank flow</CardTitle>
            </div>
            <CardDescription>Start empty and sketch steps on the canvas with Aeris guidance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={templateId === null ? "secondary" : "outline"} className="text-[10px]">
              Custom logic
            </Badge>
          </CardContent>
        </Card>

        {AUTOPILOT_TEMPLATES.map((tpl) => (
          <Card
            key={tpl.id}
            className={cn(
              "cursor-pointer transition-shadow hover:shadow-md",
              templateId === tpl.id ? "ring-2 ring-primary/35" : ""
            )}
            onClick={() => setTemplateId(tpl.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Zap className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base leading-snug">{tpl.name}</CardTitle>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {tpl.category}
                </Badge>
              </div>
              <CardDescription className="text-xs">{tpl.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleCreate}>
          Create and open editor
        </Button>
        <Button type="button" variant="outline" render={<Link to="/autopilot" />}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
