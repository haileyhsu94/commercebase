import type { BrandMemories } from "@/lib/company-profile"

/**
 * Pre-written brand memories per known website host. Used by Step 1 of the
 * onboarding flow to simulate a live AI brand-research moment. When the host
 * is unknown, a generic "we couldn't extract enough" placeholder is used so
 * the user can still continue.
 */
const MEMORIES: Record<string, BrandMemories> = {
  "realry.com": {
    companyOverview: `**Realry** is an AI-powered fashion discovery platform that surfaces the right product at the best price across 23M+ items from 6,000+ brands worldwide. The platform pairs a meta-search catalog with a personalization layer (Aeris) that learns user taste over time, enabling a conversational shopping experience that legacy competitors cannot replicate with keyword engines.

**Brand Values**
- **Radical Curation** — intentional selection, not passive aggregation
- **Personal Intelligence** — AI that learns your taste
- **Inclusive Discovery** — diverse price points, aesthetics, and body types

**Business Model**
Realry monetizes through **affiliate commissions** (click-outs to retailer sites) and **sponsored placements** (Featured Collections, brand spotlights). The platform does not operate a checkout; all transactions are completed on partner retailer sites.`,
    icp: `- **Not bargain hunters buying fast fashion** — Realry's brand partners are premium and luxury (Gucci, Valentino, Alexander McQueen, Burberry); the value proposition is finding the best price for *quality* goods, not cheap goods
- **Not casual or infrequent shoppers** — the personalization model and price alert features deliver compounding value to repeat, engaged users
- **Not B2B buyers** — Realry is a consumer platform; the brand/retailer side is a partner/advertiser relationship, not the primary ICP

**Market Context**
Realry competes primarily with **Lyst** and **Stylight** in the fashion meta-search space. The key differentiator is AI depth (Aeris vs. more basic aggregation), catalog scale (23M+ SKUs), and the personalization layer that improves with use. Realry is also one of the few fashion meta-search platforms expanding aggressively into AI-powered commerce media and adtech — meaning its ICP is increasingly valuable not just as a shopper but as a high-intent, taste-profiled audience for brand advertisers.`,
    messagingPositioning: `**Positioning Statement (Synthesized)**
For fashion-forward shoppers who are overwhelmed by the fragmented retail landscape, Realry is the AI-powered fashion discovery platform that surfaces the right product at the best price — across 23M+ items from 6,000+ brands worldwide. Unlike traditional aggregators or single-retailer sites, Realry understands your style and context, not just your search terms, acting as a personal stylist that collapses the gap between inspiration and ownership.

**Key Stats for Messaging**
- **23M+** products indexed
- **6,000+** brand partners
- **200+** markets served
- **1%** guaranteed cash back on every purchase
- Founded **2020**; raised ~$9.8M in cumulative funding (Seed + Series A as of mid-2025)`,
  },
}

const GENERIC: BrandMemories = {
  companyOverview: `**[Your brand]** is a commerce business operating across your selected markets. To sharpen these memories, add more context in **Settings → Company profile** or paste in your About / Press page text.`,
  icp: `- We couldn't extract a confident ICP from the homepage alone
- The model will refine these memories as it ingests more campaigns and catalog data
- You can edit this card directly to seed the AI with your audience description`,
  messagingPositioning: `Add your positioning statement, core messaging pillars, and key stats. The agent references this on every campaign brief.`,
}

/** Lookup memories for a given website host. Returns generic fallback if unknown. */
export function memoriesForHost(host: string): BrandMemories {
  const key = host.toLowerCase().replace(/^www\./, "")
  return MEMORIES[key] ?? GENERIC
}
