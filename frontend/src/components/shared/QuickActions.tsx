import { Link } from "react-router-dom"
import { Plus, BarChart3, Bot, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCampaignPlanAllowance } from "@/hooks/use-campaign-plan-allowance"

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
    variant: "outline" as const,
  },
  {
    title: "Check AI Visibility",
    description: "Share of voice & competitors",
    icon: Bot,
    href: "/ai-presence",
    variant: "outline" as const,
  },
  {
    title: "Manage Catalogs",
    description: "Sync product feeds",
    icon: Package,
    href: "/products",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  const allowance = useCampaignPlanAllowance()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => {
        const isCreate = action.title === "Create Campaign"
        const subline =
          isCreate && allowance.includedPerMonth > 0
            ? `${allowance.usedThisMonth}/${allowance.includedPerMonth} campaigns used`
            : action.description

        return (
          <Button
            key={action.title}
            variant={action.variant}
            className="h-auto justify-start gap-3 p-4"
            asChild
          >
            <Link to={action.href}>
              <action.icon className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs font-normal opacity-70">{subline}</div>
              </div>
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
