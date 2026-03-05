# GitHub Sponsors → License Automation

This webhook relay automatically sends license keys to GitHub Sponsors.

## How It Works

```
Sponsor on GitHub → GitHub sends webhook → Cloudflare Worker → Email with license key
```

## Setup Steps

### 1. Deploy the Cloudflare Worker

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) (free account)
2. Click **Workers & Pages** → **Create Worker**
3. Paste the code from `cloudflare-worker.js`
4. Click **Settings** → **Variables** → Add:
   - `LICENSE_SECRET`: Your license key secret (same as generate-key.js)
   - `SENDGRID_API_KEY`: (optional) SendGrid API key for auto-emails
   - `FROM_EMAIL`: (optional) Your sender email address
5. Deploy and copy your worker URL (e.g., `https://your-worker.workers.dev`)

### 2. Configure GitHub Sponsors Webhook

1. Go to [github.com/sponsors/blazeycc/dashboard](https://github.com/sponsors/blazeycc/dashboard)
2. Click **Webhooks** tab
3. Click **Add webhook**
4. Enter your Cloudflare Worker URL
5. Create a webhook secret and add it as `WEBHOOK_SECRET` env var in your worker
6. Select event: **Sponsorship** → **created**
7. Save

### 3. Set Up Email (Optional)

For automatic email delivery:

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender email/domain
3. Get your API key
4. Add `SENDGRID_API_KEY` to your Cloudflare Worker variables

If not configured, licenses will be logged and available via GitHub Actions workflow.

### 4. Create Sponsor Tiers

1. Go to [github.com/sponsors/blazeycc/dashboard](https://github.com/sponsors/blazeycc/dashboard)
2. Create tier(s):
   - **Blazeycc Pro** ($7/month):
     ```
     🎉 Blazeycc Pro License
     
     ✅ No watermark on videos
     ✅ 4K export support
     ✅ Batch URL recording
     ✅ Scheduled recordings
     
     Your license key will be emailed automatically!
     ```

### 5. Test the Setup

1. Use GitHub's webhook test feature in the dashboard
2. Or sponsor yourself with a test tier
3. Check Cloudflare Worker logs for the license key

## Alternative: GitHub Actions Only

If you prefer not to use Cloudflare Workers, the repo includes a GitHub Actions workflow (`.github/workflows/sponsor-license.yml`) that:

1. Triggers on new sponsorships
2. Generates a license key
3. Creates an issue with the key for you to send manually

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `LICENSE_SECRET` | Yes | Secret for HMAC license generation |
| `SENDGRID_API_KEY` | No | SendGrid API key for auto-emails |
| `FROM_EMAIL` | No | Sender email (default: noreply@blazey.cc) |
| `WEBHOOK_SECRET` | No | GitHub webhook secret for verification |

## Troubleshooting

- **No email received**: Check SendGrid API key and sender verification
- **Worker not receiving events**: Verify webhook URL and event selection
- **Invalid license**: Ensure LICENSE_SECRET matches between worker and app
