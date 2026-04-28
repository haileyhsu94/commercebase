import { Link } from "react-router-dom"
import { Plus, BarChart3, Bot, Package, ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const actions = [
  {
    title: "Create Campaign",
    description: "Launch a new campaign",
    icon: Plus,
    href: "/campaigns?create=1",
    variant: "default" as const,
  },
  {
    title: "View Reports",
    description: "Deep-dive into analytics",
    icon: BarChart3,
    href: "/analytics",
    variant: "secondary" as const,
  },
  {
    title: "Check AI Visibility",
    description: "Share of voice & competitors",
    icon: Bot,
    href: "/ai-presence",
    variant: "secondary" as const,
  },
  {
    title: "Manage Catalogs",
    description: "Sync product feeds",
    icon: Package,
    href: "/products",
    variant: "secondary" as const,
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          to={action.href}
          className={cn(
            buttonVariants({ variant: action.variant }),
            "group/action h-auto min-h-11 justify-start gap-3 whitespace-normal p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
            action.variant === "secondary" &&
              "hover:bg-secondary/60"
          )}
        >
          <action.icon className="h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1 text-left">
            <div className="font-medium">{action.title}</div>
            <div className="text-xs font-normal opacity-70">{action.description}</div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover/action:opacity-70" />
        </Link>
      ))}
    </div>
  )
}
