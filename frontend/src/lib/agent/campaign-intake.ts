import type { AgentChatChoice, CampaignArtifact } from "@/types/agent"

/**
 * Guided campaign intake. After Aeris drafts a campaign, it walks the user
 * through a short sequence of questions to lock down the essentials before the
 * brief opens: goal, run length, frequency, budget, target CPC, target CPS, and
 * the final URL. Choices are seeded from the brand's past data (mocked here) so
 * the user can accept a smart default or override. Dates are derived from run
 * length rather than asked for explicitly.
 */

export interface IntakeQuestion {
  content: string
  tag: string
  context: string
  choices: AgentChatChoice[]
}

export const CAMPAIGN_INTAKE_TAGS = [
  "goal",
  "duration",
  "frequency",
  "budget",
  "cpc",
  "cps",
  "url",
] as const

export type IntakeTag = (typeof CAMPAIGN_INTAKE_TAGS)[number]

// --- Product / URL guessing -------------------------------------------------

interface ProductGuess {
  productName: string
  url: string
}

const STORE = "https://yourbrand.com"

/**
 * Best-effort match from the user's prompt to a product or collection page.
 * Mock catalog — in production this would query the connected product feed.
 */
export function guessProductUrl(prompt: string): ProductGuess {
  const p = prompt.toLowerCase()
  const rules: Array<{ test: RegExp; guess: ProductGuess }> = [
    { test: /\b(sneaker|shoe|runner|trainer)/, guess: { productName: "Aero Knit Runner", url: `${STORE}/products/aero-knit-runner` } },
    { test: /\b(jacket|coat|outerwear|shell)/, guess: { productName: "All-Weather Shell Jacket", url: `${STORE}/products/all-weather-shell` } },
    { test: /\b(bag|tote|backpack|purse)/, guess: { productName: "Everyday Leather Tote", url: `${STORE}/products/everyday-leather-tote` } },
    { test: /\b(dress|gown)/, guess: { productName: "Midi Wrap Dress", url: `${STORE}/products/midi-wrap-dress` } },
    { test: /\b(sale|clearance|discount|markdown)/, guess: { productName: "Sale collection", url: `${STORE}/collections/sale` } },
    { test: /\b(new arrival|new-arrival|launch|drop|just landed)/, guess: { productName: "New Arrivals collection", url: `${STORE}/collections/new-arrivals` } },
    { test: /\b(holiday|gift|christmas|black friday|bfcm)/, guess: { productName: "Gift Guide collection", url: `${STORE}/collections/gift-guide` } },
  ]
  for (const r of rules) {
    if (r.test.test(p)) return r.guess
  }
  return { productName: "Store homepage", url: `${STORE}/` }
}

// --- Question builders ------------------------------------------------------

function inferGoalRecommendation(prompt: string): string {
  const p = prompt.toLowerCase()
  if (/(sales|revenue|orders?|purchase|buy|roas)/.test(p)) return "sales"
  if (/(leads?|signups?|registration|subscribe)/.test(p)) return "leads"
  if (/(awareness|thought leadership|brand)/.test(p)) return "awareness"
  if (/(traffic|visit|clicks?)/.test(p)) return "traffic"
  return "sales"
}

/** Build the question for a given step, given the prompt and current artifact. */
export function buildIntakeQuestion(
  tag: IntakeTag,
  prompt: string,
): IntakeQuestion {
  switch (tag) {
    case "goal": {
      const rec = inferGoalRecommendation(prompt)
      return {
        content: "What's the primary goal for this campaign?",
        tag: "goal",
        context:
          "Your last 5 campaigns optimized for sales. I inferred a goal from your prompt — confirm or change it.",
        choices: [
          { label: "Drive sales / revenue", value: "sales", recommended: rec === "sales", hint: "Optimize for purchases" },
          { label: "Generate leads", value: "leads", recommended: rec === "leads", hint: "Capture signups" },
          { label: "Build awareness", value: "awareness_consideration", recommended: rec === "awareness", hint: "Reach + consideration" },
          { label: "Drive website traffic", value: "website_traffic", recommended: rec === "traffic", hint: "Maximize clicks" },
        ],
      }
    }
    case "duration":
      return {
        content: "How long should this run? I'll set the dates for you.",
        tag: "duration",
        context:
          "Your last 4 campaigns averaged ~38 days. No need to pick exact dates — I'll schedule from your launch patterns.",
        choices: [
          { label: "Match my usual ~6-week run", value: "42", recommended: true, hint: "42 days" },
          { label: "Short 2-week sprint", value: "14", hint: "14 days" },
          { label: "Always-on (no end date)", value: "ongoing", hint: "Runs until paused" },
        ],
      }
    case "frequency":
      return {
        content: "How often should the campaign run?",
        tag: "frequency",
        context: "Your best-performing campaigns ran a weekly cadence.",
        choices: [
          { label: "Weekly", value: "Weekly", recommended: true },
          { label: "Daily", value: "Daily" },
          { label: "Monthly", value: "Monthly" },
        ],
      }
    case "budget":
      return {
        content: "What budget should I plan against?",
        tag: "budget",
        context: "Your last launch ran $5,000 total over 6 weeks.",
        choices: [
          { label: "$5,000 total — match last launch", value: "5000", recommended: true },
          { label: "$3,000 total", value: "3000" },
          { label: "$10,000 total", value: "10000" },
        ],
      }
    case "cpc":
      return {
        content: "What's your target cost per click (CPC)?",
        tag: "cpc",
        context: "Trailing 90-day avg CPC: $1.20. Efficient floor seen around $0.90.",
        choices: [
          { label: "$1.20 — match trailing average", value: "1.20", recommended: true },
          { label: "$0.90 — more efficient", value: "0.90" },
          { label: "$1.60 — maximize reach", value: "1.60" },
        ],
      }
    case "cps":
      return {
        content: "And your target cost per sale (CPS)?",
        tag: "cps",
        context: "Your blended CPS last quarter was $18.",
        choices: [
          { label: "$18 — match last quarter", value: "18", recommended: true },
          { label: "$14 — more aggressive", value: "14" },
          { label: "$24 — prioritize volume", value: "24" },
        ],
      }
    case "url": {
      const g = guessProductUrl(prompt)
      return {
        content: "Where should the ads point? I matched your prompt to a page.",
        tag: "url",
        context: `Best match for your prompt: ${g.productName}\n${g.url}`,
        choices: [
          { label: `Use ${g.productName}`, value: g.url, recommended: true, hint: g.url },
          { label: "Send to store homepage", value: `${STORE}/` },
          { label: "Send to New Arrivals", value: `${STORE}/collections/new-arrivals` },
        ],
      }
    }
  }
}

