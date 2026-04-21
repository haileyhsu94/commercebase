import { useState } from "react"
import {
  Sparkles,
  Plus,
  Wand2,
  BarChart3,
  Eye,
  FileText,
  Package,
  Send,
} from "lucide-react"
import { useAIAssistant } from "@/contexts/AIAssistantContext"
import { currentUser } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const quickActions = [
  { label: "Create Campaign", icon: Wand2 },
  { label: "Analyze", icon: BarChart3 },
  { label: "AI Visibility", icon: Eye },
  { label: "Reports", icon: FileText },
  { label: "Catalog", icon: Package },
]

export function AIHomeView() {
  const { sendAssistantQuery, setIsOpen } = useAIAssistant()
  const [input, setInput] = useState("")

  const hour = new Date().getHours()
  const greeting =
    hour >= 5 && hour < 12
      ? "Morning"
      : hour >= 12 && hour < 18
        ? "Afternoon"
        : hour >= 18 && hour < 21
          ? "Evening"
          : "Evening"

  const firstName = currentUser.name.split(" ")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const query = input.trim()
    setInput("")
    setIsOpen(true)
    await sendAssistantQuery(query)
  }

  const handleQuickAction = (label: string) => {
    const prompts: Record<string, string> = {
      "Create Campaign": "Help me create a new campaign",
      Analyze: "How are my campaigns performing?",
      "AI Visibility": "Where am I losing to competitors in AI search?",
      Reports: "Show me revenue trends for the last 28 days",
      Catalog: "Which product attributes are weakest for AI answers?",
    }
    const prompt = prompts[label] ?? `Help me with ${label}`
    setInput("")
    setIsOpen(true)
    sendAssistantQuery(prompt)
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-indigo-500" />
          <h1 className="text-4xl font-semibold tracking-tight">
            {greeting}, {firstName}
          </h1>
        </div>

        {/* Chat input */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-border bg-muted/30 shadow-sm transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-200/50 dark:focus-within:border-indigo-700 dark:focus-within:ring-indigo-800/50"
        >
          <div className="px-4 pt-4 pb-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you today?"
              className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between px-3 pb-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Attach file"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                input.trim()
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "text-muted-foreground/50"
              )}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleQuickAction(action.label)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors",
                "hover:bg-accent hover:text-foreground"
              )}
            >
              <action.icon className="h-4 w-4 text-muted-foreground" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
