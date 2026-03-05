---
title: Lightsail Hosting Setup Guide
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, lightsail, guide, hosting, docker]
parent: ./README.md
---

# Lightsail Hosting Setup Guide

Step-by-step instructions for deploying Docker applications to AWS Lightsail.

## Prerequisites

- AWS Infrastructure component completed
- Doppler project with AWS credentials
- Domain configured (optional but recommended)

---

## Step 1: Create Lightsail Instance

```bash
# Create instance in production account
doppler run --project {project-name} --config prd -- \
  aws lightsail create-instances \
  --instance-names {project-name}-prod \
  --availability-zone eu-west-2a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id small_3_0 \
  --output json
```

**Bundle IDs by size:**
- `nano_3_0` - $3.50/mo (dev only)
- `micro_3_0` - $5/mo
- `small_3_0` - $10/mo (recommended)
- `medium_3_0` - $20/mo

For development environment (if using standard model):

```bash
doppler run --project {project-name} --config dev -- \
  aws lightsail create-instances \
  --instance-names {project-name}-dev \
  --availability-zone eu-west-2a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id nano_3_0 \
  --output json
```

---

## Step 2: Configure Firewall

Open required ports:

```bash
# For each instance
doppler run --project {project-name} --config prd -- \
  aws lightsail open-instance-public-ports \
  --instance-name {project-name}-prod \
  --port-info fromPort=22,toPort=22,protocol=TCP \
  --output json

doppler run --project {project-name} --config prd -- \
  aws lightsail open-instance-public-ports \
  --instance-name {project-name}-prod \
  --port-info fromPort=80,toPort=80,protocol=TCP \
  --output json

doppler run --project {project-name} --config prd -- \
  aws lightsail open-instance-public-ports \
  --instance-name {project-name}-prod \
  --port-info fromPort=443,toPort=443,protocol=TCP \
  --output json
```

---

## Step 3: Get Instance IP and Store in Doppler

```bash
# Get instance details
INSTANCE_IP=$(doppler run --project {project-name} --config prd -- \
  aws lightsail get-instance \
  --instance-name {project-name}-prod \
  --query 'instance.publicIpAddress' \
  --output text)

echo "Instance IP: $INSTANCE_IP"

# Store in Doppler
doppler secrets set LIGHTSAIL_INSTANCE_IP=$INSTANCE_IP \
  --project {project-name} --config prd
```

---

## Step 4: Create SSH Key Pair

```bash
# Create key pair
doppler run --project {project-name} --config prd -- \
  aws lightsail create-key-pair \
  --key-pair-name {project-name}-key \
  --output json > /tmp/{project-name}-key.json

# Extract private key
jq -r '.privateKeyBase64' /tmp/{project-name}-key.json | base64 -d > ~/.ssh/{project-name}.pem
chmod 600 ~/.ssh/{project-name}.pem

# Clean up
rm /tmp/{project-name}-key.json
```

**Attach key to instance:**

Note: Lightsail instances created with the default key. To use custom key, either:
1. Create instance with `--key-pair-name` parameter
2. Or add SSH key manually after instance creation

---

## Step 5: Set Up Instance

SSH into the instance and run initial setup:

```bash
# SSH into instance
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP
```

**On the instance, run:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Create app directory
sudo mkdir -p /opt/{project-name}
sudo chown ubuntu:ubuntu /opt/{project-name}

# Log out and back in for docker group to take effect
exit
```

---

## Step 6: Generate Directus Secrets

```bash
# Generate secrets
DIRECTUS_KEY=$(openssl rand -hex 32)
DIRECTUS_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)

# Store in Doppler
doppler secrets set \
  DIRECTUS_KEY=$DIRECTUS_KEY \
  DIRECTUS_SECRET=$DIRECTUS_SECRET \
  DIRECTUS_ADMIN_EMAIL=admin@{project-name}.example.com \
  DIRECTUS_ADMIN_PASSWORD=$(openssl rand -base64 16) \
  POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  --project {project-name} --config prd
```

---

## Step 7: Deploy Docker Compose

Copy the Docker Compose file to the instance:

```bash
# From your local machine
scp -i ~/.ssh/{project-name}.pem \
  docker-compose.yml \
  ubuntu@$INSTANCE_IP:/opt/{project-name}/
