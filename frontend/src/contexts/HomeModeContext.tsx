import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export type HomeMode = "dashboard" | "ai"

const STORAGE_KEY = "commercebase_home_mode_v1"

interface HomeModeContextType {
  mode: HomeMode
  setMode: (mode: HomeMode) => void
  toggleMode: () => void
  campaignPanelOpen: boolean
  setCampaignPanelOpen: (open: boolean) => void
}

const HomeModeContext = createContext<HomeModeContextType | null>(null)

export function useHomeMode() {
  const context = useContext(HomeModeContext)
  if (!context) {
    throw new Error("useHomeMode must be used within a HomeModeProvider")
  }
  return context
}

export function HomeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<HomeMode>(() => {
    if (typeof window === "undefined") return "dashboard"
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === "ai" || stored === "dashboard" ? stored : "dashboard"
  })
  const [campaignPanelOpen, setCampaignPanelOpen] = useState(false)

  const setMode = useCallback((next: HomeMode) => {
    setModeState(next)
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: HomeMode = prev === "dashboard" ? "ai" : "dashboard"
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <HomeModeContext.Provider value={{ mode, setMode, toggleMode, campaignPanelOpen, setCampaignPanelOpen }}>
      {children}
    </HomeModeContext.Provider>
  )
}
