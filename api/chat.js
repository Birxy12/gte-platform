export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const formattedMessages = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Birxy, a smart AI learning assistant for the GlobixTech platform. You are helpful, professional, and friendly." },
          ...formattedMessages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return res.status(response.status).json({ error: "OpenAI failed", details: data.error?.message });
    }

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("Vercel AI Handler Error:", error);
    res.status(500).json({ error: "Mission failed: Internal Server Error" });
  }
}
