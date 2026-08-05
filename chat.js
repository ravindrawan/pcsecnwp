export default async function handler(req, res) {
  // Allow your frontend to talk to this backend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { message } = req.body;

    // Use standard fetch to call Google's Gemini endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        }),
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    
    // Send the response back to your website frontend
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "Server error occurred" });
  }
}