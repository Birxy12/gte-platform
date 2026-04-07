export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;

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
            content: "You are a professional quiz generator. Convert the following unstructured text into a valid JSON array of quiz questions. Each object must have: 'question' (string), 'options' (array of 4 strings), and 'correct' (integer 0-3). Respond ONLY with the JSON array."
          },
          {
            role: "user",
            content: `Convert this text into a quiz JSON array:\n\n${text}`
          }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "OpenAI failed");

    const content = data.choices[0].message.content;
    const jsonContent = JSON.parse(content.replace(/```json|```/g, "").trim());

    res.status(200).json(jsonContent);
  } catch (error) {
    console.error("Quiz API Error:", error);
    res.status(500).json({ error: "Quiz generation task failed" });
  }
}
