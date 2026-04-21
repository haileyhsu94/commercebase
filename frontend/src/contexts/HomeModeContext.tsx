import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type HomeMode = "dashboard" | "ai"

interface HomeModeContextType {
  mode: HomeMode
  setMode: (mode: HomeMode) => void
  toggleMode: () => void
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
  const [mode, setMode] = useState<HomeMode>("dashboard")

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "dashboard" ? "ai" : "dashboard"))
  }, [])

  return (
    <HomeModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </HomeModeContext.Provider>
  )
}
