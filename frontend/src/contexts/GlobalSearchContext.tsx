import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type GlobalSearchContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openSearch: () => void
  closeSearch: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

export function useGlobalSearch() {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider")
  }
  return ctx
}

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K without Shift — search only (⌘/ is Ask Aeris in AIAssistantProvider).
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const value: GlobalSearchContextValue = {
    open,
    setOpen,
    openSearch,
    closeSearch,
  }

  return (
    <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>
  )
}
