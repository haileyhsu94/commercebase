import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { GitBranch, Plus } from "lucide-react"
import {
  AUTOPILOT_STORAGE_UPDATED_EVENT,
  listFlows,
  type AutopilotFlowStatus,
} from "@/lib/autopilot-storage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const statusTone: Record<AutopilotFlowStatus, string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  active: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  paused: "border-border bg-muted/50 text-muted-foreground",
}

export function AutopilotListPage() {
  const [flows, setFlows] = useState(() => listFlows())
  useEffect(() => {
    const onEvt = () => setFlows(listFlows())
    window.addEventListener(AUTOPILOT_STORAGE_UPDATED_EVENT, onEvt)
    return () => window.removeEventListener(AUTOPILOT_STORAGE_UPDATED_EVENT, onEvt)
  }, [])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
      <PageHeader
        title="Autopilot"
        description="Automate commerce routines with triggers, conditions, and actions. Create a flow from scratch or pick a starter template."
        actions={
          <Button className="gap-1.5" render={<Link to="/autopilot/new" />}>
            <Plus className="size-4" />
            New flow
          </Button>
        }
      />

      {flows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary shadow-sm">
            <GitBranch className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold">No flows yet</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Build your first autopilot workflow—connect catalog signals, campaigns, and AI-assisted steps—or start from an
            industry template on the next screen.
          </p>
          <Button className="mt-5 gap-1.5" render={<Link to="/autopilot/new" />}>
            <Plus className="size-4" />
            Create a flow
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Flow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px] pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="pl-4 font-medium">{f.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize font-normal text-xs", statusTone[f.status])}>
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs tabular-nums">
                    {formatDistanceToNow(new Date(f.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button size="sm" variant="outline" render={<Link to={`/autopilot/${f.id}/edit`} />}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
