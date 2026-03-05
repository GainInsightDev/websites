import posthog from "posthog-js"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
const isDev = process.env.NODE_ENV === "development"

let initialized = false
let flagsLoaded = false

export function initPostHog() {
  if (initialized || !POSTHOG_KEY) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: !isDev,
    capture_pageview: false,
    capture_pageleave: false,
    persistence: "localStorage",
  })

  posthog.register({
    environment: isDev ? "development" : "production",
  })

  posthog.onFeatureFlags(() => {
    flagsLoaded = true
  })
  initialized = true
}

export function areFlagsLoaded(): boolean {
  return !POSTHOG_KEY || flagsLoaded
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  if (!POSTHOG_KEY) return
  posthog.identify(userId, properties)
}

export function resetUser() {
  if (!POSTHOG_KEY) return
  posthog.reset()
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!POSTHOG_KEY) return
  posthog.capture(event, properties)
}

export function isFeatureEnabled(flag: string): boolean {
  if (!POSTHOG_KEY) return true
  if (!flagsLoaded) return false
  return posthog.isFeatureEnabled(flag) ?? false
}

export function onFeatureFlags(callback: () => void): () => void {
  if (!POSTHOG_KEY) {
    callback()
    return () => {}
  }
  posthog.onFeatureFlags(callback)
  return () => {}
}

export { posthog }
