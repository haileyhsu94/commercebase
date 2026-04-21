# CommerceBase — Algorithm & Channel Orchestration

> CommerceBase is a fashion-focused commerce media platform with a dual DSP+SSP architecture.
> Advertisers set a goal and budget — our AI allocates across all channels to maximize ROAS.
> External demand partners can also buy our inventory via oRTB.

---

## 1. Channel DNA

| Channel | Speed | Strength | Pricing | Data Latency |
|---|---|---|---|---|
| **DailyClicks** (Open Web / DSP) | Instant | Volume, reach, awareness | CPM/CPC | Real-time (ClickHouse) |
| **CSS** (Google/Bing Shopping) | Slow (affiliate) | High purchase intent, high AOV | CPC (keyword bid) | Daily batch |
| **Realry** (Own SSP) | Medium | Stable conversions, 1st-party data | CPC/CPS | Real-time (MongoDB) |
| **StylMatch** (Creator) | Slow | Trust-based conversion, branding | CPS (commission) | Async |
| **Social** (Meta/TikTok) | Medium | Discovery, retargeting | CPC/CPM | Hourly API |

### Dual Architecture

```
                    CommerceBase (Orchestrator)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   DailyClicks(DSP)   Realry(SSP)    CSS/Social
   외부 인벤토리 구매   자체 인벤토리 판매   API 위임
         │               │
         ▼               ▼
   PubMatic, Magnite  Criteo DSP, TTD, DV360
   (we bid on them)   (they bid on us)
```

- **DSP (DailyClicks)**: Buys inventory on 500+ publisher sites
- **SSP (Realry/Sneakers123/FlexDog)**: Sells sponsored product slots to external DSPs via oRTB
- **CSS**: Google/Bing Shopping via Comparison Shopping Service partnership
- **Social**: Meta/TikTok Marketing API budget delegation
- **Creator**: StylMatch CPS affiliate network

---

## 2. Budget Allocation by Objective

### Default channel weights (v1, rule-based)

**Drive Sales (매출 극대화)**
```
CSS 45% | Realry 30% | DailyClicks 15% | StylMatch 10%
```
CSS highest ROAS from purchase intent, Realry stable complement.

**New Customers (신규 고객 확보)**
```
DailyClicks 40% | CSS 25% | Realry 20% | StylMatch 15%
```
DailyClicks 500+ publisher reach, StylMatch creator trust.

**Target ROAS (효율 최적화)**
```
CSS 40% | Realry 35% | DailyClicks 15% | StylMatch 10%
→ After 7 days: auto-adjust based on actual ROAS per channel
```

**Brand Awareness (인지도)**
```
DailyClicks 50% | StylMatch 25% | Realry 15% | CSS 10%
```

**Creator Commerce (StylMatch 특화)**
```
StylMatch 60% | Realry 20% | CSS 10% | DailyClicks 10%
```

These are v1 defaults. Real performance data overrides these ratios over time.

---

## 3. Bid Calculation per Channel

### DailyClicks (Open Web) — delegate to DailyClicks optimizer
- We send: `costMode=Bid, optimizationType=CVR`
- DailyClicks bidder handles CPC optimization internally
- **We control budget only**, not individual bid prices in v1
- v2: feed our pCVR signal into DailyClicks bid request via `ext.realry`

### CSS (Google/Bing Shopping) — existing RPC Waterfall
- marketing/ Rule-Based Bid Engine already handles this
- `rpc = Σ(daily_rpc × weight) / Σweight` (recency-weighted)
- Waterfall: Product level → Seller+Brand+Category → Seller → Default
- CommerceBase sets the budget envelope; marketing/ optimizes bids within it

### Realry (Own SSP) — internal priority scoring
- No external bidding; we control ad placement directly
- Sponsored products ranked by: relevance × advertiser bid × pCVR
- CPC based on internal floor price

### StylMatch (Creator) — CPS commission pool
- No bidding concept; budget = commission pool
- Creator matching algorithm (which creator for which product)
- Commission rate: configurable per campaign

### Social (Meta/TikTok) — API budget delegation
- We delegate budget + targeting to platform APIs
- Platform internal auction handles optimization
- We control: budget, audience segment, creative

---

## 4. Daily Rebalancing (v1)

