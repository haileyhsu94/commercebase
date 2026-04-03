import { Navigate } from "react-router-dom"

/** Deep links land on the Integrations tab in Settings (single hub, no extra step). */
export function Integrations() {
  return <Navigate to="/settings?tab=integrations" replace />
}
