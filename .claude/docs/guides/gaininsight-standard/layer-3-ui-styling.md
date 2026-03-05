---
title: "GainInsight Standard - Layer 3: UI & Styling"
sidebar_label: "Layer 3 UI & Styling"
sidebar_position: 3
created: 2025-12-15
updated: 2026-02-09
last_checked: 2026-02-09
tags: [guide, gaininsight, ui, styling, shadcn, storybook]
parent: ./README.md
related:
  - ./layer-2-testing.md
  - ./layer-4-cicd.md
  - ../../../skills/af-gaininsight-standard/SKILL.md
  - ../posthog-guide.md
  - ../../../skills/af-posthog-expertise/SKILL.md
---

# Layer 3: UI & Styling

**Purpose:** Add shadcn/ui components and Storybook to the GainInsight Standard stack.

> **Reference Implementation:** Juncan (`/data/worktrees/juncan/develop`) has working examples of shadcn/ui component configuration and Storybook setup.

**Prerequisites:**
- Layer 1 complete (shadcn/ui initialized with Button, Card)
- Layer 2 complete (testing framework)

**Time:** ~30 minutes

---

## Overview

Layer 3 builds on the shadcn/ui foundation from Layer 1:
- Adds 3 more components (Badge, Input, Dialog)
- Sets up Storybook for component documentation
- Configures theming with CSS variables
- Documents the tweakcn workflow for customization

---

## 3.0 Install Test Specifications (RED Phase)

**Purpose:** Copy Layer 3 BDD test templates to target project. Tests will FAIL initially - this is expected (Red phase of Red-Green-Refactor).

**Why tests first:**
- Tests are the *specification* of what Layer 3 should deliver
- Running tests now establishes our "red" baseline
- After setup, tests should turn "green"
- This is proper BDD/TDD workflow

**Steps:**

Layer 3 validation is integrated with Layer 2 tests. After completing Layer 3 setup, run:

```bash
cd {target-project}/tests/gaininsight-stack

# Quick validation (configuration checks)
doppler run --project {project-name} --config dev -- npm run test:layer-3:quick

# Runtime validation (actual component and Storybook checks)
# First ensure dev server is running:
npm run dev &
sleep 10

# Then run runtime tests:
doppler run --project {project-name} --config dev -- npx playwright test --project=layer-3 --grep @runtime
```

**Expected result in RED phase:** Tests FAIL because:
- Additional shadcn components not installed
- Storybook not set up
- Theme configuration incomplete
- Sample stories not written

**This is correct!** We now have our specification. Proceed with Layer 3 setup.

---

## 3.1 Verify Layer 1 shadcn Setup

**Purpose:** Confirm shadcn/ui is properly initialized from Layer 1.

**Check these files exist:**

```bash
# Core shadcn files
ls -la components.json
ls -la src/lib/utils.ts
ls -la src/components/ui/button.tsx
ls -la src/components/ui/card.tsx
```

**Expected `components.json`:**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

---

## 3.2 Add Additional Components

**Purpose:** Install Badge, Input, and Dialog components.

**Steps:**

```bash
# Add components (run from project root)
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add dialog
```

**Verify installation:**

```bash
ls -la src/components/ui/
# Should show: badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx
```

**Component summary:**

| Component | Complexity | Use case |
|-----------|------------|----------|
| Button | Simple | Actions, form submission |
| Badge | Simple | Status indicators, tags, counts |
| Card | Medium | Content containers, panels |
| Input | Medium | Forms, text entry |
| Dialog | Complex | Modals, confirmations, forms |

---

## 3.3 Install Storybook

**Purpose:** Set up Storybook for component documentation and visual testing.

**Version Compatibility (December 2025):**

| Package | Version | Notes |
|---------|---------|-------|
| Storybook | 8.4.7 | Use v8.4.x specifically (v8.6+ has webpack 'tap' error with Next.js 15) |
| Next.js | 15.x | Stable with Storybook 8.4.x |
| Tailwind | 3.x | Use v3, not v4 (v4 requires Storybook workarounds) |
| React | 19.x | Works with Storybook 8 using --legacy-peer-deps |

**Steps:**

```bash
# Initialize Storybook for Next.js (pin to v8.4.7 for Next.js 15 compatibility)
npx storybook@8.4.7 init --builder webpack5

# Install addons at matching version
npm install -D @storybook/addon-essentials@8.4.7 @storybook/addon-interactions@8.4.7 --legacy-peer-deps

# When prompted:
# - Framework: Next.js
# - Add eslint-plugin-storybook: Yes (if asked)
```

**Important:** Storybook 10.x has compatibility issues with React 19 and Next.js 15. Stick with Storybook 8.x for a stable experience.

