---
title: "GainInsight Standard - Flutter Mobile Setup"
sidebar_label: "Flutter Mobile (Optional)"
sidebar_position: 1.5
created: 2026-01-30
updated: 2026-01-30
last_checked: 2026-01-30
tags: [guide, gaininsight, flutter, mobile, ios, android, widgetbook]
parent: ./README.md
related:
  - ./layer-1-infrastructure.md
  - ./layer-2-testing.md
  - ../../../skills/af-develop-flutter-apps/SKILL.md
---

# Flutter Mobile Setup (Optional Add-on)

Add Flutter mobile support to your GainInsight Standard project. Creates a monorepo with shared Amplify backend.

> **Reference Implementation:** AFT (`/srv/worktrees/aft/develop`) demonstrates the complete web + mobile monorepo pattern.

## When to Add Flutter

Add Flutter **after Layer 1** (Infrastructure) is complete. Flutter needs:
- Amplify backend deployed
- `amplify_outputs.json` generated
- AppSync endpoint working

Once added, Layers 2/3/4 will include mobile automatically.

## What This Setup Provides

- `packages/mobile/` - Flutter app with Amplify integration
- Monorepo structure sharing `amplify/` backend
- Stack validation (same Todo.list() as web)
- Widgetbook component catalog
- Config sync scripts

---

## Prerequisites

- Layer 1 complete (Amplify backend working)
- Flutter SDK installed (`flutter --version`)
- Web app validates successfully ("No todos yet - API is working!")

**Flutter Installation (if needed):**

```bash
# On gidev server, Flutter is at:
export PATH="/var/lib/tmux-shared/flutter/bin:$PATH"

# Verify
flutter --version
# Flutter 3.24.5 • Dart 3.5.4
```

---

## Step 1: Convert to Monorepo Structure

**Purpose:** Move web app to `packages/web/`, prepare for `packages/mobile/`.

### 1.1 Create packages directory

```bash
cd {project-root}
mkdir -p packages
```

### 1.2 Move web app to packages/web/

```bash
# Move all web-related files
mkdir packages/web
mv src packages/web/
mv public packages/web/
mv .storybook packages/web/
mv stories packages/web/
mv next.config.ts packages/web/
mv tailwind.config.ts packages/web/
mv postcss.config.mjs packages/web/
mv tsconfig.json packages/web/
mv components.json packages/web/
mv eslint.config.mjs packages/web/
mv jest.config.js packages/web/
mv playwright.config.ts packages/web/
```

### 1.3 Create packages/web/package.json

```json
{
  "name": "@{project}/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "jest",
    "test:e2e": "playwright test",
    "postinstall": "cp ../../amplify_outputs.json . 2>/dev/null || true"
  },
  "dependencies": {
    // ... move dependencies from root package.json
  }
}
```

### 1.4 Update root package.json for workspaces

```json
{
  "name": "{project}",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=@{project}/web",
    "dev:mobile": "cd packages/mobile && flutter run -d web-server --web-port=4000",
    "build": "npm run build --workspace=@{project}/web",
    "test": "npm run test --workspaces --if-present",
    "storybook": "npm run storybook --workspace=@{project}/web",
    "widgetbook": "cd packages/mobile && flutter run -d web-server -t widgetbook/main.dart --web-port=7000"
  }
}
```

### 1.5 Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Step 2: Create Flutter App

**Purpose:** Scaffold Flutter app in `packages/mobile/`.

### 2.1 Create Flutter project

```bash
cd packages
flutter create --org com.{company} mobile --project-name {project}_mobile
cd mobile
```

### 2.2 Add Amplify dependencies

Edit `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

  # Amplify Flutter SDK
  amplify_flutter: ^2.0.0
  amplify_auth_cognito: ^2.0.0
  amplify_api: ^2.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

  # Widgetbook - component catalog (Flutter's Storybook)
  widgetbook: 3.7.1
  widgetbook_annotation: 3.1.0
```

> **Version Note:** Flutter 3.24.5 (Dart 3.5.4) requires Widgetbook 3.7.1, not 3.10+. Check `flutter --version` and match Widgetbook version to Dart SDK.

### 2.3 Install dependencies

