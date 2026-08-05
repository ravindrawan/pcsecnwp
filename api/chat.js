module.exports = async (req, res) => {
  // Clear any CORS blocks
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Read the incoming message sent by homesi.html
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Error: No prompt message received by the server proxy." });
    }

    // Check if the environment variable exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "Error: GEMINI_API_KEY is missing or undefined in Vercel settings." });
    }

    // Call Google Gemini 2.5 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        }),
      }
    );

    const data = await response.json();

    // If Google sent back an error (like an expired key or bad quota)
    if (data.error) {
      return res.status(200).json({ reply: `Google API Error: ${data.error.message}` });
    }

    // Safely traverse the nested Gemini structure
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      return res.status(200).json({ reply: "Google responded, but returned an empty text layout structure." });
    }
    
    // Success: return the text back to homesi.html
    return res.status(200).json({ reply: reply });

  } catch (error) {
    return res.status(500).json({ reply: `Server Crash Error: ${error.message}` });
  }
};