**This creates:**
- `.storybook/main.ts` - Storybook configuration
- `.storybook/preview.ts` - Global decorators and parameters
- `stories/` - Example stories (we'll replace these)

---

## 3.4 Configure Storybook for shadcn

**Purpose:** Configure Storybook to work with Tailwind and shadcn theming.

**Update `.storybook/main.ts`:**

```typescript
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
```

**Update `.storybook/preview.ts`:**

```typescript
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#0a0a0a" },
      ],
    },
  },
};

export default preview;
```

---

## 3.5 Create Component Stories

**Purpose:** Create Storybook stories for all base components.

**Create `stories/Button.stories.tsx`:**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};
```

**Create `stories/Badge.stories.tsx`:**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};
```

**Create `stories/Card.stories.tsx`:**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with any components or text.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>A simple card with just content.</p>
      </CardContent>
    </Card>
  ),
};
```

**Create `stories/Input.stories.tsx`:**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "Email address",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Password",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: "Pre-filled value",
    readOnly: true,
  },
};
```

**Create `stories/Dialog.stories.tsx`:**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a dialog description. It provides context for the dialog content.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Dialog content goes here.</p>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm">
              Name
            </label>
            <Input id="name" className="col-span-3" placeholder="Your name" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right text-sm">
              Email
            </label>
            <Input id="email" type="email" className="col-span-3" placeholder="Email" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
```

---

## 3.6 Update PORT_INFO.md

**Purpose:** Add Storybook port configuration.

**Add to PORT_INFO.md:**

```markdown
## Storybook

| Variable | Default | Description |
|----------|---------|-------------|
| STORYBOOK_PORT | 6006 | Storybook development server |
| STORYBOOK_URL | http://localhost:6006 | Local Storybook URL |

**Start Storybook:**
```bash
npm run storybook
```
```

---

## 3.7 Add NPM Scripts

**Purpose:** Add convenient scripts for UI development.

**Add to `package.json` scripts:**

```json
{
  "scripts": {
    "storybook": "storybook dev -p ${STORYBOOK_PORT:-6006}",
    "build-storybook": "storybook build -o reports/storybook",
    "add-component": "npx shadcn@latest add"
  }
}
```

---

## 3.8 Add PostHog Analytics & Feature Flags

**Purpose:** Integrate PostHog for product analytics, feature flags, and session replay.

> PostHog is the standard platform for these concerns — see [ADR-010](../../../../.agentflow/adr/adr-010-posthog-analytics-feature-flags.md).

**Prerequisites:**
- PostHog account registered (EU region) after Layer 1
- `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` configured in Doppler

**Step 1: Install SDK**

```bash
pnpm add posthog-js
```

**Step 2: Create PostHog module**

The hello-world-app template includes a complete `src/posthog/` module. If starting from the template, these files are already present. Otherwise, create them following the [PostHog Integration Guide](../posthog-guide.md#step-4-create-posthog-module):

```
src/posthog/
  client.ts          # SDK init, identify, reset, feature flag helpers
  provider.tsx       # React provider for auth-aware identification
  events.ts          # Typed event tracking functions
  flags.ts           # Feature flag hooks (useFeatureFlag, useViewFlags)
  index.ts           # Barrel exports
```

**Step 3: Wrap app with provider**

Add `PostHogProvider` inside your auth provider in the app layout:

```typescript
import { PostHogProvider } from "@/posthog"

// Inside your app wrapper:
<AuthProvider>
  <PostHogProvider>
    <AppContent />
  </PostHogProvider>
</AuthProvider>
```

**Step 4: Create feature flags in PostHog**

Create view-level flags in the PostHog dashboard (or via API). See the [PostHog Expertise Skill](../../../skills/af-posthog-expertise/SKILL.md) for flag naming conventions.

**Verification:**
- `pnpm dev` works without PostHog key (graceful degradation — all features visible)
- With key set via Doppler, events appear in PostHog dashboard
- Feature flags gate views correctly

---

## 3.9.1 Create Project Documentation

**Purpose:** Add UI & Styling quick reference to project docs.

**Copy template:**

```bash
cp .claude/templates/gaininsight-standard/docs/ui-styling.md docs/

# Replace {{DATE}} with current date
DATE=$(date +%Y-%m-%d)
sed -i "s/{{DATE}}/$DATE/g" docs/ui-styling.md

# Update docs/README.md to include ui-styling.md in children
```

**Update `docs/README.md` children array:**

```yaml
children:
  - ./testing.md
  - ./ui-styling.md
```

---

## 3.9.2 Verify Setup

**Purpose:** Confirm everything works correctly.

**Steps:**

```bash
# Check all components exist
ls src/components/ui/
# Expected: badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx

# Type check
npx tsc --noEmit

# Build Storybook (CI=true avoids interactive prompts)
CI=true npm run build-storybook

# Verify build output
ls reports/storybook/index.html
```

---

## 3.9.3 Validate Layer 3 Setup (BDD Tests)

**Purpose:** Run BDD tests to validate the UI & Styling setup.

### Quick Validation (@quick)

Fast configuration checks:

```bash
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- \
  npx cucumber-js --tags "@layer-3 and not @runtime"
