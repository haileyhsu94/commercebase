import { useNavigate } from "react-router-dom"
import { ArrowRight, ExternalLink, GraduationCap, PlayCircle } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { TUTORIALS } from "@/components/shared/tutorials"

/**
 * In-app Help Center. Lists every product tutorial and lets users replay the
 * guided tours (which open the relevant page via `?tour=1`) or jump to a page.
 */
export function HelpCenter() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Help Center"
        description="Replay product tutorials and guided tours, or browse the full documentation."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {TUTORIALS.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-xl border bg-card p-4">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.body}</p>
              <button
                type="button"
                onClick={() => navigate(t.steps ? `${t.path}?tour=1` : t.path)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground"
              >
                {t.steps ? (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" />
                    Watch tour
                  </>
                ) : (
                  <>
                    Open page
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => window.open("https://help.realry.com", "_blank")}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Browse full documentation
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </>
  )
}
