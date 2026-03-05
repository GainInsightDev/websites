---
title: PostHog Integration Guide
sidebar_label: PostHog
sidebar_position: 12
created: 2026-02-08
updated: 2026-02-11
last_checked: 2026-02-11
tags: [guide, posthog, analytics, feature-flags, integration]
parent: ./README.md
related:
  - ../../skills/af-posthog-expertise/SKILL.md
  - ./gaininsight-standard/README.md
  - ./gaininsight-standard/layer-3-ui-styling.md
  - ../../../.agentflow/adr/adr-010-posthog-analytics-feature-flags.md
---

# PostHog Integration Guide

Step-by-step guide for adding PostHog product analytics and feature flags to an AgentFlow project.

## Prerequisites

- Project with a React frontend (Next.js)
- Doppler configured for the project
- Access to Bitwarden vault

## Step 1: Register PostHog Account

1. **Choose email**: Use `admins+{project}-posthog@gaininsight.global`
2. **Register at** [eu.posthog.com](https://eu.posthog.com) (EU region for GDPR)
3. **Verify email**: Check the admins@ inbox for the verification link
4. **Store credentials in Bitwarden**:
   - Name: `PostHog - {ProjectName}`
   - Username: `admins+{project}-posthog@gaininsight.global`
   - URI: `https://eu.posthog.com`
5. **Get API keys** from PostHog Settings:
   - Project API Key (`phc_*`) — for client-side SDK
   - Personal API Key (`phx_*`) — for management API (Settings → Personal API Keys)
6. **Note the Project ID** from Settings → Project Details

## Step 2: Configure Doppler

Add these secrets to your project's Doppler config:

```bash
doppler secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PROJECT_KEY --project {project} --config prd
doppler secrets set NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com --project {project} --config prd
doppler secrets set POSTHOG_PERSONAL_API_KEY=phx_YOUR_PERSONAL_KEY --project {project} --config prd
```

Update Bitwarden custom fields with the Project API Key, Personal API Key, and Project ID.

## Step 3: Install SDK

```bash
pnpm add posthog-js
```

## Step 4: Create PostHog Module

Create `src/posthog/` with five files:

### `client.ts` — Core SDK wrapper

```typescript
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

  posthog.onFeatureFlags(() => { flagsLoaded = true })
  initialized = true
}

export function areFlagsLoaded(): boolean {
  return !POSTHOG_KEY || flagsLoaded
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return
  posthog.identify(userId, properties)
}

export function resetUser() {
  if (!POSTHOG_KEY) return
  posthog.reset()
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return
  posthog.capture(event, properties)
}

export function isFeatureEnabled(flag: string): boolean {
  if (!POSTHOG_KEY) return true
  if (!flagsLoaded) return false
  return posthog.isFeatureEnabled(flag) ?? false
}

export function onFeatureFlags(callback: () => void): () => void {
  if (!POSTHOG_KEY) { callback(); return () => {} }
  posthog.onFeatureFlags(callback)
  return () => {}
}

export { posthog }
```

### `provider.tsx` — React provider

```typescript
import { useEffect, useRef } from "react"
import { useAuth } from "@/auth"
import { initPostHog, identifyUser, resetUser } from "./client"

// Init at module level — flags start loading before auth
initPostHog()

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth()
  const prevStatusRef = useRef(status)

  useEffect(() => {
    if (status === "authenticated" && user) {
      identifyUser(String(user.id), {
        login: user.login,
        name: user.name,
      })
    }
    if (prevStatusRef.current === "authenticated" && status === "unauthenticated") {
      resetUser()
    }
    prevStatusRef.current = status
  }, [status, user])

  return <>{children}</>
}
```

### `events.ts` — Typed event tracking

```typescript
import { trackEvent } from "./client"

export function trackViewChanged(view: string, previousView?: string) {
  trackEvent("view_changed", { view, previous_view: previousView })
}

export function trackLoginCompleted(userId: string, login: string) {
  trackEvent("login_completed", { user_id: userId, login })
}

export function trackLoginFailed(error: string) {
  trackEvent("login_failed", { error })
}

export function trackLogout() {
  trackEvent("logout")
}
```

### `flags.ts` — Feature flag hooks

```typescript
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

// For view-level flag gating — returns { flags, ready }
export function useViewFlags(
  viewFlags: Record<string, string>
): { flags: Record<string, boolean>; ready: boolean } {
  const [ready, setReady] = useState(() => areFlagsLoaded())
  const [flags, setFlags] = useState(() =>
    Object.fromEntries(
      Object.entries(viewFlags).map(([view, flag]) => [view, isFeatureEnabled(flag)])
    )
  )

  const updateFlags = useCallback(() => {
    setReady(areFlagsLoaded())
    setFlags(
      Object.fromEntries(
        Object.entries(viewFlags).map(([view, flag]) => [view, isFeatureEnabled(flag)])
      )
    )
  }, [viewFlags])

  useEffect(() => {
    const unsubscribe = onFeatureFlags(updateFlags)
    return unsubscribe
  }, [updateFlags])

  return { flags, ready }
}
```

### `index.ts` — Barrel exports

```typescript
export { PostHogProvider } from "./provider"
export { initPostHog, identifyUser, resetUser, trackEvent, isFeatureEnabled, onFeatureFlags, areFlagsLoaded } from "./client"
export { trackViewChanged, trackLoginCompleted, trackLoginFailed, trackLogout } from "./events"
export { useFeatureFlag, useViewFlags } from "./flags"
```

## Step 5: Integrate into App

Wrap your app with `PostHogProvider`:

```typescript
function App() {
  return (
    <AuthProvider>
      <PostHogProvider>
        <AppContent />
      </PostHogProvider>
    </AuthProvider>
  )
}
```

Add view tracking and flag filtering to your sidebar/navigation.

## Step 6: Create Feature Flags

### Via PostHog Dashboard

1. Go to Feature Flags → New Flag
2. Key: use plain name (e.g., `health`, `sessions`)
3. Release condition: 100% of users (enabled by default)
4. Toggle off to hide features

### Via API (Bulk Creation)

```bash
PROJECT_ID=YOUR_PROJECT_ID
API_KEY=YOUR_PERSONAL_API_KEY
FLAGS=("health" "sessions" "docs" "settings")

for flag in "${FLAGS[@]}"; do
  curl -s -X POST \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    "https://eu.posthog.com/api/projects/$PROJECT_ID/feature_flags/" \
    -d "{\"key\":\"$flag\",\"name\":\"$flag view\",\"active\":true,\"filters\":{\"groups\":[{\"properties\":[],\"rollout_percentage\":100}]}}"
done
```

## Step 7: Update Project Documentation

Add to your project's `CLAUDE.md`:

```markdown
## Environment & Secrets

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host (EU) |

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/posthog/` | PostHog analytics & feature flags |
```

## Verification Checklist

- [ ] PostHog account registered (EU region)
- [ ] Credentials in Doppler and Bitwarden
- [ ] `posthog-js` installed
- [ ] `src/posthog/` module created (5 files)
- [ ] `PostHogProvider` wrapping app
- [ ] `initPostHog()` called at module level (not in component)
- [ ] Feature flags created in PostHog dashboard
- [ ] Flags default to hidden when loading, visible in local dev
- [ ] Events tracking verified in PostHog dashboard
- [ ] User identification working after auth
- [ ] `CLAUDE.md` updated with PostHog env vars

## Architecture Decision

PostHog was chosen as the standard platform for product analytics, feature flags, and session replay across all AgentFlow projects. See [ADR-010: PostHog as Standard Analytics & Feature Flags Platform](../../../.agentflow/adr/adr-010-posthog-analytics-feature-flags.md) for the full rationale and alternatives considered.

## Reference Implementation

**Agentview** (`/data/worktrees/agentview/develop/client/src/posthog/`) is the reference implementation for PostHog integration. It includes:
- Full SDK setup with Tauri/browser detection
- View-level and component-level feature flag hooks
- Auth event tracking (GitHub OAuth)
- Health check event tracking
- Graceful degradation without API key