```

**Option A: Install Doppler CLI on instance (Recommended)**

This approach keeps secrets in sync with Doppler automatically:

```bash
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP << 'EOF'
# Install Doppler CLI
curl -sLf https://cli.doppler.com/install.sh | sudo sh

# Login to Doppler
doppler login

# Setup project
cd /opt/{project-name}
doppler setup --project {project-name} --config prd
EOF
```

**Start services with Doppler:**

```bash
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP << 'EOF'
cd /opt/{project-name}
doppler run -- docker compose up -d
EOF
```

**Option B: Export secrets to .env file (Alternative)**

If you prefer not to install Doppler CLI on the instance, export secrets from your local machine:

```bash
# From local machine - get secrets from Doppler and create .env
doppler secrets download --project {project-name} --config prd --no-file --format env > /tmp/{project-name}.env

# Copy to instance
scp -i ~/.ssh/{project-name}.pem /tmp/{project-name}.env ubuntu@$INSTANCE_IP:/opt/{project-name}/.env

# Clean up local copy
rm /tmp/{project-name}.env

# Start services on instance
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP 'cd /opt/{project-name} && docker compose up -d'
```

Note: With this approach, you'll need to re-export secrets whenever they change in Doppler.

---

## Step 8: Configure SSL with Caddy (Recommended)

Caddy provides automatic HTTPS with Let's Encrypt:

```bash
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP << 'EOF'
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy
sudo tee /etc/caddy/Caddyfile << CADDY
{project-name}.gaininsight.global {
    reverse_proxy localhost:8055
}
CADDY

# Restart Caddy
sudo systemctl restart caddy
EOF
```

---

## Step 9: Configure DNS

Add A record pointing to instance IP:

```bash
# Get hosted zone ID for your domain
ZONE_ID=$(doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  aws route53 list-hosted-zones --query "HostedZones[?Name==\`{project-name}.gaininsight.global.\`].Id" --output text' | sed 's|/hostedzone/||')

# Create A record
doppler run --project gi --config prd -- bash -c '
  AWS_ACCESS_KEY_ID=$DOMAIN_ADMIN_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=$DOMAIN_ADMIN_AWS_SECRET_ACCESS_KEY \
  aws route53 change-resource-record-sets \
    --hosted-zone-id '$ZONE_ID' \
    --change-batch '"'"'{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "{project-name}.gaininsight.global",
          "Type": "A",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'$INSTANCE_IP'"}]
        }
      }]
    }'"'"''
```

For dev environment, use `dev.{project-name}.gaininsight.global`.

---

## Step 10: Set Up Deployment Script

Create a deployment script in your project:

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENV=${1:-prod}
INSTANCE_IP=$(doppler secrets get LIGHTSAIL_INSTANCE_IP --project {project-name} --config $ENV --plain)

echo "Deploying to $ENV ($INSTANCE_IP)..."

# SSH and pull latest
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP << 'EOF'
cd /opt/{project-name}
docker compose pull
docker compose up -d --force-recreate
docker system prune -f
EOF

echo "Deployment complete!"
```

---

## Verification

```bash
# Check Directus is running
curl -s https://{project-name}.gaininsight.global/server/health | jq

# Expected: {"status":"ok"}

# Check admin login works
open https://{project-name}.gaininsight.global/admin
```

---

## Backup Strategy

Set up automated backups:

```bash
ssh -i ~/.ssh/{project-name}.pem ubuntu@$INSTANCE_IP << 'EOF'
# Create backup script
cat > /opt/{project-name}/backup.sh << 'BACKUP'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T postgres pg_dump -U directus directus > /opt/{project-name}/backups/backup_$DATE.sql
# Keep last 7 days
find /opt/{project-name}/backups -name "*.sql" -mtime +7 -delete
BACKUP

chmod +x /opt/{project-name}/backup.sh
mkdir -p /opt/{project-name}/backups

# Add to crontab (daily at 3am)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/{project-name}/backup.sh") | crontab -
EOF
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't SSH | Check security group allows port 22, verify key permissions |
| Directus not starting | Check `docker compose logs directus` |
| SSL not working | Verify DNS propagation, check Caddy logs |
| Database connection failed | Verify POSTGRES_PASSWORD in Doppler config |
