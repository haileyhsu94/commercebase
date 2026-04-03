/** Sidebar sub-navigation for Analytics and Assets (production IA). */

export const analyticsSubnav = [
  { href: "/analytics", label: "Performance" },
  { href: "/analytics/audiences", label: "Audiences" },
] as const

export const assetsSubnav = [
  { href: "/catalogs", label: "Catalogs" },
  { href: "/publishers", label: "Publishers" },
] as const

/** Performance: all /analytics routes except Audiences. */
export function analyticsSubItemActive(pathname: string, href: string): boolean {
  if (href === "/analytics/audiences") {
    return pathname === "/analytics/audiences" || pathname.startsWith("/analytics/audiences/")
  }
  if (href === "/analytics") {
    return (
      pathname.startsWith("/analytics") &&
      pathname !== "/analytics/audiences" &&
      !pathname.startsWith("/analytics/audiences/")
    )
  }
  return false
}

/** Catalogs includes product catalog when redirected from /catalogs → /products. */
export function assetsSubItemActive(pathname: string, href: string): boolean {
  if (href === "/publishers") {
    return pathname.startsWith("/publishers")
  }
  if (href === "/catalogs") {
    return pathname.startsWith("/catalogs") || pathname.startsWith("/products")
  }
  return false
}
