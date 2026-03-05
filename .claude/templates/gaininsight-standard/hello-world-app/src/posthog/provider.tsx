import { useEffect, useRef } from "react"
import { initPostHog, identifyUser, resetUser } from "./client"

// Init at module level — flags start loading before auth
initPostHog()

interface PostHogProviderProps {
  children: React.ReactNode
}

/**
 * Wrap your app with PostHogProvider inside your auth provider.
 * Handles user identification on auth state changes.
 *
 * Replace the auth hook below with your project's auth provider.
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  // TODO: Replace with your auth hook, e.g.:
  // const { user, status } = useAuth()
  const user = null as { id: string; name?: string } | null
  const status = "unauthenticated" as "authenticated" | "unauthenticated"

  const prevStatusRef = useRef(status)

  useEffect(() => {
    if (status === "authenticated" && user) {
      identifyUser(String(user.id), {
        name: user.name,
      })
    }
    if (
      prevStatusRef.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      resetUser()
    }
    prevStatusRef.current = status
  }, [status, user])

  return <>{children}</>
}
