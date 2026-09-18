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
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
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

    // 1. Discover available models dynamically
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    const modelsData = await modelsRes.json();
    
    if (!modelsRes.ok) {
      return res.status(modelsRes.status).json({ error: `API Key Error: ${modelsData.error?.message || 'Invalid API Key'}` });
    }

    const availableModels = modelsData.models || [];
    
    // We want a model that supports generateContent. Preference: 1.5-flash, then 1.5-pro, then gemini-pro-vision
    let selectedModel = null;
    const modelPreferences = ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-pro-vision'];
    
    for (const pref of modelPreferences) {
      const match = availableModels.find(m => m.name === pref && m.supportedGenerationMethods?.includes('generateContent'));
      if (match) {
        selectedModel = match.name;
        break;
      }
    }
    
    // Fallback: just find ANY model that has "gemini" and supports generateContent
    if (!selectedModel) {
      const fallback = availableModels.find(m => m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'));
      if (fallback) {
        selectedModel = fallback.name;
      } else {
        return res.status(500).json({ error: 'Your API Key does not have access to any Gemini vision models for generateContent.' });
      }
    }

    // 2. Forward to Google Gemini API using the dynamically discovered model
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${selectedModel}:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
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
