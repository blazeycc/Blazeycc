# Automated Sponsor License Key System

This guide explains how to automatically send Pro license keys to GitHub Sponsors.

## Overview

When someone sponsors you on GitHub, a webhook is triggered. You can use this webhook to:

1. Generate a unique license key for the sponsor
2. Email the key to them automatically

## Options for Automation

### Option 1: GitHub Actions (Recommended - Free)

Create `.github/workflows/sponsor-webhook.yml`:

```yaml
name: Handle Sponsor Webhook

on:
  sponsor:
    types: [created]

jobs:
  send-license:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Generate and Send License
        env:
          SPONSOR_EMAIL: ${{ github.event.sponsor.email }}
          SPONSOR_NAME: ${{ github.event.sponsor.login }}
          LICENSE_SECRET: ${{ secrets.LICENSE_SECRET }}
          SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
          FROM_EMAIL: "blazeycc@yourdomain.com"
        run: |
          node scripts/send-sponsor-license.js
```

### Option 2: Vercel Serverless Function

Deploy `api/sponsor-webhook.js` to Vercel.

## Setup Steps

### 1. Add GitHub Secrets

Go to your repo → Settings → Secrets → Actions:

- `LICENSE_SECRET`: Your license key secret (same as in generate-key.js)
- `SENDGRID_API_KEY`: Your SendGrid API key for sending emails

### 2. Configure GitHub Sponsors Webhook

1. Go to github.com/sponsors/YOUR_USERNAME/dashboard
2. Click "Webhooks" tab
3. Add webhook URL: `https://your-vercel-app.vercel.app/api/sponsor-webhook`
4. Set secret: (create a random secret)
5. Select events: "Sponsorship created"

### 3. Set Up Email Provider

#### Option A: SendGrid (Recommended)

1. Sign up at sendgrid.com
2. Verify your sender email
3. Get API key

#### Option B: Resend

1. Sign up at resend.com
2. Get API key

## License Key Format

Keys are generated as: `EMAIL-HMAC_HASH`

Example: `john@example.com` → `BXYZ-1234-ABCD-5678`

## Testing

1. Use GitHub's webhook test feature
2. Or manually trigger: `node scripts/send-sponsor-license.js test@example.com`

## Security Notes

- Keep `LICENSE_SECRET` secure and never commit it
- Use environment variables in production
- Rotate secrets periodically