```
Every day at 02:00 UTC (cron job):

1. Collect yesterday's channel performance:
   - DailyClicks: GET /adv/campaign?startDate=&endDate= (ClickHouse stats)
   - CSS: marketing/ API → BidCalculationJob results
   - Realry: MongoDB aggregate (affiliate_transactions, report_daily)
   - StylMatch: MongoDB aggregate (affiliate_transactions where channel=stylmatch)

2. Calculate per-channel efficiency:
   - Drive Sales → score = revenue / spend (ROAS)
   - New Customers → score = new_customers / spend
   - Target ROAS → score = 1 / |actual_ROAS - target_ROAS| (closer = better)
   - Awareness → score = impressions / spend (CPM efficiency)

3. Rebalance:
   - Top performer: +15% budget (capped at 2x original allocation)
   - Bottom performer: -15% budget (floor: 10% of original, never $0)
   - Middle channels: unchanged
   - Total budget stays constant (zero-sum rebalancing)

4. Apply:
   - DailyClicks: PUT /adv/campaign/{id} → update dailyBudget
   - CSS: update BidConfiguration budget envelope
   - Realry: update sponsored slot bid floor
   - StylMatch: update commission pool cap

5. Log rebalancing decision to cb_rebalance_log for audit trail
```

### Constraints
- Minimum 7 days of data before first rebalance (cold start)
- Maximum ±15% change per day (prevent oscillation)
- Floor budget per channel: 10% of original (maintain data collection)
- Advertiser can lock a channel's budget (opt out of rebalancing)

---

## 5. oRTB SSP — Retail Product Ads

### The Problem
oRTB is traditionally display ads (banners). We want to sell **product ad slots** (search sponsored, category sponsored) via oRTB.

### The Solution: OpenRTB Native Ad Spec
Instead of banner impressions, we offer **native product card slots**:

**Bid Request (Realry SSP → External DSPs):**
```json
{
  "imp": [{
    "native": {
      "request": {
        "assets": [
          { "id": 1, "required": 1, "img": { "type": 3, "w": 300, "h": 300 } },
          { "id": 2, "required": 1, "title": { "len": 90 } },
          { "id": 3, "required": 1, "data": { "type": 6, "len": 15 } }
        ]
      }
    },
    "tagid": "realry-search-sponsored",
    "bidfloor": 0.50,
    "ext": {
      "realry": {
        "page_type": "search_results",
        "query": "nike air max 90",
        "product_context": {
          "category": "sneakers",
          "brand_tier": "premium",
          "price_range": [100, 200],
          "season": "SS26"
        },
        "user_segment": {
          "style_cluster": "streetwear",
          "price_sensitivity": 0.4,
          "brand_affinity": ["Nike", "Jordan", "New Balance"]
        }
      }
    }
  }]
}
```

**Bid Response (External DSP → Realry SSP):**
```json
{
  "seatbid": [{
    "bid": [{
      "price": 1.20,
      "adm": {
        "native": {
          "assets": [
            { "id": 1, "img": { "url": "https://cdn.brand.com/product.jpg" } },
            { "id": 2, "title": { "text": "Nike Air Max 90 - Limited Edition" } },
            { "id": 3, "data": { "value": "$159.99" } }
          ],
          "link": { "url": "https://brand.com/product?utm=realry" }
        }
      }
    }]
  }]
}
```

### Rendering on Realry
```
🔍 "nike air max 90" search results:

[Sponsored] Nike Air Max 90 - Limited Edition  $159.99  ← oRTB winner
            Nike Air Max 90 OG                 $180.00  ← organic
            Nike Air Max 90 Futura             $165.00  ← organic
[Sponsored] Adidas Ultraboost 2026             $189.00  ← oRTB winner
```

