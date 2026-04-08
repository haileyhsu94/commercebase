# CommerceBase — Product Vision & Roadmap Anchor

> **One-line summary:** CommerceBase is a commerce media infrastructure that unifies fragmented commerce advertising channels across the open internet into a single AI engine and optimizes for actual sales rather than clicks.
>
> If Google automates search and Meta automates attention — **CommerceBase automates sales.**

---

## Why This Document Exists

Every feature built in this codebase should answer: *"Which part of the product vision does this serve?"*
Use the section references (e.g. `§3-1`, `§4-2`) when writing PRs, tickets, or design specs to anchor decisions back to the product strategy.

---

## 1. The Problem CommerceBase Solves

| # | Structural Limitation | What CommerceBase Does Instead |
|---|----------------------|-------------------------------|
| 1 | **Channels are fragmented** — search, creator, affiliate, programmatic, open-web publishers all managed separately | Unifies every channel into a single AI engine |
| 2 | **Advertising is click-driven** — platforms optimise for CTR/traffic, not actual purchases | Optimises for sales, conversion, and repeat customers |
| 3 | **Data is disconnected** — the full impression → click → visit → purchase → repeat journey exists in silos | Closes the loop into one connected measurement system |

---

## 2. What CommerceBase Is

**An AI-powered commerce optimisation operating system for the open internet.**

The platform connects:
- **Realry** — search-based shopping intent channel
- **StylMatch** — creator commerce channel
- **DailyClicks** — programmatic supply channel
- **Open web publisher networks**
- **External ecosystems** — Google CSS, Bing CSS, affiliate networks

The AI analyses performance and purchase intent across all channels in real time and automatically allocates the total marketing budget to the channels with the highest likelihood of generating revenue.

---

## 3. Core Features (Capability Map)

### 3-1. CommerceMax — Cross-Channel AI Engine `§3-1`
> *"Let AI operate the entire network like a single revenue engine."*

- Single AI model manages inventory across the entire global commerce media network
- Calculates conversion probability and incremental revenue potential per channel in real time
- Automatically allocates budget against advertiser ROI targets
- No manual per-channel budget management required

**What this anchors in the UI:** Campaign creation, budget allocation interface, channel performance dashboard, ROAS/CVR reporting.

---

### 3-2. Commerce Smart Bidding `§3-2`
> *"When advertisers input their business goals, AI automatically optimises bidding and traffic allocation."*

Advertisers set goals:
- Maximise sales
- Achieve target ROAS
- Acquire new customers

The AI analyses millions of simultaneous signals:
- Search behaviour & queries
- Pricing & seasonality
- Purchase signals
- Product view data

**What this anchors in the UI:** Campaign wizard (goal selection), bid strategy settings, real-time performance indicators.

---

### 3-3. AI Intent Match `§3-3`
> *"Move beyond exact keyword matching toward advertising based on purchase probability."*

- Understands purchase intent from behavioural signals, not just keywords
- Can serve relevant product ads even without an exact search term match
- Bridges the gap between discovery and purchase intent

**What this anchors in the UI:** AI Visibility / AI presence pages, audience segments, purchase intent signals table.

---

### 3-4. AI Max for Commerce `§3-4`
> *"Optimise not only ad delivery but the entire commerce funnel from product discovery to landing experience."*

Inputs the AI analyses:
- Product feeds
- Pricing data
- Inventory data
- Landing page information

Outputs the AI improves:
- Product exposure
- Matching logic
- Landing experience optimisation

**What this anchors in the UI:** Product catalogue management, product performance analytics, AI attribute optimisation, Competitors & Gaps / Opportunities pages.

---

### 3-5. Advisor Capabilities `§3-5`
> *"Not just an automation engine — a commerce AI advisor that supports advertising decision-making."*

When performance changes, the AI explains why and recommends what to do:
- Analyses conversion rates, traffic quality, channel performance, user behaviour
- Provides actionable next steps: budget reallocation, audience expansion, product prioritisation, channel optimisation

**What this anchors in the UI:** Auto Agent, AI chat panel (Aeris), alert system, performance recommendations, Competitors & Gaps opportunities.

---

## 4. Core Differentiators

### 4-1. Total Revenue Optimisation (Not Channel Optimisation) `§4-1`
Most platforms optimise within a single channel. CommerceBase optimises **total budget across all channels simultaneously** toward the highest possible overall revenue and ROI.

