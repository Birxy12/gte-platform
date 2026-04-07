// Service to analyze user reports using OpenAI
// Note: Ensure VITE_OPENAI_API_KEY is placed in your .env file

export const openAiService = {
    async evaluateReport(reason, details, userMessages = []) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("OpenAI API Key is missing. Please set VITE_OPENAI_API_KEY.");
            return { decision: "ignore", confidence: 100, reasoning: "Evaluation skipped due to missing API key." };
        }

        try {
            const messagesContext = userMessages.length > 0
                ? `\nRecent messages from this user:\n${userMessages.map(m => `- ${m}`).join("\n")}`
                : "\n(No recent public messages provided)";

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "GTE Platform"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an automated moderation AI for a learning platform. Your job is to read a report against a user and determine if they should be BANNED/BLOCKED. You must respond with a JSON object: { \"decision\": \"ban\" | \"ignore\" | \"review\", \"confidence\": 0-100, \"reasoning\": \"string\" }."
                        },
                        {
                            role: "user",
                            content: `A user was reported for the following reason: "${reason}".\nDetails provided by reporter: "${details}".${messagesContext}`
                        }
                    ],
                    temperature: 0.1
                })
            });

            const data = await response.json();
            if (response.status === 401) {
                throw new Error("OpenRouter Authorization Failed: The API key provided in .env is invalid or expired. Please verify VITE_OPENAI_API_KEY.");
            }
            if (!response.ok) {
                throw new Error(data.error?.message || "Failed to query OpenAI via OpenRouter");
            }

            const content = data.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error("OpenAI Moderation Error:", error);
            throw error;
        }
    },

    async askAssistant(messages) {
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || "AI Backend failed to respond");
            }

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error("AI Assistant Error:", error);
            throw error;
        }
    },

    async parseQuizFromText(text) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API Key is missing.");

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "GTE Platform"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
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

            if (!response.ok) throw new Error("AI Parsing Failed");
            const data = await response.json();
            const content = data.choices[0].message.content;
            return JSON.parse(content.replace(/```json|```/g, "").trim());
        } catch (error) {
            console.error("AI Quiz Parsing Error:", error);
            throw error;
        }
    }
};
