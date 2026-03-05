---
title: Brand Guidelines
created: {{DATE}}
updated: {{DATE}}
last_checked: {{DATE}}
tags: [design, brand, ux, guidelines, template]
---

# Brand Guidelines

> **Purpose:** Enable engineers and AI to make correct UI decisions without designer intervention.
> **Audience:** Engineers, AI agents, designers
> **Phase:** Created during Setup/Discovery, referenced throughout

## 1. Reference Class Declaration

**Primary reference class:** [Choose one]

| Reference Class | Leaders | Key Principles |
|-----------------|---------|----------------|
| Data-Dense Internal Tools | Stripe, Snowflake, AWS Console | Tables first, predictable navigation, boring is good |
| Workflow / Inbox-Driven Apps | Linear, Superhuman, Zendesk | Focus discipline, keyboard-first, one dominant next action |
| Decision / Modelling Surfaces | Causal, Figma, Notion | Spatial reasoning, few modals, visible state |
| Desktop Productivity Clients | Slack (desktop), VS Code, Things | Zero latency tolerance, non-modal flows, keyboard + mouse parity |
| ShadCN-Native SaaS Baseline | Vercel, Cal.com, Dub.co | Correct primitive composition, token discipline, visual restraint |

**Selected:** `[reference-class-name]`

**Why this reference class:**
> [1-2 sentences explaining why this reference class fits the product]

**What we're borrowing:**
- [ ] [Specific principle 1]
- [ ] [Specific principle 2]
- [ ] [Specific principle 3]

**What we're NOT borrowing:**
- [ ] [Aspect we're intentionally diverging from]

---

## 2. Visual Identity

### Brand Personality

| Attribute | Our Position | Anti-Pattern |
|-----------|--------------|--------------|
| Tone | [e.g., Professional but approachable] | [e.g., Not corporate-stuffy, not startup-casual] |
| Density | [e.g., Information-rich, power-user focused] | [e.g., Not marketing-sparse, not overwhelming] |
| Motion | [e.g., Subtle, functional transitions] | [e.g., No decorative animations, no jarring state changes] |

### Color Strategy

| Purpose | Token | Value | Usage |
|---------|-------|-------|-------|
| Primary action | `--primary` | [HSL value] | Main CTAs, key interactive elements |
| Secondary action | `--secondary` | [HSL value] | Alternative actions, less emphasis |
| Destructive | `--destructive` | [HSL value] | Delete, remove, dangerous actions |
| Success | `--success` | [HSL value] | Confirmation, completion states |
| Warning | `--warning` | [HSL value] | Caution states, pending actions |
| Muted | `--muted` | [HSL value] | Disabled states, secondary text |

**Color rules:**
1. Color is semantic (status, intent), not decorative
2. Maximum [N] colors visible in any single view
3. [Specific constraint, e.g., "Accent color reserved for primary actions only"]

### Typography

| Level | Token | Font / Size | Usage |
|-------|-------|-------------|-------|
| Display | `--font-display` | [Font, size] | Hero sections only |
| Heading 1 | `--font-h1` | [Font, size] | Page titles |
| Heading 2 | `--font-h2` | [Font, size] | Section titles |
| Body | `--font-body` | [Font, size] | Default text |
| Small | `--font-small` | [Font, size] | Captions, labels |
| Mono | `--font-mono` | [Font, size] | Code, technical values |

**Typography rules:**
1. [e.g., "Maximum 2 heading levels per view"]
2. [e.g., "Body text minimum 14px for readability"]
3. [e.g., "Monospace for all numeric data"]

### Spacing

| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| xs | `--space-xs` | [value] | Tight grouping |
| sm | `--space-sm` | [value] | Related elements |
| md | `--space-md` | [value] | Default spacing |
| lg | `--space-lg` | [value] | Section separation |
| xl | `--space-xl` | [value] | Major divisions |

---

## 3. Component Preferences

### Preferred Components (ShadCN/UI)

| Use Case | Component | Notes |
|----------|-----------|-------|
| Modal content | `Dialog` | For focused tasks requiring completion |
| Side panels | `Sheet` | For contextual information, non-blocking |
| Quick actions | `Popover` | For menus, tooltips with actions |
| Confirmations | `AlertDialog` | For destructive/irreversible actions |
| Forms | `Form` + `FormField` | Always use with validation |
| Data display | `Table` | For structured data |
| Lists | `Card` in list | For unstructured/varied content |

### Anti-Patterns (Avoid)

| Anti-Pattern | Why | Instead |
|--------------|-----|---------|
| [e.g., "Nested modals"] | [e.g., "Confusing context"] | [e.g., "Use Sheet or navigate"] |
| [e.g., "Toast for errors"] | [e.g., "Too dismissable for important info"] | [e.g., "Inline error messages"] |
| [e.g., "Custom icons"] | [e.g., "Inconsistency"] | [e.g., "Use Lucide icon set"] |

---

## 4. Interaction Patterns

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move forward through interactive elements |
| `Shift+Tab` | Move backward |
| `Enter` / `Space` | Activate focused element |
| `Escape` | Close modal/popover, cancel action |
| `Arrow keys` | Navigate within lists, menus |
| [Custom shortcut] | [Custom action] |

### State Communication

| State | Visual Treatment | Feedback |
|-------|-----------------|----------|
| Loading | [e.g., "Skeleton, spinner on action"] | [e.g., "Show within 100ms"] |
| Empty | [e.g., "Illustration + CTA"] | [e.g., "Guide to first action"] |
| Error | [e.g., "Inline red message"] | [e.g., "Explain why, suggest fix"] |
| Success | [e.g., "Green check, brief toast"] | [e.g., "Confirm action completed"] |
| Disabled | [e.g., "Reduced opacity + tooltip"] | [e.g., "Explain why disabled"] |

---

## 5. Accessibility Requirements (WCAG 2.1 AA)

### Mandatory Compliance

- [ ] Color contrast minimum 4.5:1 for normal text
- [ ] Color contrast minimum 3:1 for large text and UI components
- [ ] Touch targets minimum 44x44px
- [ ] Focus indicators visible on all interactive elements
- [ ] All images have alt text (or aria-hidden if decorative)
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers

### Testing Checklist

- [ ] Keyboard-only navigation works for all flows
- [ ] Screen reader announces all important state changes
- [ ] No content is conveyed by color alone
- [ ] Animations can be disabled (prefers-reduced-motion)

---

## 6. Platform-Specific Notes

### Web (React + ShadCN/UI)

- Design system: ShadCN/UI with Radix primitives
- Styling: Tailwind CSS with CSS variable tokens
- Documentation: Storybook for component catalog

### Mobile (Flutter) - If Applicable

- Design system: Material 3 or custom widget library
- Documentation: Widgetbook for component catalog
- Token bridge: Style Dictionary generates both CSS and Dart

---

## 7. Anti-Guidelines (Phrases to Avoid)

These phrases indicate guidelines that cannot be enforced:

| Anti-Guideline | Problem | Rewrite As |
|----------------|---------|------------|
| "Use sparingly" | No clear threshold | "Maximum N per view" |
| "When appropriate" | No decision criteria | "Use when [specific condition]" |
| "Clean and modern" | Subjective | "Maximum N colors, M font sizes" |
| "Feel premium" | Unmeasurable | "[Specific spacing, type, color rules]" |
| "As needed" | No guidance | "Always/never in [context]" |

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| {{DATE}} | [Name] | Initial creation |

---

*This document is the source of truth for visual decisions. If in doubt, reference this before making UI choices.*
