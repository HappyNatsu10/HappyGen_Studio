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
          { text: "Analyze this image and write a highly detailed text-to-image prompt in a booru-style tag format. Output ONLY a continuous string of comma-separated tags (at least 30-40 tags), with absolutely no conversational text. If you are highly confident that the image depicts a specific known character from anime, manga, video games, or pop culture, identify them by their name and franchise as the first tags (e.g., '(1girl:1.3), (Hatsune Miku:1.5), (Vocaloid:1.2)'). If you are not confident, do NOT guess the character name; simply use tags to describe their appearance (e.g. '1girl, original character'). Use 'priority style' weighting syntax (e.g. (tag:1.2) or (tag:1.5)) ONLY on the 3 to 5 most important core subjects (like the character's name or the primary concept). DO NOT apply weights to every single tag. Exhaustively describe the character's physical features, specific clothing items, accessories, pose, facial expression, background environment, lighting, and art style. Always end the prompt with these exact emphasized quality tags: '(masterpiece:1.2), (best quality:1.2), (highly detailed:1.1), intricate details, sharp focus'." },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    // 1. Discover available models dynamically
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    const modelsData = await modelsRes.json();
    
    if (!modelsRes.ok) {
      return res.status(modelsRes.status).json({ error: `API Key Error: ${modelsData.error?.message || 'Invalid API Key'}` });
    }

    const availableModels = modelsData.models || [];
    
    // We want a model that supports generateContent. Preference: 3.6-flash (current), then older versions.
    let selectedModel = null;
    const modelPreferences = [
      'models/gemini-3.6-flash', 
      'models/gemini-3.5-flash',
      'models/gemini-2.5-flash',
      'models/gemini-1.5-flash'
    ];
    
    for (const pref of modelPreferences) {
      const match = availableModels.find(m => m.name === pref && m.supportedGenerationMethods?.includes('generateContent'));
      if (match) {
        selectedModel = match.name;
        break;
      }
    }
    
    // Fallback: just find the NEWEST model that has "gemini" and "flash", and supports generateContent
    if (!selectedModel) {
      const fallback = availableModels
        .filter(m => m.name.includes('gemini') && m.name.includes('flash') && m.supportedGenerationMethods?.includes('generateContent'))
        .sort((a, b) => b.name.localeCompare(a.name))[0]; // Try to get the highest version number
        
      if (fallback) {
        selectedModel = fallback.name;
      } else {
        // Last resort: literally anything with gemini
        const lastResort = availableModels.find(m => m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'));
        if (lastResort) {
          selectedModel = lastResort.name;
        } else {
          return res.status(500).json({ error: 'Your API Key does not have access to any Gemini vision models for generateContent.' });
        }
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