```bash
flutter pub get
```

---

## Step 3: Configure Amplify Integration

**Purpose:** Load same `amplify_outputs.json` as web app.

### 3.1 Create assets directory

```bash
mkdir -p assets
```

### 3.2 Update pubspec.yaml for assets

Add under `flutter:` section:

```yaml
flutter:
  uses-material-design: true

  assets:
    - assets/amplify_outputs.json
```

### 3.3 Create config loader

Create `lib/amplify_config.dart`:

```dart
import 'dart:convert';
import 'package:flutter/services.dart';

String? _cachedConfig;

/// Load Amplify config from bundled asset
/// Parallel to web's dynamic import approach
Future<String> loadAmplifyConfig() async {
  if (_cachedConfig != null) return _cachedConfig!;

  try {
    final jsonString = await rootBundle.loadString('assets/amplify_outputs.json');
    json.decode(jsonString); // Validate JSON
    _cachedConfig = jsonString;
    return jsonString;
  } catch (e) {
    return _fallbackConfig;
  }
}

/// Fallback config for development when backend not deployed
const _fallbackConfig = '''
{
  "version": "1",
  "auth": {
    "user_pool_id": "",
    "user_pool_client_id": "",
    "identity_pool_id": "",
    "aws_region": "eu-west-2"
  },
  "data": {
    "url": "",
    "aws_region": "eu-west-2",
    "api_key": "",
    "default_authorization_type": "API_KEY"
  }
}
''';
```

### 3.4 Create sync script

Create `scripts/sync-amplify-config.sh`:

```bash
#!/bin/bash
# Sync amplify_outputs.json from root to mobile assets
# Run after `npx ampx sandbox` or `ampx deploy`

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$(dirname "$MOBILE_DIR")")"

SOURCE="$ROOT_DIR/amplify_outputs.json"
DEST="$MOBILE_DIR/assets/amplify_outputs.json"

if [ -f "$SOURCE" ]; then
  cp "$SOURCE" "$DEST"
  echo "✅ Synced amplify_outputs.json to mobile assets"
else
  echo "⚠️  No amplify_outputs.json found at root - using placeholder"
  echo '{"version":"1","auth":{},"data":{}}' > "$DEST"
fi
```

```bash
chmod +x scripts/sync-amplify-config.sh
```

---

## Step 4: Create Stack Validation App

**Purpose:** App that queries same endpoint as web to validate full stack.

### 4.1 Update lib/main.dart

```dart
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_api/amplify_api.dart';

import 'amplify_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _configureAmplify();
  runApp(const MyApp());
}

bool _amplifyConfigured = false;

Future<void> _configureAmplify() async {
  if (_amplifyConfigured) return;

  try {
    final config = await loadAmplifyConfig();
    await Amplify.addPlugins([AmplifyAuthCognito(), AmplifyAPI()]);
    await Amplify.configure(config);
    _amplifyConfigured = true;
    safePrint('Amplify configured successfully');
  } on AmplifyAlreadyConfiguredException {
    _amplifyConfigured = true;
  } catch (e) {
    safePrint('Error configuring Amplify: $e');
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{Project} Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _status = 'Loading...';
  bool _isConnected = false;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchTodos();
  }

  /// Fetch todos from Amplify backend - mirrors web's client.models.Todo.list()
  Future<void> _fetchTodos() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      const listTodosQuery = '''
        query ListTodos {
          listTodos {
            items { id content isDone }
          }
        }
      ''';

      final request = GraphQLRequest<String>(document: listTodosQuery);
      final response = await Amplify.API.query(request: request).response;

      if (response.errors.isNotEmpty) {
        setState(() {
          _error = response.errors.map((e) => e.message).join(', ');
          _isConnected = false;
          _isLoading = false;
        });
        return;
      }

      final data = response.data;
      if (data != null) {
        final json = jsonDecode(data) as Map<String, dynamic>;
        final items = (json['listTodos']?['items'] as List?) ?? [];
        setState(() {
          _isConnected = true;
          _status = items.isEmpty
              ? 'No todos yet - API is working!'
              : '${items.length} todo(s) found';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isConnected = false;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('{Project} Mobile'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Status indicator
              Container(
                padding: const EdgeInsets.all(16),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: _error != null
                      ? Colors.red.shade50
                      : _isConnected
                          ? Colors.green.shade50
                          : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _error != null
                        ? Colors.red
                        : _isConnected
                            ? Colors.green
                            : Colors.grey,
                  ),
                ),
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _error != null
                        ? Text('Error: $_error',
                            style: TextStyle(color: Colors.red.shade800))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.cloud_done, color: Colors.green.shade700),
                              const SizedBox(width: 8),
                              Text(_status,
                                  style: TextStyle(color: Colors.green.shade800)),
                            ],
                          ),
              ),
              const SizedBox(height: 16),
              Text('GainInsight Standard - Layer 1 Validation',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _fetchTodos,
                child: const Text('Refresh'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## Step 5: Set Up Widgetbook

**Purpose:** Create component catalog (Flutter's Storybook).

### 5.1 Create widgetbook entry point

Create `widgetbook/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

