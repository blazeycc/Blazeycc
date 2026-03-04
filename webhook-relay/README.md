# Gumroad → GitHub License Automation

This webhook relay connects Gumroad sales to automatic license key delivery.

## How It Works

```
Customer buys on Gumroad → Gumroad sends ping → Cloudflare Worker → GitHub Actions → Email with license key
```

## Setup Steps

### 1. Create a GitHub Personal Access Token

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Generate new token (fine-grained)
3. Select repository: `Blazeycc`
4. Permissions: `Contents: Read`, `Actions: Write`
5. Copy the token

### 2. Deploy the Cloudflare Worker

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) (free account)
2. Click **Workers & Pages** → **Create Worker**
3. Paste the code from `cloudflare-worker.js`
4. Click **Settings** → **Variables** → Add:
   - `GITHUB_TOKEN`: Your GitHub token from step 1
   - `GITHUB_OWNER`: `theKennethy`
   - `GITHUB_REPO`: `Blazeycc`
5. Deploy and copy your worker URL (e.g., `https://your-worker.workers.dev`)

### 3. Configure Gumroad Ping

1. Go to [gumroad.com/settings/advanced](https://gumroad.com/settings/advanced)
2. Scroll to **Ping** section
3. Enter your Cloudflare Worker URL
4. Save

### 4. Create the Product on Gumroad

1. Go to [gumroad.com/products](https://gumroad.com/products)
2. Create a new product:
   - **Name**: Blazeycc Pro License
   - **Price**: $5 (or your preferred price - one-time or subscription)
   - **Description**: 
     ```
     🎉 Blazeycc Pro License Key
     
     ✅ No watermark on videos
     ✅ 4K export support
     ✅ Custom watermark with your own text
     ✅ Fast encoding (2x speed)
     ✅ Batch URL recording
     ✅ Scheduled recordings
     ✅ Cloud sync support
     
     Your license key will be emailed automatically after purchase!
     ```

### 5. Test the Setup

Make a test purchase (you can refund it) or use Gumroad's test ping feature.

## Both Platforms Together

You can accept payments from **both** Gumroad and GitHub Sponsors simultaneously:

| Platform | Workflow | Trigger |
|----------|----------|---------|
| GitHub Sponsors | `sponsor-license.yml` | `sponsorship` event |
| Gumroad | `gumroad-license.yml` | `repository_dispatch` from webhook |

Both generate the same format license keys, so users can purchase from either platform.

## Troubleshooting

1. **No email received?** Check GitHub Actions logs for the generated key
2. **Webhook not triggering?** Verify Cloudflare Worker logs in dashboard
3. **GitHub API error?** Make sure your token has correct permissions

## Alternative: Zapier/Make (No Code)

If you prefer no-code, use Zapier or Make:

1. Create a Zap: Gumroad Sale → Webhooks (POST to GitHub API)
2. URL: `https://api.github.com/repos/theKennethy/Blazeycc/dispatches`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body: `{"event_type": "gumroad_sale", "client_payload": {"email": "{{email}}", "full_name": "{{full_name}}", "sale_id": "{{sale_id}}"}}`