→ *Every analytics view should show cross-channel totals first, then drill down.*

### 4-2. Customer Value-Based Bidding `§4-2`
Learns from 1st-, 2nd-, and 3rd-party data to predict **long-term LTV**, not just immediate click likelihood. More traffic and spend is directed toward users likely to become high-value repeat customers.

→ *Audience segmentation, retargeting pools, and new customer funnel all serve this.*

### 4-3. Closed-Loop Measurement `§4-3`
Connects the full journey:

```
Impression → Click → Session → Purchase → Repeat Purchase
```

Data flows back into the AI engine, creating a **self-reinforcing performance loop** that improves over time.

→ *Analytics sub-pages (Performance, Channels, Products, Audiences, Regions) are the UI surface for this loop.*

---

## 5. Advertiser Workflow Transformation

| Traditional Workflow | CommerceBase Workflow |
|---------------------|----------------------|
| Manually build audience segments | Connect customer data once |
| Extract remarketing lists | AI predicts high repurchase probability automatically |
| Adjust budget per channel manually | AI determines best channel per user |
| Monitor performance daily & optimise manually | AI optimises bidding, budget, product exposure, traffic quality continuously |
| **Marketer role: operational execution** | **Marketer role: strategic decisions & growth planning** |

---

## 6. Investment Thesis (Why This Scales)

| Driver | Mechanism |
|--------|-----------|
| **Scalability** | Every new channel added increases platform value non-linearly |
| **Data compounding** | More campaign + purchase data → stronger AI → higher barriers to entry |
| **Repeatable performance** | Closed-loop system continuously improves ROAS and customer acquisition |

---

## 7. Feature → Vision Mapping

Use this table to anchor every UI feature to the product strategy. Add rows as new features ship.

| UI Feature / Page | Core Capability | Section Reference | Status |
|-------------------|----------------|------------------|--------|
| Campaign list & detail | CommerceMax budget allocation | §3-1 | Shipped |
| Campaign wizard (goal selection) | Commerce Smart Bidding | §3-2 | Shipped |
| AI Visibility / AI presence overview | AI Intent Match signals | §3-3 | Shipped |
| Shopping Journey funnel | Closed-loop measurement | §4-3 | Shipped |
| Competitors & Gaps | Advisor Capabilities | §3-5 | Shipped |
| Opportunities tab | Advisor Capabilities — recommendations | §3-5 | Shipped |
| Auto Agent | Advisor Capabilities — automated execution | §3-5 | Shipped |
| Performance overview (Analytics) | Closed-loop measurement | §4-3 | Shipped |
| Channels sub-page | Total revenue optimisation | §4-1 | Shipped |
| Products sub-page | AI Max for Commerce | §3-4 | Shipped |
| Audiences sub-page | Customer value-based bidding | §4-2 | Shipped |
| New customer funnel (Audiences) | Customer LTV prediction | §4-2 | Shipped |
| Purchase intent signals (Audiences) | AI Intent Match | §3-3 | Shipped |
| Retargeting pools (Audiences) | Customer value-based bidding | §4-2 | Shipped |
| Regions sub-page | Cross-channel total revenue view | §4-1 | Shipped |
| Attributes page | AI Max for Commerce — product feed | §3-4 | Shipped |
| Prompts / AI copy optimisation | AI Max for Commerce — matching logic | §3-4 | Shipped |
| Product catalogue & sync | AI Max for Commerce — product feed | §3-4 | Shipped |
| Date range filter (all analytics) | Closed-loop measurement — trend visibility | §4-3 | Shipped |
| Aeris AI chat panel | Advisor Capabilities | §3-5 | In progress |
| Alert / notification system | Advisor Capabilities — proactive insights | §3-5 | In progress |

---

## 8. Design Principles (Derived from Vision)

These should guide every UI/UX decision:

1. **Sales over clicks** — Surface revenue, ROAS, and conversions prominently. Never lead with impressions or CTR alone.
2. **Cross-channel first** — Aggregated totals always precede per-channel breakdowns.
3. **AI explains itself** — Every AI decision or recommendation should come with a reason.
4. **Reduce marketer toil** — If the user has to do something manually that the AI could do, it's a product gap.
5. **Close the loop visually** — The impression → purchase journey should be visible, not inferred.

---

*Source: Commerce Base ENG.pdf — internal product overview document*