// Import your components using package imports
import 'package:{project}_mobile/components/example_button.dart';

void main() {
  runApp(const WidgetbookApp());
}

class WidgetbookApp extends StatelessWidget {
  const WidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      directories: [
        WidgetbookFolder(
          name: 'Components',
          children: [
            WidgetbookComponent(
              name: 'ExampleButton',
              useCases: [
                WidgetbookUseCase(
                  name: 'Primary',
                  builder: (context) => Center(
                    child: ExampleButton(
                      label: context.knobs.string(
                        label: 'Label',
                        initialValue: 'Click me',
                      ),
                      onPressed: context.knobs.boolean(
                        label: 'Enabled',
                        initialValue: true,
                      ) ? () {} : null,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
```

> **Important:** Use package imports (`import 'package:{project}_mobile/...'`) not relative imports (`import '../lib/...'`). Relative imports fail from widgetbook/ directory.

### 5.2 Create example component

Create `lib/components/example_button.dart`:

```dart
import 'package:flutter/material.dart';

class ExampleButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;

  const ExampleButton({
    super.key,
    required this.label,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(label),
    );
  }
}
```

---

## Step 6: Validate Setup

### 6.1 Sync Amplify config

```bash
./scripts/sync-amplify-config.sh
```

### 6.2 Run Flutter web (headless)

```bash
flutter run -d web-server --web-port=4000 --web-hostname=0.0.0.0
```

### 6.3 Verify stack validation

Open `http://localhost:4000` (or via Caddy URL).

**Expected:** "No todos yet - API is working!" in green box.

This proves:
- Amplify config loaded
- AppSync endpoint reachable
- API key auth working
- DynamoDB connected

### 6.4 Run Widgetbook

```bash
flutter run -d web-server -t widgetbook/main.dart --web-port=7000
```

**Expected:** Component catalog with ExampleButton.

---

## What's Next

With Flutter setup complete, continue to:
- **Layer 2:** Add widget tests alongside Jest tests
- **Layer 3:** Build components in Widgetbook alongside Storybook
- **Layer 4:** Add mobile CI/CD (GitHub Actions for Android, Codemagic for iOS)

---

## Troubleshooting

### Widgetbook version error

```
widgetbook_annotation >=3.7.0 requires SDK version >=3.7.0
```

**Fix:** Use Widgetbook 3.7.1 for Dart 3.5.4:
```yaml
widgetbook: 3.7.1
widgetbook_annotation: 3.1.0
```

### Import errors in Widgetbook

```
Error when reading 'org-dartlang-app:/lib/components/...': File not found
```

**Fix:** Use package imports, not relative:
```dart
// Wrong
import '../lib/components/button.dart';

// Correct
import 'package:{project}_mobile/components/button.dart';
```

### Port already in use

**Fix:** Use different port or check what's using it:
```bash
lsof -i :4000
flutter run -d web-server --web-port=4500
```

---

## Reference

- **Skill:** `.claude/skills/af-develop-flutter-apps/SKILL.md`
- **AFT Implementation:** `/srv/worktrees/aft/develop/packages/mobile/`
- **Web/Flutter Parallel:** Same Todo.list() query, same success message
