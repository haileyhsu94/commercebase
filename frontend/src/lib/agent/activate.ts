import type {
  AgentChat,
  AgentChatMessage,
  SkillType,
} from "@/types/agent"
import {
  upsertAgentChat,
  upsertCampaignArtifact,
  upsertFlowArtifact,
  upsertWidgetArtifact,
} from "./storage"
import {
  buildSampleCampaign,
  buildSampleFlow,
  buildSampleWidget,
  newId,
} from "./skill-mocks"
import { defaultMemoryItems, describeSkill, detectSkill } from "./skill-detect"

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

export function activateSkillFromPrompt(prompt: string): ActivationResult {
  const skill = detectSkill(prompt)
  const chatId = newId("chat")
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
    })
    upsertCampaignArtifact(artifact)
    messages.push(
      msg("assistant", "Drafted the campaign brief, 24 tasks, and 6 deliverables. Opening it now.", "result", {
        artifactRef: { type: "campaign", id: artifact.id },
      }),
    )
    result = {
      chatId,
      skill,
      artifactRef: { type: "campaign", id: artifact.id },
      route: `/agent/campaign/${artifact.id}`,
    }
  } else if (skill === "autopilot") {
    const artifact = buildSampleFlow(prompt, chatId)
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
  } else if (skill === "widget") {
    const artifact = buildSampleWidget(prompt, chatId)
    upsertWidgetArtifact(artifact)
    messages.push(
      msg(
        "assistant",
        `Built a ${artifact.type} widget you can drop on the home dashboard. Opening it now.`,
        "result",
        { artifactRef: { type: "widget", id: artifact.id } },
      ),
    )
    result = {
      chatId,
      skill,
      artifactRef: { type: "widget", id: artifact.id },
      route: `/agent/widget/${artifact.id}`,
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
