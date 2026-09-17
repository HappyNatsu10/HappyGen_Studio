export default async function handler(req, res) {
  // 1. Enable CORS for the mobile app/web app
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 3. Ensure API Key exists in Vercel Environment Variables
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the Vercel server.' });
  }

  try {
    const { sourceImage } = req.body;
    if (!sourceImage) {
      return res.status(400).json({ error: 'Missing sourceImage in request body.' });
    }

    // Extract base64 and mimetype
    const base64Image = sourceImage.split(',')[1] || sourceImage;
    const mimeType = sourceImage.includes(';') ? sourceImage.split(';')[0].split(':')[1] : 'image/png';
    
    const payload = {
      contents: [{
        parts: [
          { text: "Describe this image in extreme detail, focusing on the character's identity, physical appearance, clothing, the background environment, lighting, and the art style. Write it as a single cohesive paragraph." },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }]
    };

    // Forward to Google Gemini API
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey
      },
      body: JSON.stringify(payload)
    });
    
    const data = await geminiRes.json();
    
    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data.error?.message || 'Error from Gemini API' });
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No caption returned from Gemini.' });
    }
    
    return res.status(200).json({ caption: text.trim() });
  } catch (err) {
    console.error('Vercel Gemini Proxy Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
