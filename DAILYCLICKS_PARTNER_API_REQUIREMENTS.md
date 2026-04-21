# CommerceBase ↔ DailyClicks — Integration Brief

> **From:** Steve (TRG)
> **For:** Denis & DailyClicks engineering team
> **Date:** 2026-04-15

---

## What CommerceBase Is

CommerceBase is our commerce media platform for advertisers. Think of it like **Google's Performance Max** for the open internet:

- The advertiser sets a **goal** (drive sales, target ROAS, acquire new customers) and a **budget**
- CommerceBase's AI engine decides **where and how** to spend that budget across our network
- The advertiser sees unified results — revenue, ROAS, conversions — without managing individual channels

Under the hood, CommerceBase orchestrates multiple demand channels:

- **Shopping** — Realry, Google CSS, Bing CSS
- **Creator** — StylMatch network
- **Open Web / Programmatic** — DailyClicks
- **Vertical** — Sneakers123, FlexDog

**The advertiser doesn't choose or see "DailyClicks" directly.** CommerceBase's optimization engine automatically allocates budget to DailyClicks when programmatic open web inventory is the best path to the advertiser's goal.

---

## What We Need from DailyClicks

CommerceBase needs to programmatically operate DailyClicks as a channel — creating and managing campaigns, reading performance data, and controlling spend.

### 1. Campaign Lifecycle
- **Create** a programmatic campaign with targeting, budget, and creatives
- **Pause / Resume** a running campaign
- **Update** budget and targeting on a running campaign
- **Delete** / archive a campaign

### 2. Performance Data
- **Per-campaign stats** — impressions, clicks, spend, conversions, CTR, CPC, CVR
- **Date range filtering** — "show me this campaign's performance for the last 7 days"
- Ideally **daily breakdown** — day-by-day stats for trend charts in our unified dashboard

### 3. Budget Visibility
- **Current spend** vs budget — so our engine knows how much headroom remains
- **Budget exhaustion** awareness — important for automatic reallocation to other channels

### 4. Creative Management
- **Upload** display/native creatives and link them to campaigns
- **Check status** — know when a creative is approved and ready to serve

### 5. Reference Data
- **Countries / regions** — we need to map targeting selections to your system
- **Available inventory** — what SSPs/exchanges are available

---

## How CommerceBase Campaigns Translate

When our AI engine decides to activate the DailyClicks channel for a campaign, it needs to translate high-level advertiser goals into DailyClicks campaign settings:

| What the advertiser sets in CommerceBase | What needs to happen on DailyClicks |
|---|---|
| Goal: "Drive sales", "New customers", etc. | Optimization strategy (we need guidance on best mapping) |
| Bid strategy: Maximize conversions / Target ROAS / Target CPA | Cost type, bid mode, optimization target |
| Total campaign budget (our engine calculates the DailyClicks portion) | Budget for this channel's campaign |
| Schedule: start date → end date | Start/end dates |
| Target regions: "UK & Ireland", "EU", "North America", etc. | Country/region targeting |
| Devices: desktop, mobile, tablet | Device targeting |
| Product feed → auto-generated creatives | Display/native creatives |

We don't want to prescribe how this mapping should work — your team knows the system best. We'd appreciate Denis's recommendation on the optimal way to translate these inputs into DailyClicks campaign configurations.

---

## Scale Context

**Near-term (next 2-3 months):**
- A handful of advertisers, 10-50 campaigns total
- Low API volume — campaign management operations only, not real-time bidding

**Medium-term (6-12 months):**
- Hundreds of advertisers, each with multiple campaigns
- Need per-advertiser isolation (separate budgets, separate reporting)
- Budget reallocation happening more frequently as our AI engine learns

**Long-term:**
- Real-time budget reallocation across channels based on live performance signals
- Real-time performance monitoring
- Event-driven notifications (budget alerts, campaign status changes)

We want to start simple and grow into the more complex requirements. What's the best way to approach this given the current architecture?

---

## Questions for Denis

1. **What's the recommended way to integrate programmatically?** We've seen the existing advertiser API — is that the right starting point, or would you suggest a different approach?

2. **Campaign creation flow** — What are the required steps and fields to get a campaign live? Are there dependencies (Insertion Orders, creative approval) we should know about?

3. **Budget management** — This was flagged as an important topic. Our engine needs to dynamically adjust DailyClicks budgets as it reallocates across channels. What are the options for budget control, spend tracking, and automatic pausing?

4. **Stats availability** — What granularity of performance data can we access? Daily? Hourly? Real-time? What's the best way to pull it?

5. **Multi-advertiser isolation** — For the medium-term, what's the cleanest way to keep advertisers separate? Separate accounts, sub-accounts, API scoping?

6. **What do you need from us?** Any context, specs, or decisions that would help you recommend the best integration path?

---

## What We Handle on Our Side

For context — these are things CommerceBase manages independently (no DailyClicks work):

- Advertiser authentication & multi-tenancy
- **Cross-channel budget allocation** — our AI engine decides how much budget goes to DailyClicks vs other channels, based on real-time performance
- **Unified analytics** — aggregating data from DailyClicks + all other channels into a single dashboard
- AI Visibility tracking (brand presence across AI shopping engines)
- Campaign orchestration — one advertiser campaign maps to multiple channel-specific campaigns

---

## Next Steps

Happy to set up a call with Denis to walk through the above. We're flexible on approach — our goal is to find the integration path that works well for both sides and can evolve as we scale.
