---
title: Lightsail Hosting Component
created: 2026-01-25
updated: 2026-01-25
last_checked: 2026-01-25
tags: [template, setup, lightsail, hosting, docker]
parent: ../README.md
---

# Lightsail Hosting Component

Sets up AWS Lightsail for hosting Docker-based applications like Directus.

## What This Provides

- Lightsail instance(s) per environment
- Docker and Docker Compose pre-installed
- Directus + PostgreSQL Docker Compose templates
- Deployment scripts (SSH-based)
- SSL via Let's Encrypt or Lightsail load balancer
- Domain configuration

## Prerequisites

- AWS Infrastructure component installed
- Doppler project configured with AWS credentials
- SSH key pair created (or will create)

## Architecture

```
┌─────────────────────────────────────────┐
│           Lightsail Instance            │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   Directus  │  │   PostgreSQL    │   │
│  │  (port 8055)│  │   (port 5432)   │   │
│  └─────────────┘  └─────────────────┘   │
│         │                               │
│    Docker Compose                       │
└─────────────────────────────────────────┘
            │
      HTTPS (443)
            │
    ┌───────────────┐
    │  Route53 DNS  │
    └───────────────┘
```

## Instance Sizing

| Size | vCPU | RAM | Storage | Monthly | Use Case |
|------|------|-----|---------|---------|----------|
| nano | 1 | 512MB | 20GB | $3.50 | Dev only |
| micro | 1 | 1GB | 40GB | $5 | Small apps |
| small | 1 | 2GB | 60GB | $10 | Production |
| medium | 2 | 4GB | 80GB | $20 | High traffic |

## Files Installed

| File | Purpose |
|------|---------|
| `setup-guide.md` | Step-by-step Lightsail setup |
| `docker-compose.yml` | Base Docker Compose template |
| `docker-compose.directus.yml` | Directus-specific config |
| `scripts/deploy.sh` | SSH deployment script |
| `scripts/setup-instance.sh` | Initial instance setup |
| `scripts/backup.sh` | Database backup script |

## Usage

This component is installed via `/af:setup` after selecting AWS Infrastructure.

```bash
# After AWS Infrastructure setup
# Select "Lightsail" as hosting option
```

## Doppler Variables Added

| Variable | Purpose |
|----------|---------|
| `LIGHTSAIL_INSTANCE_IP` | Instance public IP |
| `DIRECTUS_KEY` | Directus security key |
| `DIRECTUS_SECRET` | Directus security secret |
| `DIRECTUS_ADMIN_EMAIL` | Admin user email |
| `DIRECTUS_ADMIN_PASSWORD` | Admin user password |
| `POSTGRES_PASSWORD` | PostgreSQL password |
