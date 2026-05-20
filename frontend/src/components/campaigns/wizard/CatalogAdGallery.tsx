/**
 * Catalog ad gallery — renders example dynamic product ads using sample
 * products. Used when the Creative step's source is "Use product catalog",
 * to show users what their ads will look like with their own products in
 * each format.
 */

interface CatalogProduct {
  id: string
  name: string
  price: string
  imageUrl: string
}

/** Mock product samples — picsum image IDs picked to feel like apparel. */
const SAMPLE_PRODUCTS: CatalogProduct[] = [
  { id: "p1", name: "Linen blend midi dress", price: "$128", imageUrl: "https://picsum.photos/seed/cb-prod-1/600/600" },
  { id: "p2", name: "Cropped denim jacket", price: "$148", imageUrl: "https://picsum.photos/seed/cb-prod-2/600/600" },
  { id: "p3", name: "Leather crossbody bag", price: "$210", imageUrl: "https://picsum.photos/seed/cb-prod-3/600/600" },
  { id: "p4", name: "Suede ankle boots", price: "$245", imageUrl: "https://picsum.photos/seed/cb-prod-4/600/600" },
]

export function CatalogAdGallery({ domainLabel }: { domainLabel?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Preview using <span className="font-medium text-foreground">sample products</span>{" "}
          from your catalog. Live ads rotate through your actual inventory.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Carousel (1.91:1) — multiple products in a strip */}
        <FormatBlock label="Carousel" aspect="1.91:1">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex aspect-[1.91/1] divide-x">
              {SAMPLE_PRODUCTS.slice(0, 3).map((p) => (
                <ProductTile key={p.id} product={p} compact />
              ))}
            </div>
            <DomainStrip domainLabel={domainLabel} />
          </div>
        </FormatBlock>

        {/* Single product square (1:1) */}
        <FormatBlock label="Single product" aspect="1:1">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="aspect-square">
              <ProductTile product={SAMPLE_PRODUCTS[0]} />
            </div>
            <DomainStrip domainLabel={domainLabel} cta="Shop now" />
          </div>
        </FormatBlock>

        {/* Story / Reel (9:16) — tall product card */}
        <FormatBlock label="Story / Reel" aspect="9:16">
          <div className="mx-auto w-[64%] overflow-hidden rounded-xl border bg-card">
            <div className="aspect-[9/16]">
              <ProductTile product={SAMPLE_PRODUCTS[1]} />
            </div>
            <DomainStrip domainLabel={domainLabel} cta="Shop now" />
          </div>
        </FormatBlock>

        {/* Shopping grid — Google Shopping-style 2x2 */}
        <FormatBlock label="Shopping grid" aspect="grid">
          <div className="overflow-hidden rounded-xl border bg-card p-2">
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PRODUCTS.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="aspect-square overflow-hidden rounded-md">
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="line-clamp-1 text-[10px] text-foreground">{p.name}</div>
                  <div className="text-[10px] font-semibold">{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </FormatBlock>
      </div>
    </div>
  )
}

function FormatBlock({
  label,
  aspect,
  children,
}: {
  label: string
  aspect: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          {aspect}
        </span>
      </div>
      {children}
    </div>
  )
}

function ProductTile({ product, compact = false }: { product: CatalogProduct; compact?: boolean }) {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden bg-muted">
        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className={compact ? "px-1.5 py-1" : "px-2 py-1.5"}>
        <div className={compact ? "line-clamp-1 text-[10px] font-medium" : "line-clamp-1 text-xs font-medium"}>
          {product.name}
        </div>
        <div className={compact ? "text-[10px] font-semibold" : "text-xs font-semibold"}>
          {product.price}
        </div>
      </div>
    </div>
  )
}

function DomainStrip({ domainLabel, cta }: { domainLabel?: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between border-t px-2 py-1.5 text-[10px]">
      <span className="truncate text-muted-foreground">{domainLabel ?? "yourbrand.com"}</span>
      {cta && (
        <span className="rounded-md bg-foreground px-2 py-0.5 text-background">{cta}</span>
      )}
    </div>
  )
}
