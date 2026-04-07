export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { reason, details, userMessages } = req.body;

    const messagesContext = userMessages?.length > 0
        ? `\nRecent messages from this user:\n${userMessages.map(m => `- ${m}`).join("\n")}`
        : "\n(No recent public messages provided)";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an automated moderation AI for a learning platform. Determine if a user should be BANNED/BLOCKED based on reports. Respond with ONLY JSON: { \"decision\": \"ban\" | \"ignore\" | \"review\", \"confidence\": 0-100, \"reasoning\": \"string\" }."
          },
          {
            role: "user",
            content: `A user was reported for: "${reason}".\nDetails: "${details}".${messagesContext}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "OpenAI failed");

    res.status(200).json(JSON.parse(data.choices[0].message.content));
  } catch (error) {
    console.error("Moderation API Error:", error);
    res.status(500).json({ error: "Moderation task failed" });
  }
}
