import { fetchOpenAIWithRotation } from './openaiHelper.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;

    const data = await fetchOpenAIWithRotation({
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
    });

    const content = data.choices[0].message.content;
    const jsonContent = JSON.parse(content.replace(/```json|```/g, "").trim());

    res.status(200).json(jsonContent);
  } catch (error) {
    console.error("Quiz API Error:", error);
    res.status(500).json({ error: "Quiz generation task failed", details: error.message });
  }
}
