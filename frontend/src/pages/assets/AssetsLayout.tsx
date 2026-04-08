import { ChevronRight } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

const pageInfo: Record<string, { label: string; description: string }> = {
  "/catalogs": {
    label: "Catalogs",
    description: "Manage product feeds, monitor sync health, and fix data quality issues.",
  },
  "/publishers": {
    label: "Publishers",
    description: "Manage advertising reach, performance, and partner relationships across the network.",
  },
  "/products": {
    label: "Products",
    description: "Overview of your product catalog and synchronization status.",
  },
  "/products/sync": {
    label: "Sync Status",
    description: "Monitor product feed health and third-party integrations.",
  },
}

export function AssetsLayout() {
  const { pathname } = useLocation()
  
  // Find the closest parent path for info if the exact path isn't found
  const info = pageInfo[pathname] || 
               Object.entries(pageInfo).find(([path]) => pathname.startsWith(path))?.[1] || 
               { label: "Assets", description: "Manage your commerce assets and partner networks." }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border/60 pb-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
              <Link
                to="/catalogs"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Assets
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
              <span className="font-medium text-foreground">{info.label}</span>
            </nav>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{info.label}</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{info.description}</p>
          </div>
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 pt-6">
        <Outlet />
      </div>
    </div>
  )
}
