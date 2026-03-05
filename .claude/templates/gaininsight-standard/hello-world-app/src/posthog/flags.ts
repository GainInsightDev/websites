import { useState, useEffect, useCallback } from "react"
import { isFeatureEnabled, onFeatureFlags, areFlagsLoaded } from "./client"

export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState(() => isFeatureEnabled(flag))

  useEffect(() => {
    const unsubscribe = onFeatureFlags(() => setEnabled(isFeatureEnabled(flag)))
    return unsubscribe
  }, [flag])

  return enabled
}

/**
 * For view-level flag gating — returns { flags, ready }.
 * Pass a map of view IDs to flag names.
 */
export function useViewFlags(
  viewFlags: Record<string, string>,
): { flags: Record<string, boolean>; ready: boolean } {
  const [ready, setReady] = useState(() => areFlagsLoaded())
  const [flags, setFlags] = useState(() =>
    Object.fromEntries(
      Object.entries(viewFlags).map(([view, flag]) => [
        view,
        isFeatureEnabled(flag),
      ]),
    ),
  )

  const updateFlags = useCallback(() => {
    setReady(areFlagsLoaded())
    setFlags(
      Object.fromEntries(
        Object.entries(viewFlags).map(([view, flag]) => [
          view,
          isFeatureEnabled(flag),
        ]),
      ),
    )
  }, [viewFlags])

  useEffect(() => {
    const unsubscribe = onFeatureFlags(updateFlags)
    return unsubscribe
  }, [updateFlags])

  return { flags, ready }
}