/** The first question in the intake sequence. */
export function firstIntakeQuestion(prompt: string): IntakeQuestion {
  return buildIntakeQuestion(CAMPAIGN_INTAKE_TAGS[0], prompt)
}

/** Next question after `tag`, or null if the intake is complete. */
export function nextIntakeQuestion(
  tag: string,
  prompt: string,
): IntakeQuestion | null {
  const idx = CAMPAIGN_INTAKE_TAGS.indexOf(tag as IntakeTag)
  if (idx === -1 || idx >= CAMPAIGN_INTAKE_TAGS.length - 1) return null
  return buildIntakeQuestion(CAMPAIGN_INTAKE_TAGS[idx + 1], prompt)
}

// --- Applying an answer to the artifact -------------------------------------

function parseMoney(s: string): number | null {
  const m = s.match(/([\d,]+(?:\.\d+)?)/)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

/**
 * Apply a single intake answer to a campaign artifact, returning a new artifact.
 * `answer.value` is preferred; otherwise we parse from the label (covers the
 * free-text "Other" path).
 */
export function applyIntakeAnswer(
  artifact: CampaignArtifact,
  tag: string,
  answer: { label: string; value?: string },
): CampaignArtifact {
  const raw = (answer.value ?? answer.label).trim()
  const next = { ...artifact }

  switch (tag as IntakeTag) {
    case "goal": {
      const map: Record<string, string> = {
        sales: "sales",
        leads: "leads",
        awareness_consideration: "awareness_consideration",
        website_traffic: "website_traffic",
      }
      let objective = map[raw]
      if (!objective) {
        const l = raw.toLowerCase()
        objective = /lead/.test(l)
          ? "leads"
          : /aware|brand/.test(l)
            ? "awareness_consideration"
            : /traffic|click|visit/.test(l)
              ? "website_traffic"
              : "sales"
      }
      next.objective = objective
      break
    }
    case "duration": {
      const start = new Date()
      if (raw === "ongoing") {
        const end = new Date(start.getTime() + 365 * 86400000)
        next.dateRange = { start: start.toISOString(), end: end.toISOString() }
      } else {
        const days = parseMoney(raw) ?? 42
        const end = new Date(start.getTime() + days * 86400000)
        next.dateRange = { start: start.toISOString(), end: end.toISOString() }
      }
      break
    }
    case "frequency": {
      const l = raw.toLowerCase()
      next.cadence = /daily/.test(l)
        ? "Daily"
        : /monthly/.test(l)
          ? "Monthly"
          : "Weekly"
      break
    }
    case "budget": {
      const amount = parseMoney(raw)
      if (amount != null) {
        next.budget = { amount, currency: "USD", type: "total" }
      }
      break
    }
    case "cpc": {
      const v = parseMoney(raw)
      if (v != null) next.maxCpc = v.toFixed(2)
      break
    }
    case "cps": {
      const v = parseMoney(raw)
      if (v != null) next.targetCps = String(v)
      break
    }
    case "url": {
      next.finalUrl = /^https?:\/\//i.test(raw) ? raw : guessProductUrl(raw).url
      break
    }
  }
  return next
}

/** Short confirmation Aeris replies with after an answer is applied. */
export function intakeAck(tag: string, artifact: CampaignArtifact): string {
  switch (tag as IntakeTag) {
    case "goal":
      return `Goal set to **${artifact.objective?.replace(/_/g, " ")}**.`
    case "duration": {
      const start = new Date(artifact.dateRange.start)
      const end = new Date(artifact.dateRange.end)
      const days = Math.round((end.getTime() - start.getTime()) / 86400000)
      return `Scheduled a **${days}-day** run starting ${start.toLocaleDateString()}.`
    }
    case "frequency":
      return `Cadence set to **${artifact.cadence}**.`
    case "budget":
      return artifact.budget
        ? `Budget locked at **$${artifact.budget.amount.toLocaleString()} ${artifact.budget.type}**.`
        : "Budget noted."
    case "cpc":
      return `Target CPC set to **$${artifact.maxCpc}**.`
    case "cps":
      return `Target CPS set to **$${artifact.targetCps}**.`
    case "url":
      return `Ads will point to **${artifact.finalUrl}**.`
    default:
      return "Noted."
  }
}
