// /api/resend.js
// Vercel Serverless Function — proxies email sends through Resend.
// The Resend API key (a real secret) lives ONLY here as an
// Environment Variable, never in the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing RESEND_API_KEY. Set it in Vercel -> Settings -> Environment Variables.' });
  }

  const { toEmail, subject, htmlBody, from } = req.body || {};
  if (!toEmail || !subject || !htmlBody) {
    return res.status(400).json({ error: 'toEmail, subject and htmlBody are required' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HireBot AI <' + (from || 'onboarding@resend.dev') + '>',
        to: [toEmail],
        subject,
        html: htmlBody,
      }),
    });

    const data = await resendRes.json();
    return res.status(resendRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy request failed', detail: err.message });
  }
}
