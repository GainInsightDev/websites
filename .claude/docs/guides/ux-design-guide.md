---
title: UX Design Guide
created: 2026-02-07
updated: 2026-02-07
last_checked: 2026-02-07
tags: [guide, ux, design, storybook, atomic-design, accessibility, rtl, review]
parent: ./README.md
related:
  - ../../skills/af-ux-design-expertise/SKILL.md
  - ./testing-guide.md
  - ./requirements-guide.md
  - ../standards/project-structure.md
---

# UX Design Guide

Comprehensive guide to UX design in AgentFlow projects. Covers Atomic Design, the 7-stage design flow, Storybook-first development, component catalog management, and UX review workflows.

**For quick rules and directives, load the `af-ux-design-expertise` skill.**

## Core Principles

1. **Design happens in code** (Storybook), not in Figma
2. **Storybook is the source of truth** for component design
3. **Atomic Design** organizes components by composition level
4. **Behavior is locked with tests** before engineering handoff
5. **Component catalog prevents duplication** across features

---

## Atomic Design

AgentFlow adopts [Brad Frost's Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) methodology as the component classification system. This provides a shared vocabulary and prevents component duplication across iterative feature development.

### Classification Levels

| Level | Definition | Examples | Source |
|-------|-----------|----------|--------|
| **Atoms** | Smallest UI primitives. Cannot be broken down further. | Button, Input, Label, Badge, Icon | Primarily shadcn/ui |
| **Molecules** | Small groups of atoms working together as a unit. | FormField (Label + Input + Error), SearchBar (Input + Button), DataCell (Label + Value) | Composed from atoms |
| **Organisms** | Complex UI sections composed of molecules and atoms. | SignupForm, DataTable, NavigationBar, UserProfileCard | Feature-specific compositions |
| **Templates** | Page-level layouts defining content areas without real data. | DashboardLayout, AuthLayout, SettingsLayout | Structural skeletons |

**Pages** are handled by the framework's routing (e.g., Next.js `app/` directory) and are NOT part of the component hierarchy.

### Folder Structure

```
src/components/
├── atoms/              # shadcn/ui primitives + custom atoms
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Label.tsx
│   ├── Badge.tsx
│   └── ui/             # shadcn/ui generated components
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
├── molecules/          # Composed from atoms
│   ├── FormField.tsx
│   ├── SearchBar.tsx
│   └── DataCell.tsx
├── organisms/          # Feature-specific compositions
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   └── SignupForm.test.tsx
│   ├── data/
│   │   └── DataTable.tsx
│   └── navigation/
│       └── NavigationBar.tsx
└── templates/          # Page layouts
    ├── DashboardLayout.tsx
    └── AuthLayout.tsx
```

### Storybook Organization

Stories mirror the atomic hierarchy in their titles:

```
stories/
├── atoms/
│   ├── Button.stories.tsx        # title: 'Atoms/Button'
│   └── Input.stories.tsx         # title: 'Atoms/Input'
├── molecules/
│   ├── FormField.stories.tsx     # title: 'Molecules/FormField'
│   └── SearchBar.stories.tsx     # title: 'Molecules/SearchBar'
├── organisms/
│   ├── auth/
│   │   └── SignupForm.stories.tsx # title: 'Organisms/Auth/SignupForm'
│   └── data/
│       └── DataTable.stories.tsx  # title: 'Organisms/Data/DataTable'
└── templates/
    └── DashboardLayout.stories.tsx # title: 'Templates/DashboardLayout'
```

This Storybook sidebar becomes the **component catalog** — a living inventory of all UI components, organized by composition level.

### Component Catalog Check (Mandatory)

Before creating ANY new component, check the Storybook catalog:

1. **Browse the sidebar** — Does an atom or molecule already exist that does this?
2. **Check shadcn/ui** — Use `mcp__shadcn-ui-server__list_shadcn_components` to check availability
3. **Compose before creating** — Can you build what you need from existing atoms/molecules?
4. **Only create new** if nothing exists at the right level

This prevents duplication across iterative feature development. Each new feature should reuse existing lower-level components and only add what's genuinely new.

### Classification Guidelines

**When classifying is ambiguous:**
- If it wraps a single atom with additional behavior → Still an atom (e.g., PasswordInput wraps Input)
- If it combines 2-3 atoms into a reusable unit → Molecule
- If it's feature-specific and combines molecules → Organism
- If it defines layout without content → Template

**Don't over-classify.** If debate about classification takes longer than creating the component, pick the closest level and move on.

---

## The 7-Stage Design Flow

### Stage 1: UX Intent Extraction (Designer-led)

The designer works **without tools** to understand intent.

**Determines:**
- What screens or flows exist
- What the user must see
- What actions are possible
- What states must exist (idle, loading, error, success, empty)
- What feedback and accessibility behavior is required

**Output:** UX intent notes and list of required components with states.

### Stage 2: Initial Visual Language + Base Tokens (Designer + AI)

Establish the visual language AND base design tokens from day one.

**Base tokens to establish immediately:**
- Brand colors (primary, secondary, neutral, danger, success, warning)
- Typography scale (heading sizes, body, caption, monospace)
- Spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Border radius scale (none, sm, md, lg, full)
- Shadow scale (none, sm, md, lg)

**At this stage:**
- Use Tailwind CSS variables or CSS custom properties for tokens
- Hard-coded values are acceptable for non-token values
- Consistency and clarity are the goals

**Component Catalog Check:** Before creating new components, browse existing Storybook atoms and molecules. Compose from existing components first.

**Output:** Base design tokens + early UI components rendered in Storybook.

### Stage 3: Component Design in Storybook (Designer + AI)

This is where **UI design actually happens**.

**The designer:**
- Works directly in Storybook
- Reviews components visually and behaviorally
- Ensures all required states exist
- Refines hierarchy, copy, and affordances

**The AI:**
- Creates components in `src/components/{atoms,molecules,organisms}/` (props-driven, no real API calls)
- Creates Storybook stories that import these components
- Passes mock data as props to show all states
- Classifies components by atomic level

**Component vs Story Separation (CRITICAL):**
```
src/components/organisms/auth/SignupForm.tsx    # Real component (props-driven)
stories/organisms/auth/SignupForm.stories.tsx   # Imports component, passes mock data
src/components/organisms/auth/SignupForm.test.tsx # Tests the real component
```

Stories IMPORT components — they don't CONTAIN them.

**Output:** Components in atomic folders, Storybook stories, selector contracts.

### Stage 4: Behavior Locked with Tests (Designer intent, AI authored)

**Storybook play functions are PRIMARY for UI components.** They run in a real browser and test:
- What the user can see (elements present/absent)
- What actions are possible (click, type, submit)
- What feedback appears (messages, state changes)
- Accessibility roles and semantics

**RTL tests are for non-visual logic only:**
- Custom hooks (data fetching, state management)
- Utility functions (formatting, transforms)
- Complex state machines

**Do NOT duplicate assertions.** If a Storybook play function tests button enabled/disabled, don't repeat in RTL.

**Output:** Storybook play functions (primary UI tests) + RTL tests (non-visual logic).

### Stage 5: Design Sign-off (Designer)

Design is "done" when:
- Storybook reflects intended UI and all states
- Play functions test all UI behaviors
- RTL tests cover non-visual logic
- No duplicated assertions
- Copy, hierarchy, and UX intent are clear

There are no redlines, no pixel specs, no handoff documents.

### Stage 6: Handoff to Engineering (Ownership Transfer)

Engineering receives actual components, stories, and tests. They:
- Enhance existing components with real API calls, state management
- Integrate routing and data fetching
- Keep tests passing (they're the behavioral contract)
- Do NOT copy from stories or rewrite from scratch

### Stage 7: Pattern Tokenisation (When patterns stabilize)

Stage 7 is for **extracting emergent patterns** — NOT base tokens (those were established in Stage 2).

Examples of emergent tokens:
- "This card padding (24px top, 16px sides) keeps appearing" → Create `--card-padding`
- "This specific gray (#6B7280) is used for secondary text everywhere" → Verify it maps to a token
- Repeated component combinations → Extract into new molecules

---

## Workflows

### Workflow: Creating Storybook Stories from Scenarios

**When:** Requirements phase, after BDD scenarios created.

1. Read BDD scenarios from mini-PRD Section 4
2. Check tsconfig.json path aliases (plan imports accordingly)
3. Read design system at `/docs/design/design-system.md`
4. **Component Catalog Check** — Browse existing Storybook for reusable atoms/molecules
5. List available shadcn/ui components: `mcp__shadcn-ui-server__list_shadcn_components`
6. Get component details: `mcp__shadcn-ui-server__get_component_details(componentName)`
7. Create selector contract at `/tests/selectors/[capability].ts`
8. Create component files in `src/components/{atoms,molecules,organisms}/` (props-driven)
9. Create story files that IMPORT the components
10. Write stories for each scenario (happy, error, boundary, validation)
11. Add responsive variants (Mobile, Tablet, Desktop)
12. Add theme variants (Light, Dark) using decorators
13. Implement play functions for interaction testing
14. Add `tags: ['autodocs']` and JSDoc on props for auto-generated docs
15. Test locally: `npm run storybook`

### Workflow: Creating RTL Tests

**When:** Requirements phase, for non-visual logic.

1. Identify Component-type scenarios in mini-PRD
2. Read selector contract from `/tests/selectors/[capability].ts`
3. Create test file colocated with component: `[Component].test.tsx`
4. Write tests: Arrange (render) → Act (userEvent) → Assert (behavior)
5. Include accessibility assertions (getByRole, getByLabelText)
6. Run: `npm test -- [component].test.tsx`

### Workflow: Creating Selector Contracts

**When:** Before creating stories or tests for UI features.

```typescript
// tests/selectors/auth.ts
export const AUTH = {
  signup: {
    form: 'signup-form',
    email: 'signup-email',
    password: 'signup-password',
    submit: 'signup-submit',
    successMessage: 'signup-success',
    errorMessage: 'signup-error',
  },
};
```

Use in components (`data-testid={AUTH.signup.email}`), stories, RTL tests, and Playwright E2E tests.

### Workflow: Accessibility Compliance (WCAG 2.1 AA)

1. **Semantic HTML** — Heading hierarchy, ARIA roles, landmark regions, form labels
2. **Keyboard navigation** — Tab order, focus visible, Escape closes modals, arrow keys in menus
3. **Screen reader** — ARIA labels, live regions, described-by for hints, hidden decorative elements
4. **Color contrast** — Text 4.5:1, large text 3:1, interactive elements 3:1
5. **Focus management** — Visible focus, trapped in modals, restored on close, skip links
6. **Touch targets** — Minimum 44px for mobile

---

## Storybook Patterns

### CSF 3 with Factories (Storybook 9+)

Use CSF 3 factories for reduced boilerplate:

```typescript
// stories/organisms/auth/SignupForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { SignupForm } from '@/components/organisms/auth/SignupForm';
import { AUTH } from '@/tests/selectors/auth';

const meta = {
  title: 'Organisms/Auth/SignupForm',
  component: SignupForm,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
} satisfies Meta<typeof SignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onSubmit: fn() },
};

export const ValidSubmission: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId(AUTH.signup.email), 'test@example.com');
    await userEvent.type(canvas.getByTestId(AUTH.signup.password), 'SecurePass123!');
    await expect(canvas.getByTestId(AUTH.signup.submit)).toBeEnabled();
    await userEvent.click(canvas.getByTestId(AUTH.signup.submit));
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};
```

### Theme Variant Stories

Add light/dark mode variants using decorators:

```typescript
// .storybook/decorators/theme-decorator.tsx
export const withTheme = (theme: 'light' | 'dark') => (Story: React.FC) => (
  <div data-theme={theme} className={theme === 'dark' ? 'dark' : ''}>
    <Story />
  </div>
);

// In story file:
export const DarkMode: Story = {
  args: { onSubmit: fn() },
  decorators: [withTheme('dark')],
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const LightMode: Story = {
  args: { onSubmit: fn() },
  decorators: [withTheme('light')],
};
```

Create both variants for components that have theme-dependent styling.

### Responsive Variant Stories

```typescript
export const MobileView: Story = {
  args: { onSubmit: fn() },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const TabletView: Story = {
  args: { onSubmit: fn() },
  parameters: { viewport: { defaultViewport: 'tablet' } },
};

export const DesktopView: Story = {
  args: { onSubmit: fn() },
  // Desktop is default
};
```

### Component Autodocs

Leverage Storybook's autodocs for auto-generated documentation:

1. **Add `tags: ['autodocs']`** to meta — generates a docs page automatically
2. **Add JSDoc to props interface** — appears as prop descriptions:
   ```typescript
   interface SignupFormProps {
     /** Called when form is submitted with valid data */
     onSubmit: (data: FormData) => Promise<void>;
     /** Initial email value for the form */
     initialEmail?: string;
     /** Whether to show the password strength indicator */
     showStrength?: boolean;
   }
   ```
3. **Use `argTypes`** for enhanced controls:
   ```typescript
   argTypes: {
     onSubmit: { action: 'submitted' },
     showStrength: { control: 'boolean', description: 'Toggle strength indicator' },
   },
   ```
4. **Default values** show in the docs table automatically from component defaults

---

## UX Review Workflow

UX Review is a **Delivery-phase validation step** run before PR approval for UI changes.

### When to Run

- PR touches `src/components/`, `stories/`, or UI-related files
- Periodically as a quality audit
- After significant UI refactoring or new feature delivery

### Review Inputs

1. UI under review (URL, build, or Storybook)
2. Brand guidelines (`docs/design/brand-guidelines.md`)
3. Design decision log (`docs/design/design-decisions.md`)
4. Reference class declaration

### Review Checklist

**1. Structural & Information Architecture**
- One dominant mental model?
- Views are noun-based, not workflow soup?
- Primary navigation ≤2 levels deep?
- Context preserved when navigating?

**2. ShadCN / Radix Component Discipline**
- Correct use of Dialog vs Sheet vs Popover?
- Forms use Form, FormField, FormMessage consistently?
- Tables not abused where list + detail would suffice?
- Exactly one primary action per view?

**3. Density & Power-User Bias**
- No excessive vertical padding or oversized headings?
- Desktop efficiency not harmed by mobile-first?
- Keyboard shortcuts are first-class?

**4. State, Feedback, and Honesty**
- Loading vs empty vs error vs success states distinct?
- Optimistic updates with visible reconciliation?
- Disabled actions explain why?

**5. Accessibility (WCAG 2.1 AA)**
- Color contrast minimum 4.5:1?
- Keyboard navigation complete?
- Focus visible on all interactive elements?
- Screen reader announces state changes?

**6. Brand Guidelines & Token Alignment**
- Colors match token definitions?
- Typography follows hierarchy?
- Spacing uses design tokens?

**7. Design Decision Log Compliance**
- Search log for prior decisions on each UI element
- Classify as: Aligned | Tension | Violation

### Reference Classes

| Reference Class | Key Validation Points |
|-----------------|----------------------|
| Data-Dense Internal Tools | Tables first, predictable navigation |
| Workflow / Inbox-Driven | Focus discipline, one next action |
| Decision / Modelling | Spatial reasoning, few modals |
| Desktop Productivity | Zero latency, keyboard parity |
| ShadCN-Native SaaS | Correct primitives, token discipline |

**Hard rule:** If a reference class can't be stated, the review is invalid.

### Review Outputs

Every review emits one or more of:
1. Implementation fix (code changes needed)
2. Token evolution (design token updates needed)
3. Brand guideline amendment (guidelines need updating)
4. Design decision (new decision to log)

### Mobile Review (Flutter)

If project includes Flutter mobile, also check:
- Widget tests exist for components
- Widgetbook stories match web Storybook
- Design tokens bridged via Style Dictionary
- Touch targets minimum 44px
- Platform-appropriate patterns used

See `af-flutter-expertise` skill for mobile-specific patterns.

---

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Missing selector contract | Arbitrary `data-testid` values | Define contract first, use everywhere |
| Tests test implementation | Testing internal state, not behavior | Assert only what user can see |
| Not checking catalog | Creating components that already exist | Browse Storybook before creating |
| Desktop-only testing | No mobile/tablet variants | Add MobileView and TabletView stories |
| Custom over design system | Building custom when shadcn/ui exists | Check shadcn/ui availability first |
| Embedding components in stories | Full code inside story files | Stories import from src/components/ |
| Wrong import paths | Assuming @/tests/ works | Read tsconfig.json paths first |
| Skipping play functions | Only RTL tests, no Storybook testing | Play functions are PRIMARY for UI |
| No theme variants | Only testing default theme | Add Dark/Light mode stories |
| No autodocs | Missing prop documentation | Add JSDoc + `tags: ['autodocs']` |

---

## Integration with AgentFlow Phases

| Phase | UX Design Activities |
|-------|---------------------|
| **Discovery** | Brand guidelines, reference class, design decision log, base design tokens |
| **Requirements** | Stages 1-5: Component Catalog Check → Create components → Storybook stories → Tests → Sign-off |
| **Delivery** | Stage 6: Engineering wires components, **UX Review before PR approval** |
| **Post-Delivery** | Stage 7: Extract emergent pattern tokens |

---

## Essential Reading

- Project design system: `/docs/design/design-system.md`
- Load `af-bdd-expertise` for scenario understanding
- Load `af-testing-expertise` for test patterns
- [Storybook Documentation](https://storybook.js.org/docs/react/writing-stories/introduction)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
