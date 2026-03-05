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
