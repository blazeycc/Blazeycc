# Automated Sponsor License Key System

This guide explains how to automatically send Pro license keys to GitHub Sponsors.

## Overview

When someone sponsors the blazeycc organization on GitHub, a webhook is triggered to:

1. Generate a unique license key for the sponsor
2. Email the key to them automatically

## Options for Automation

### Option 1: GitHub Actions (Included)

The repo includes `.github/workflows/sponsor-license.yml` which:

1. Triggers automatically on new sponsorships
2. Generates a license key
3. Creates an issue with the key for manual delivery

### Option 2: Cloudflare Worker (Auto-Email)

Deploy `webhook-relay/cloudflare-worker.js` to Cloudflare Workers for automatic email delivery.

See `webhook-relay/README.md` for complete setup instructions.

## Setup Steps

### 1. Add GitHub Secrets

Go to your repo → Settings → Secrets → Actions:

- `LICENSE_SECRET`: Your license key secret (same as in generate-key.js)
- `SENDGRID_API_KEY`: (optional) Your SendGrid API key for sending emails

### 2. Configure GitHub Sponsors Webhook

1. Go to github.com/sponsors/blazeycc/dashboard
2. Click "Webhooks" tab
3. Add webhook URL: Your Cloudflare Worker URL
4. Select events: "Sponsorship created"

### 3. Set Up Email Provider (Optional)

#### SendGrid (Recommended)

1. Sign up at sendgrid.com
2. Verify your sender email/domain
3. Get API key
4. Add to Cloudflare Worker variables

## License Key Format

Keys are generated as: `XXXX-XXXX-XXXX-XXXX`

Example: `BXYZ-1234-ABCD-5678`

## Testing

1. Use GitHub's webhook test feature
2. Or manually trigger: `node scripts/send-sponsor-license.js test@example.com`

## Security Notes

- Keep `LICENSE_SECRET` secure and never commit it
- Use environment variables in production
- Rotate secrets periodically
