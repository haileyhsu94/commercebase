import type {
  AgentChat,
  AgentChatMessage,
  SkillType,
} from "@/types/agent"
import type { AssistantCard } from "@/lib/assistant-cards"
import {
  upsertAgentChat,
  upsertCampaignArtifact,
  upsertFlowArtifact,
} from "./storage"
import {
  buildCommerceFlow,
  buildSampleCampaign,
  buildSampleFlow,
  newId,
} from "./skill-mocks"
import { defaultMemoryItems, describeSkill, detectSkill } from "./skill-detect"
import { firstIntakeQuestion, guessProductUrl } from "./campaign-intake"

export interface ActivationResult {
  chatId: string
  skill: SkillType
  artifactRef?: { type: SkillType; id: string }
  route: string
}

function nowIso() {
  return new Date().toISOString()
}

function msg(
  role: AgentChatMessage["role"],
  content: string,
  kind: AgentChatMessage["kind"] = "text",
  meta?: AgentChatMessage["meta"],
): AgentChatMessage {
  return { id: newId("msg"), role, content, kind, timestamp: nowIso(), meta }
}

function titleFromPrompt(prompt: string): string {
  const clean = prompt.replace(/\s+/g, " ").trim()
  if (clean.length <= 56) return clean
  return clean.slice(0, 56).replace(/[,.;:!\-\s]+$/, "") + "…"
}

/** Inline chart card for data-viz requests (rendered in-chat via the generated-UI template). */
function buildChartCard(prompt: string): AssistantCard {
  const series = Array.from({ length: 12 }, (_, i) => ({
    label: `W${i + 1}`,
    value: 14000 + i * 1050 + (i % 3) * 350,
  }))
  return {
    kind: "chart",
    title: titleFromPrompt(prompt),
    subtitle: "Weekly attributed revenue, trailing 12 weeks",
    chartType: "line",
    series,
    unitPrefix: "$",
  }
}

export function activateSkillFromPrompt(
  prompt: string,
  options: { templateId?: string } = {},
): ActivationResult {
  const skill = options.templateId ? "autopilot" : detectSkill(prompt)
  const chatId = newId("chat")

  // Chart / data-viz requests render the chart inline in the chat using the
  // generated-UI template. Dashboard widgets (pin to dashboard / export) ship
  // in a later iteration, so we don't activate a Widget Skill or build a widget
  // artifact here.
  if (skill === "widget") {
    const widgetMemory = defaultMemoryItems("widget")
    const chartMessages: AgentChatMessage[] = [
      msg("user", prompt),
      msg(
        "assistant",
        `Listed memory contents.\nRead ${widgetMemory.map((m) => `**${m}**`).join(", ")}`,
        "memory",
        { memoryItems: widgetMemory },
      ),
      msg("assistant", "Here's what your data shows:", "text", {
        card: buildChartCard(prompt),
      }),
    ]
    const chartChat: AgentChat = {
      id: chatId,
      title: titleFromPrompt(prompt),
      preview: prompt,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      pinned: false,
      messages: chartMessages,
    }
    upsertAgentChat(chartChat)
    return { chatId, skill, route: `/agent/chats/${chatId}` }
  }

  const memory = defaultMemoryItems(skill)
  const skillLabel = describeSkill(skill)

  const messages: AgentChatMessage[] = [
    msg("user", prompt),
    msg(
      "assistant",
      `Listed memory contents.\nRead ${memory.map((m) => `**${m}**`).join(", ")}`,
      "memory",
      { memoryItems: memory },
    ),
    msg(
      "assistant",
      "Great context — I have everything I need from memory. Let me activate the right skill and build this out.",
    ),
    msg("assistant", `Activated **${skillLabel}**`, "skill-activated", {
      skillName: skillLabel,
    }),
  ]

  let result: ActivationResult

  if (skill === "campaign") {
    const artifact = buildSampleCampaign(prompt, chatId, {
      name: titleFromPrompt(prompt).replace(/^create (a|an)? ?/i, ""),
      // Seed a best-effort destination from the prompt; the intake URL question
      // lets the user confirm or change it.
      finalUrl: guessProductUrl(prompt).url,
    })
    upsertCampaignArtifact(artifact)
    const intro = firstIntakeQuestion(prompt)
    messages.push(
      msg("assistant", "Drafted a starting brief. Let me lock down a few essentials so it's ready to launch.", "result", {
        artifactRef: { type: "campaign", id: artifact.id },
      }),
      msg("assistant", intro.content, "question", {
        questionTag: intro.tag,
        questionContext: intro.context,
        questionChoices: intro.choices,
      }),
    )
    result = {
      chatId,
      skill,
      artifactRef: { type: "campaign", id: artifact.id },
      // Land in the chat so the user can answer Aeris's follow-up questions before
      // the brief opens. The brief is reachable via the "Open brief" CTA that appears
      // once the questions are answered (see ChatView).
      route: `/agent/chats/${chatId}`,
    }
  } else if (skill === "autopilot") {
    const artifact =
      (options.templateId && buildCommerceFlow(options.templateId, prompt, chatId)) ||
      buildSampleFlow(prompt, chatId)
    upsertFlowArtifact(artifact)
    messages.push(
      msg(
        "assistant",
        "Built the flow with trigger, audience filter, and a conditional engagement branch. Opening the editor.",
        "result",
        { artifactRef: { type: "autopilot", id: artifact.id } },
      ),
    )
    result = {
      chatId,
      skill,
      artifactRef: { type: "autopilot", id: artifact.id },
      route: `/agent/flow/${artifact.id}`,
    }
  } else {
    messages.push(
      msg(
        "assistant",
        "Got it — happy to chat through this. Let me know if you'd like me to turn it into a campaign, flow, or widget.",
      ),
    )
    result = { chatId, skill, route: `/agent/chats/${chatId}` }
  }

  const chat: AgentChat = {
    id: chatId,
    title: titleFromPrompt(prompt),
    preview: prompt,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    pinned: false,
    artifactRef: result.artifactRef,
    messages,
  }
  upsertAgentChat(chat)

  return result
}
