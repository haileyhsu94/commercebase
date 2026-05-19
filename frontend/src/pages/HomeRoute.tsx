import { Home } from "@/pages/Home"
import { AgentHome } from "@/pages/agent/AgentHome"
import { useHomeMode } from "@/contexts/HomeModeContext"

export function HomeRoute() {
  const { mode } = useHomeMode()
  return mode === "ai" ? <AgentHome /> : <Home />
}
