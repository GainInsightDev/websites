---
title: "Integration: Amplify ESM Configuration"
created: 2026-02-18
updated: 2026-02-18
last_checked: 2026-02-18
tags: [integration, amplify, esm, typescript]
parent: ./README.md
related:
  - ../aws-amplify-guide.md
  - ../gaininsight-standard/layer-1-infrastructure.md
---

# Integration: Amplify ESM Configuration

Amplify Gen 2 uses ECMAScript Modules (ESM) internally. Two configuration files must be coordinated for module resolution to work correctly. Missing either one produces the error:

```
Cannot find module '.../amplify/data/resource'
```

## The Two Required Configurations

### 1. Amplify package.json Must Declare ESM

The `amplify/package.json` file **must** contain `{"type": "module"}`:

```json
{
  "type": "module"
}
```

**Why:** Node.js defaults to CommonJS module resolution. Amplify Gen 2 backend files use ESM `import`/`export` syntax. Without the explicit `"type": "module"` declaration, Node.js attempts to parse ESM files as CommonJS and fails.

### 2. Root tsconfig.json Must Exclude Amplify

The root `tsconfig.json` **must** exclude the `amplify` directory:

```json
{
  "compilerOptions": {
    // ...
  },
  "exclude": ["amplify"]
}
```

**Why:** The Amplify backend has its own `amplify/tsconfig.json` with different compiler settings (ESM target, different module resolution). If the root TypeScript config includes the `amplify` directory, the TypeScript compiler applies the wrong settings to Amplify files, causing resolution failures.

## Why Both Are Required

These two files work together to establish correct module boundaries:

| Configuration | What It Controls | Without It |
|---------------|-----------------|------------|
| `amplify/package.json` `"type": "module"` | Node.js treats `.js` files as ESM | `SyntaxError: Cannot use import statement` |
| Root `tsconfig.json` `exclude: ["amplify"]` | TypeScript uses Amplify's own config | `Cannot find module` or type errors |

Missing either file while having the other still results in build failures. They must both be present.

## Correct Configuration Example

### `amplify/package.json`

```json
{
  "type": "module"
}
```

This file may also contain dependencies used by Amplify backend functions. The critical requirement is the `"type": "module"` field.

### `amplify/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "$amplify/*": ["../.amplify/generated/*"]
    }
  }
}
```

### Root `tsconfig.json` (relevant section)

```json
{
  "compilerOptions": {
    // Next.js / project-specific settings
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "amplify"]
}
```

## Troubleshooting

| Symptom | Likely Cause |
|---------|-------------|
| `Cannot find module '.../amplify/data/resource'` | Missing one or both configurations |
| `SyntaxError: Cannot use import statement outside a module` | Missing `"type": "module"` in `amplify/package.json` |
| Type errors only in `amplify/` files | Root `tsconfig.json` not excluding `amplify` |
| Works locally but fails in CI | CI environment may have different Node.js version or missing `amplify/package.json` |
