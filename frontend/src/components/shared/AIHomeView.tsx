import {
  Sparkles,
  Wand2,
  TrendingUp,
  Eye,
  Lightbulb,
  ArrowRight,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { AERIS_EXAMPLE_PROMPT_GROUPS } from "@/lib/aeris-example-prompts"
import { cn } from "@/lib/utils"

const aiActions = [
  {
    title: "Create Campaign with AI",
    description: "Describe your goals and let Aeris draft a campaign for you",
    icon: Wand2,
    prompt: "Help me create a new campaign targeting high-intent shoppers",
    accent: "indigo" as const,
  },
  {
    title: "Analyze Performance",
    description: "Get AI-powered insights on your campaign metrics",
    icon: TrendingUp,
    prompt: "Summarize spend and revenue for active campaigns.",
    accent: "emerald" as const,
  },
  {
    title: "Optimize AI Visibility",
    description: "Find gaps in your AI search presence and fix them",
    icon: Eye,
    prompt: "Where am I losing to competitors in AI search?",
    accent: "violet" as const,
  },
  {
    title: "Get Recommendations",
    description: "Let Aeris suggest what to do next based on your data",
    icon: Lightbulb,
    prompt: "What should I pause or scale this week?",
    accent: "amber" as const,
  },
]

const accentStyles = {
  indigo: {
    card: "border-indigo-200/70 bg-indigo-50/50 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/50",
    icon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  emerald: {
    card: "border-emerald-200/70 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/50",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  violet: {
    card: "border-violet-200/70 bg-violet-50/50 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800/50 dark:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:bg-violet-950/50",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },
  amber: {
    card: "border-amber-200/70 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:bg-amber-950/50",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
}

export function AIHomeView() {
  const { openPanelWithComposerText, sendAssistantQuery } = useAIAssistant()

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-indigo-200/60 bg-gradient-to-b from-indigo-50/80 to-white px-6 py-8 text-center dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-background">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            What can Aeris help you with?
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Your AI assistant can create campaigns, analyze performance, and
            optimize your commerce media strategy.
          </p>
        </div>
      </div>

      {/* AI Action Cards */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Quick AI Actions
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {aiActions.map((action) => {
            const styles = accentStyles[action.accent]
            return (
              <button
                key={action.title}
                type="button"
                onClick={() => openPanelWithComposerText(action.prompt)}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  styles.card
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    styles.icon
                  )}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{action.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Example Prompts by Category */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Try asking Aeris
        </h3>
        <div className="space-y-4">
          {AERIS_EXAMPLE_PROMPT_GROUPS.map((group) => (
            <div key={group.category}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.prompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto gap-1.5 whitespace-normal py-1.5 text-left text-xs"
                    onClick={() => sendAssistantQuery(prompt)}
                  >
                    <MessageSquare className="h-3 w-3 shrink-0 opacity-50" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