### Data Moat — ext.realry
Fields in `ext.realry` that Criteo/TTD cannot replicate:
- `style_cluster` (streetwear, minimal, classic) — fashion-specific
- `brand_affinity` (user's preferred brands) — years of 1st-party data
- `price_sensitivity` (0-1 score) — purchase history derived
- `product_context.season` — fashion cycle awareness

External DSPs see this data in bid requests → make better bids → higher CPMs for us → higher revenue.

---

## 6. Why "Real-Time Optimization" not "RTB"

CommerceBase is NOT purely an RTB system. RTB is one component inside a broader optimization engine.

```
Channel-level reality:

DailyClicks:  bid request → 100ms response  → ✅ True RTB (OpenRTB 2.6)
CSS:          daily batch bid update         → ❌ Not RTB (batch optimization)
Realry SSP:   search-time ad ranking         → 🟡 Real-time, but internal auction
StylMatch:    creator-product matching       → ❌ Async matching
Social:       hourly budget/audience update  → ❌ Platform delegation
```

**Correct terminology:**
- ❌ "We do RTB" → only DailyClicks channel is RTB
- ✅ "Purchase-trained optimization engine" → covers all channels
- ✅ "Real-time commerce optimization across 5 channels"
- ✅ "AI bidding engine powered by 1st-party purchase data"

**The differentiator is NOT the bidding protocol — it's the data:**
Every confirmed purchase across our network feeds back into the model within 24 hours. We don't estimate conversions — we know them. This creates a compounding optimization advantage regardless of whether the channel uses RTB, batch bidding, or API delegation.

---

## 6-A. CSS Bid Engine (Existing — marketing/ project)

The CSS channel already has a production bid calculation engine. CommerceBase inherits and gradually enhances it.

### Current Pipeline (Rule-Based Bid Calculation Engine)

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐
│ Data Sources │ → │ RPC Engine   │ → │ Bid Modifiers│ → │ Safety       │ → │ Output   │
│              │   │              │   │              │   │ Controls     │   │          │
│ MongoDB      │   │ Recency-     │   │ Global       │   │ Min/Max CPC  │   │ S3 CSV   │
│ BigQuery     │   │ Weighted     │   │ Price Range  │   │ % Change Cap │   │ Parquet  │
│ Bid Configs  │   │ RPC Waterfall│   │ Bid Overrides│   │ Abs Change   │   │ QA Report│
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────┘
```

### RPC Waterfall (core formula)
```
rpc = Σ(daily_rpc × weight) / Σ(weight)
weight: min (oldest day) → max (newest day)  // recency-weighted

Waterfall priority:
  1. Product level    (50+ clicks)  → most precise
  2. Seller + Brand + Category
  3. Seller level     (500+ clicks)
  4. Default fallback
```

### Data Sources
- **MongoDB**: Internal events, product catalog, order data
- **BigQuery**: Google Ads performance data (impressions, clicks, cost, conversions)
- **Bid Configurations**: Min/max CPC, change caps, recency weights per market

### Bid Modifiers (applied after RPC calculation)
- **Global Modifier**: overall scaling factor
- **Price Range Modifier**: adjust by product price band (cheap products get lower CPC)
- **Bid Overrides**: manual rules for specific products/sellers (safety valve)

### Safety Controls
- **Min/Max CPC Bounds**: absolute floor and ceiling per market
- **% Change Caps**: prevent wild swings (e.g., max ±30% per day)
- **Absolute Change Caps**: max €X change per day regardless of percentage
- **Bid Type Filter**: apply different rules for different bid types
- **Existing Bids reference**: compare against yesterday's bids
- Output becomes **next day's baseline** (circular feedback)

### CSS Revenue Models (CPS vs CPC)

CommerceBase supports both models simultaneously:

| | CPS (Affiliate, current) | CPC (Direct, CommerceBase) |
|---|---|---|
| Revenue timing | After purchase (30-90d delay) | On click (immediate) |
| Risk | We pay CPC upfront, lose if no conversion | Advertiser pays per click |
| Margin | Uncertain (depends on CVR) | Predictable (CPC spread) |
| Advertiser appeal | "Pay only for sales" → low barrier | "Pay for clicks, AI optimizes" → performance focus |
| Data ownership | Affiliate network in the middle | Full 1st-party data |

**Strategy**: CPS for long-tail merchants (low barrier onboarding), CPC for CommerceBase premium advertisers (bigger budgets, full optimization).

### Hybrid Coexistence Model (CPS + CPC)

When an existing CPS affiliate partner joins CommerceBase as an advertiser, both models coexist without double-charging:

```
Channel-by-channel billing:

  CSS (Google/Bing):     CPS retained (affiliate, as-is)
                         CommerceBase value = smarter bid optimization
                         No additional charge

  Realry/Sneakers123:    CPS (organic listing) + CPC (Sponsored slots)
                         Organic: existing affiliate, no change
                         [Sponsored]: new paid placement via CommerceBase

  DailyClicks:           CPC only (purely new channel)
                         Never existed for this partner before
                         No overlap with affiliate

  StylMatch:             CPS retained (creator commission)
                         CommerceBase value = better creator matching

  Social (Meta/TikTok):  CPC/CPM (purely new channel)
```

**Realry search results — coexistence visualized:**
```
[Sponsored] Nike Air Max 90 €159      ← CommerceBase CPC (advertiser pays)
[Sponsored] Adidas Ultraboost €189    ← CommerceBase CPC
─────────────────────────────────
Nike Dunk Low €129                     ← Organic/affiliate (CPS on purchase)
New Balance 990 €175                   ← Organic/affiliate
Puma Suede €89                         ← Organic/affiliate
```

**Rules:**
- One product, one billing path per placement (never CPS + CPC for same click)
- Organic/affiliate listings and Sponsored slots are separate inventory
- Same brand can appear in both — different placements, different billing
- CommerceBase value for existing partners = "everything you had + more on top"

**Partner pitch:**
> "Your affiliate setup keeps running. CommerceBase adds two things on top: 500+ website ads (DailyClicks) and priority placement on our shopping sites (Sponsored). Existing commission structure is unchanged — you only pay extra for the new exposure."

---

## 6-B. Algorithm Evolution Path

### How ML gradually replaces rule-based components

```
Phase 1 (Now): Rule-Based
  ├─ Fixed objective-based channel weights (§2)
  ├─ Daily rebalancing ±15% cap
  ├─ DailyClicks: delegate to their optimizer (costMode=Bid)
  ├─ CSS: RPC Waterfall (marketing/ bid_calculation.py)
  ├─ Realry: internal priority scoring
  └─ StylMatch: manual commission pool

Phase 2: Statistical (3-6 months)
  ├─ Channel weights from historical ROAS per product category
  ├─ Multi-armed bandit (explore 10% / exploit 90%)
  ├─ CSS: ML adjustment factor on RPC
  │     rpc = weighted_avg(daily_rpc) × ml_adjustment
  ├─ Confidence intervals for rebalancing decisions
  └─ Hourly rebalancing for DailyClicks

Phase 3: ML (6-12 months)
  ├─ LightGBM pCVR model per channel per product category
  ├─ CSS: ML replaces RPC Waterfall core
  │     rpc = ml_model.predict(product, seller, category, market, season)
  │     Modifiers and Safety Controls remain (critical safeguards)
  ├─ DailyClicks: feed pCVR scores into Aerospike → bidder uses them
  ├─ Realry SSP: ML-ranked sponsored products
  ├─ Cross-channel attribution model
  └─ Automated channel selection (not just budget rebalancing)

Phase 4: Deep Learning (12+ months)
  ├─ Two-Tower model (User Tower + Product Tower)
  ├─ Real-time bid optimization on own SSP
  ├─ Sequence modeling (user journey across channels)
  └─ LTV prediction for customer value-based bidding (§4-2)
```

**Key principle**: The pipeline structure (Data → Engine → Modifiers → Safety → Output) stays constant. Only the Engine core evolves from rules to ML. Modifiers and Safety Controls are always needed regardless of how smart the model gets.

---

## 7. Market Availability Matrix

BudgetAllocator는 광고주의 `targetMarket`에 따라 사용 불가능한 채널을 자동 제외하고 남은 채널에 재분배.

```
                    EU    UK    US    APAC   Global
DailyClicks (RTB)    ✅    ✅    ✅     ✅      ✅
CSS (Google/Bing)    ✅    ✅    ❌     ❌      ❌
Realry Network       ✅    ✅    ✅     ✅      ✅
StylMatch            ✅    ✅    ✅     🟡      ✅
Social (Meta)        ✅    ✅    ✅     ✅      ✅
Social (TikTok)      ✅    ✅    ✅     ✅      ✅
```

Example: `targetMarket: "north_america"` → CSS unavailable
```
Drive Sales default:    CSS 45% | Realry 30% | DC 15% | SM 10%
US adjusted:            CSS  0% | Realry 48% | DC 35% | SM 17%
```

---

## 8. 1st Party Data Flywheel

```
Campaign Execution → Clicks → Orders (confirmed, 1st party, our DB)
     ↑                                    │
     │            ML Training Data         │
     │                                    ▼
     └──── Model Retrain → Better pCVR → Better Budget Allocation → Better ROAS
```

Key advantage vs Criteo:
- Criteo estimates conversions via 3rd-party cookies (broken on Safari)
- **We own the actual order data** — Shopify/Cafe24/Godomall order webhooks write directly to realry DB
- No estimation, no attribution gaps, no cookie dependency

Data sources feeding the flywheel:
- `affiliate_transactions` — click → purchase chain per seller, per product, per channel
- `orders` / `order_products` — actual transaction amounts, AOV, category
- `external_affiliate_transactions` — CSS/external channel conversions
- DailyClicks ClickHouse — impression/click/conversion events
- StylMatch — creator-driven purchase attribution

---

## 9. Architecture Diagrams

- **IR/Simple version:** `docs/architecture-simple.html`
- **Technical detail version:** `docs/architecture-technical.html`

Open in browser to view. SVG-based, resolution-independent, can be exported to PDF/PNG for presentations.

---

## 10. Investor Pitch — One-Liner

> "CommerceBase is a fashion-focused commerce media platform with a dual DSP+SSP architecture. Advertisers set a goal and budget — our AI allocates across owned inventory (Realry, Sneakers123, StylMatch), programmatic open web (DailyClicks, 500+ publishers), CSS (Google/Bing Shopping), and social (Meta/TikTok) to maximize ROAS. External demand partners (Criteo, The Trade Desk) can also buy our inventory via oRTB with fashion-specific bidding signals, creating a two-sided marketplace with compounding data advantages."

---

*Last updated: 2026-04-16*
*See also: rtb-context.md (original RTB architecture), PRODUCT_VISION.md (§3-1 CommerceMax, §4-1 Total Revenue Optimisation)*
