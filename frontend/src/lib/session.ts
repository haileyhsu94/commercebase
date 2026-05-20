import { useEffect, useState } from "react"

const KEY = "commercebase_session_v1"
export const SESSION_UPDATED_EVENT = "commercebase-session-updated"

export interface Session {
  email: string
  name?: string
  /** ISO timestamp when the user completed signup. */
  signedUpAt: string
}

function notify() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT))
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(KEY, JSON.stringify(session))
  notify()
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
  notify()
}

/** React hook subscribing to session changes (cross-tab + in-tab). */
export function useSession() {
  const [session, setSessionState] = useState<Session | null>(() => getSession())

  useEffect(() => {
    const refresh = () => setSessionState(getSession())
    window.addEventListener(SESSION_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(SESSION_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  return {
    session,
    signOut: () => {
      clearSession()
    },
  }
}
