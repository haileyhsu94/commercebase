/** Sidebar sub-navigation for Analytics and Assets (production IA). */

export const analyticsSubnav = [
  { href: "/analytics", label: "Performance" },
  { href: "/analytics/channels", label: "Channels" },
  { href: "/analytics/products", label: "Products" },
  { href: "/analytics/audiences", label: "Audiences" },
  { href: "/analytics/regions", label: "Regions" },
] as const

export const assetsSubnav = [
  { href: "/catalogs", label: "Catalogs" },
  { href: "/publishers", label: "Publishers" },
] as const

/** Returns true when the given nav href is the active sub-page. */
export function analyticsSubItemActive(pathname: string, href: string): boolean {
  if (href === "/analytics") {
    // Only active for the exact performance root (not any sub-page)
    return pathname === "/analytics"
  }
  // All other sub-pages: match exact path or nested paths
  return pathname === href || pathname.startsWith(href + "/")
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
