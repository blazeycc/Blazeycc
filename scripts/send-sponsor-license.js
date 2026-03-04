#!/usr/bin/env node
/**
 * Send License Key to Sponsor
 * 
 * Usage: 
 *   node scripts/send-sponsor-license.js email@example.com
 *   
 * Environment Variables:
 *   LICENSE_SECRET - Your license key secret
 *   SENDGRID_API_KEY - SendGrid API key (optional, will just print key if not set)
 *   FROM_EMAIL - Sender email address (optional)
 */

const crypto = require('crypto');

// Get email from argument or environment
const email = process.argv[2] || process.env.SPONSOR_EMAIL;
const sponsorName = process.argv[3] || process.env.SPONSOR_NAME || email?.split('@')[0] || 'Sponsor';

if (!email) {
    console.error('Usage: node send-sponsor-license.js <email> [name]');
    process.exit(1);
}

// Get secret from environment
const secret = process.env.LICENSE_SECRET || 'blazeycc-pro-2026-change-this-secret';

// Generate license key
function generateLicenseKey(email) {
    const cleanEmail = email.toLowerCase().trim();
    const hash = crypto.createHmac('sha256', secret).update(cleanEmail).digest('hex');
    
    const part1 = hash.slice(0, 4).toUpperCase();
    const part2 = hash.slice(4, 8).toUpperCase();
    const part3 = hash.slice(8, 12).toUpperCase();
    const part4 = hash.slice(12, 16).toUpperCase();
    
    return `${part1}-${part2}-${part3}-${part4}`;
}

const licenseKey = generateLicenseKey(email);

console.log('=========================================');
console.log('BLAZEYCC PRO LICENSE KEY');
console.log('=========================================');
console.log(`Email: ${email}`);
console.log(`Key:   ${licenseKey}`);
console.log('=========================================');

// Send email if SendGrid API key is available
async function sendEmail() {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
        console.log('\nNo SENDGRID_API_KEY set. Please send the key manually or set up email.');
        return;
    }
    
    const fromEmail = process.env.FROM_EMAIL || 'noreply@blazeycc.app';
    
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">🎉 Thank you for sponsoring Blazeycc!</h1>
            <p>Hi ${sponsorName},</p>
            <p>Here is your Blazeycc Pro license key:</p>
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
                'Authorization': `Bearer ${apiKey}`,
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
            console.log('\n✅ License key emailed successfully!');
        } else {
            const error = await response.text();
            console.error('\n❌ Failed to send email:', error);
        }
    } catch (error) {
        console.error('\n❌ Error sending email:', error.message);
    }
}

sendEmail();
