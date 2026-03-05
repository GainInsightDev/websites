# Template: Staging Deployment with E2E Tests
# Replace placeholders: {{AWS_REGION}}, {{AMPLIFY_APP_ID_STG}}, {{BASE_URL_STG}}, {{S3_REPORTS_BUCKET}}

name: Deploy Staging

on:
  push:
    branches: [staging]

env:
  AWS_REGION: {{AWS_REGION}}
  BASE_URL: {{BASE_URL_STG}}
  AMPLIFY_APP_ID: {{AMPLIFY_APP_ID_STG}}

jobs:
  deploy-and-test:
    name: Deploy and E2E Test
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Wait for Amplify deployment
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ env.AWS_REGION }}
        run: |
          set -euo pipefail

          COMMIT_SHA="${{ github.sha }}"
          echo "Waiting for Amplify deployment of commit ${COMMIT_SHA:0:7}..."

          # Phase 1: Wait for Amplify to start a job for this commit (up to 5 min)
          JOB_ID=""
          for i in {1..30}; do
            echo "Looking for job for commit ${COMMIT_SHA:0:7} (attempt $i/30)..."

            JOBS=$(aws amplify list-jobs \
              --app-id ${{ env.AMPLIFY_APP_ID }} \
              --branch-name staging \
              --max-items 10 \
              --query 'jobSummaries' \
              --output json)

            JOB_ID=$(echo "$JOBS" | jq -r --arg sha "$COMMIT_SHA" '.[] | select(.commitId == $sha) | .jobId' | head -1)

            if [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
              echo "Found job $JOB_ID for commit ${COMMIT_SHA:0:7}"
              break
            fi

            sleep 10
          done

          if [ -z "$JOB_ID" ] || [ "$JOB_ID" = "null" ]; then
            echo "ERROR: Could not find Amplify job for commit ${COMMIT_SHA:0:7} after 5 minutes"
            exit 1
          fi

          # Phase 2: Poll for job completion (up to 20 min for queued jobs)
          for i in {1..120}; do
            STATUS=$(aws amplify get-job \
              --app-id ${{ env.AMPLIFY_APP_ID }} \
              --branch-name staging \
              --job-id $JOB_ID \
              --query 'job.summary.status' \
              --output text)

            echo "Attempt $i/120: Status = $STATUS"

            if [ "$STATUS" = "SUCCEED" ]; then
              echo "Deployment succeeded!"
              echo "Waiting 30s for CloudFront propagation..."
              sleep 30
              exit 0
            fi

            if [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
              echo "Deployment failed with status: $STATUS"
              exit 1
            fi

            sleep 10
          done

          echo "Timeout waiting for deployment"
          exit 1

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
          AWS_REGION: ${{ env.AWS_REGION }}
        run: npx ampx generate outputs --app-id ${{ env.AMPLIFY_APP_ID }} --branch staging

      - name: Seed test data
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ env.AWS_REGION }}
        run: npm run seed

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        env:
          BASE_URL: ${{ env.BASE_URL }}
          GMAIL_TESTING_SERVICE_ACCOUNT: ${{ secrets.GMAIL_TESTING_SERVICE_ACCOUNT }}
        run: npm run test:e2e

      - name: Upload test results as artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-report
          path: reports/playwright/
          retention-days: 7

      - name: Upload E2E report to S3
        if: always()
        continue-on-error: true
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ env.AWS_REGION }}
          S3_REPORTS_BUCKET: ${{ vars.S3_REPORTS_BUCKET || '{{S3_REPORTS_BUCKET}}' }}
        run: |
          # Upload to latest/ (always current)
          if aws s3 sync reports/playwright/ s3://${S3_REPORTS_BUCKET}/e2e/latest/ --delete; then
            # Upload to dated folder for history
            DATE=$(date +%Y-%m-%d-%H%M)
            aws s3 sync reports/playwright/ s3://${S3_REPORTS_BUCKET}/e2e/$DATE/
            echo "E2E report: http://${S3_REPORTS_BUCKET}.s3-website.${AWS_REGION}.amazonaws.com/e2e/latest/"
          else
            echo "::warning::Failed to upload E2E report to S3 (non-fatal)"
          fi
