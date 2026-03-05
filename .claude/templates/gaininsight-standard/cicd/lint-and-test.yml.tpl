# Template: PR Validation Workflow
# Replace placeholders: {{PROJECT_NAME}}, {{AWS_REGION}}, {{AMPLIFY_APP_ID_DEV}}

name: Lint and Test

on:
  pull_request:
    branches: [develop, staging, main]

jobs:
  validate:
    name: Validate
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Amplify outputs
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: {{AWS_REGION}}
        run: npx ampx generate outputs --app-id {{AMPLIFY_APP_ID_DEV}} --branch develop

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:unit -- --coverage --coverageThreshold='{}'

      - name: Integration tests
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: {{AWS_REGION}}
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false
