import { useEffect, useState } from "react"
import { getUnreadInboxCount, subscribeInboxChanged } from "@/lib/inbox-mock"

export function useUnreadInboxCount(): number {
  const [count, setCount] = useState(() => getUnreadInboxCount())
  useEffect(() => {
    const sync = () => setCount(getUnreadInboxCount())
    sync()
    return subscribeInboxChanged(sync)
  }, [])
  return count
}
