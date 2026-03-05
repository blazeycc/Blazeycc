/**
 * GitHub Sponsors Webhook Handler + License Generator
 * 
 * Deploy this to Cloudflare Workers (free tier)
 * This receives GitHub Sponsors webhooks and sends license keys via email
 * 
 * Setup:
 * 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this code
 * 3. Add environment variables:
 *    - WEBHOOK_SECRET: Your GitHub webhook secret
 *    - LICENSE_SECRET: Secret for generating license keys
 *    - SENDGRID_API_KEY: (optional) SendGrid API key for auto-emails
 *    - FROM_EMAIL: (optional) Sender email address
 * 4. Deploy and copy the worker URL
 * 5. Go to github.com/sponsors/blazeycc/dashboard → Webhooks → Add webhook URL
 */

export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const payload = await request.json();
      
      // Handle GitHub Sponsors webhook
      const action = payload.action;
      const sponsorship = payload.sponsorship;
      
      if (!sponsorship) {
        return new Response('Not a sponsorship event', { status: 200 });
      }
      
      // Only process new sponsorships
      if (action !== 'created') {
        console.log(`Skipping action: ${action}`);
        return new Response(`Skipping action: ${action}`, { status: 200 });
      }
      
      const sponsor = sponsorship.sponsor;
      const tier = sponsorship.tier;
      
      const sponsorLogin = sponsor.login;
      const sponsorEmail = sponsor.email || `${sponsorLogin}@users.noreply.github.com`;
      const tierName = tier.name;
      const amount = tier.monthly_price_in_dollars;
      
      // Generate license key
      const licenseKey = await generateLicenseKey(sponsorEmail, env.LICENSE_SECRET);
      
      console.log(`✅ New sponsor: ${sponsorLogin} (${tierName} - $${amount}/month)`);
      console.log(`📧 Email: ${sponsorEmail}`);
      console.log(`🔑 License: ${licenseKey}`);
      
      // Send email if SendGrid is configured
      if (env.SENDGRID_API_KEY) {
        await sendLicenseEmail(sponsorEmail, sponsorLogin, licenseKey, tierName, env);
      }
      
      return new Response(JSON.stringify({
        success: true,
        sponsor: sponsorLogin,
        email: sponsorEmail,
        licenseKey: licenseKey,
        tier: tierName
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};

async function generateLicenseKey(email, secret) {
  const cleanEmail = email.toLowerCase().trim();
  const secretKey = secret || 'blazeycc-pro-2026-change-this-secret';
  
  // Use Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(cleanEmail);
  
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const part1 = hashHex.slice(0, 4).toUpperCase();
  const part2 = hashHex.slice(4, 8).toUpperCase();
  const part3 = hashHex.slice(8, 12).toUpperCase();
  const part4 = hashHex.slice(12, 16).toUpperCase();
  
  return `${part1}-${part2}-${part3}-${part4}`;
}

async function sendLicenseEmail(email, sponsorName, licenseKey, tierName, env) {
  const fromEmail = env.FROM_EMAIL || 'noreply@blazey.cc';
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #9333ea;">🎉 Thank you for sponsoring Blazeycc!</h1>
      <p>Hi ${sponsorName},</p>
      <p>Welcome to <strong>${tierName}</strong>! Here is your Blazeycc Pro license key:</p>
      <div style="background: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <code style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${licenseKey}</code>
      </div>
      <h3>How to Activate:</h3>
      <ol>
        <li>Open Blazeycc</li>
        <li>Click the ⚙️ Settings button</li>
        <li>Scroll down to "Premium Features"</li>
        <li>Enter your email: <code>${email}</code></li>
        <li>Enter your license key: <code>${licenseKey}</code></li>
        <li>Click "🔑 Activate License"</li>
      </ol>
      <h3>Your Pro Features:</h3>
      <ul>
        <li>✅ No watermark on videos</li>
        <li>✅ 4K export support</li>
        <li>✅ Batch URL recording</li>
        <li>✅ Scheduled recordings</li>
      </ul>
      <p>If you have any questions, feel free to open an issue on GitHub!</p>
      <p>Thank you for your support! 💜</p>
      <p>- The Blazeycc Team</p>
    </div>
  `;
  
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: '🎉 Your Blazeycc Pro License Key!'
        }],
        from: { email: fromEmail, name: 'Blazeycc' },
        content: [{
          type: 'text/html',
          value: htmlContent
        }]
      })
    });
    
    if (response.ok) {
      console.log(`✅ License key emailed to ${email}`);
    } else {
      const error = await response.text();
      console.error('SendGrid error:', error);
    }
  } catch (error) {
    console.error('Email error:', error.message);
  }
}
