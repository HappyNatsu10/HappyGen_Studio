const fs = require('fs');

async function run() {
  const payload = { sourceImage: "data:image/png;base64," + "A".repeat(3 * 1024 * 1024) }; // 3MB base64
  
  try {
    const res = await fetch("https://happy-gen-studio.vercel.app/api/gemini", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

run();
