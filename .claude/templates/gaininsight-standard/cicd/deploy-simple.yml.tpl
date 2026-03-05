# Template: Simple Deployment Monitoring (Dev/Prod)
# Replace placeholders: {{AWS_REGION}}, {{AMPLIFY_APP_ID}}, {{BRANCH_NAME}}, {{BASE_URL}}
#
# Copy this file twice:
# - deploy-develop.yml (AMPLIFY_APP_ID_DEV, develop, BASE_URL_DEV)
# - deploy-main.yml (AMPLIFY_APP_ID_PRD, main, BASE_URL_PRD)

name: Deploy {{BRANCH_NAME}}

on:
  push:
    branches: [{{BRANCH_NAME}}]

env:
  AWS_REGION: {{AWS_REGION}}
  AMPLIFY_APP_ID: {{AMPLIFY_APP_ID}}

jobs:
  deploy:
    name: Wait for Amplify Deploy
    runs-on: ubuntu-latest
    environment: {{ENVIRONMENT_NAME}}

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
              --branch-name {{BRANCH_NAME}} \
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

          # Phase 2: Poll for job completion (up to 15 min)
          for i in {1..90}; do
            STATUS=$(aws amplify get-job \
              --app-id ${{ env.AMPLIFY_APP_ID }} \
              --branch-name {{BRANCH_NAME}} \
              --job-id $JOB_ID \
              --query 'job.summary.status' \
              --output text)

            echo "Attempt $i/90: Status = $STATUS"

            if [ "$STATUS" = "SUCCEED" ]; then
              echo "Deployment succeeded!"
              echo "Live at: {{BASE_URL}}"
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
