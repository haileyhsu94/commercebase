import { Navigate } from "react-router-dom"
import { Home } from "@/pages/Home"
import { AgentHome } from "@/pages/agent/AgentHome"
import { useHomeMode } from "@/contexts/HomeModeContext"
import { useSession } from "@/lib/session"
import { useOnboarding } from "@/lib/onboarding-storage"

export function HomeRoute() {
  const { mode } = useHomeMode()
  const { session } = useSession()
  const { state: onboarding } = useOnboarding()

  if (!session) return <Navigate to="/signup" replace />
  if (!onboarding.completed) return <Navigate to="/onboarding" replace />

  return mode === "ai" ? <AgentHome /> : <Home />
}