```

**Time:** ~5 seconds

### Runtime Validation (@runtime)

Actually starts Storybook and verifies it works:

```bash
cd tests/gaininsight-stack
doppler run --project {project-name} --config dev -- \
  npx cucumber-js --tags "@layer-3 and @runtime"
```

**Time:** ~1-2 minutes

---

## Theming with tweakcn

### Default Theme

Layer 1 sets up shadcn with the "new-york" style and neutral base color. The theme is defined via CSS variables in `src/app/globals.css`.

### Customizing with tweakcn

1. **Visit** [tweakcn.com/editor/theme](https://tweakcn.com/editor/theme)
2. **Customize** colors, typography, spacing, radius
3. **Preview** changes in real-time
4. **Export** the CSS variables
5. **Replace** the `:root` and `.dark` sections in `globals.css`

### CSS Variables Structure

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode values ... */
}
```

### Adding More Components

```bash
# Browse available components
# https://ui.shadcn.com/docs/components

# Add any component
npx shadcn@latest add [component-name]

# Examples:
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add toast
```

---

## Layer 3 Checkpoint

**Layer 3 is complete!** You now have:
- ✅ 5 base shadcn/ui components (Button, Card, Badge, Input, Dialog)
- ✅ Storybook configured and running
- ✅ Component stories with variants documented
- ✅ CSS variables for theming (tweakcn-compatible)
- ✅ PostHog analytics, feature flags, and session replay integrated
- ✅ Project documentation (`docs/ui-styling.md`)
- ✅ Quick validation tests passing (@layer-3 and not @runtime)

**Your project now has a documented component library ready for rapid UI development.**

**Next: Layer 4 - CI/CD Pipeline** will add:
- GitHub Actions workflows
- Automated tests on PR
- Branch protection rules
- Deployment automation

**Ask the user:** "Layer 3 UI & Styling is complete. Would you like to continue to Layer 4 (CI/CD Pipeline) or stop here?"

---

## Troubleshooting

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot find module '@/components/ui/button'` | Path alias not configured | Check tsconfig.json has `@/*` path alias |
| Storybook styles not loading | globals.css not imported | Add `import "../src/app/globals.css"` to preview.ts |
| Components look unstyled | Tailwind not processing | Verify tailwind.config.ts includes component paths |
| `npx shadcn add` fails | Missing components.json | Run `npx shadcn@latest init` first |
| `SB_CORE-SERVER_0004 NoMatchingExportError` | Storybook version mismatch | Ensure all @storybook/* packages are same major version |
| Storybook 10 + React 19 errors | React 19 compatibility | Downgrade to Storybook 8.x |
| Tailwind v4 + Storybook issues | Missing config | Use Tailwind v3, or follow v4 workarounds |
| `TypeError: Cannot read 'tap'` | Storybook 8.6+ webpack issue | Downgrade to Storybook 8.4.7 |
| Spinner in Storybook preview | Build failed silently | Check build output, try `npm run build-storybook` |

### Storybook Version Mismatch

If you see errors like `No matching export` or `exports mismatch`:

```bash
# Check versions
npm ls storybook @storybook/nextjs @storybook/react

# All should be same major version (e.g., all 8.x.x)
# If mixed, reinstall with specific version:
npm uninstall storybook @storybook/nextjs @storybook/react
npm install -D storybook@^8 @storybook/nextjs@^8 @storybook/react@^8 --legacy-peer-deps
```

### Storybook Build Errors

```bash
# Clear Storybook cache
rm -rf node_modules/.cache/storybook

# Reinstall dependencies
rm -rf node_modules && npm install

# Rebuild
npm run build-storybook
```

### Theme Not Applying

1. Check CSS variables are in `globals.css`
2. Verify `globals.css` is imported in layout.tsx
3. Confirm tailwind.config.ts references CSS variables
4. Check for CSS specificity issues

---

## Mobile UI (If Flutter Installed)

If you added Flutter mobile support after Layer 1, include Widgetbook setup.

### Widgetbook (Flutter's Storybook)

Widgetbook provides the same component catalog experience as Storybook for Flutter.

**Location:** `packages/mobile/widgetbook/main.dart`

**Running Widgetbook:**

```bash
cd packages/mobile
flutter run -d web-server -t widgetbook/main.dart --web-port=7000
```

### Component Structure

Mirror web component patterns in Flutter:

| Web (shadcn/ui) | Flutter |
|-----------------|---------|
| `src/components/ui/button.tsx` | `lib/components/button.dart` |
| `stories/Button.stories.tsx` | `widgetbook/button_story.dart` |
| `data-testid` attribute | `Key()` object |

### Design Token Bridge

For consistent theming across platforms, use Style Dictionary to generate both:
- CSS variables for web
- Dart constants for mobile

See Flutter skill for token bridge patterns.

**Reference:** See [Flutter Mobile Setup Guide](./flutter-mobile-setup.md) for complete Widgetbook setup.
