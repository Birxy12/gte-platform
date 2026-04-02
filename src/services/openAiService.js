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
            if (!response.ok) {
                throw new Error(data.error?.message || "Failed to query OpenAI");
            }

            const content = data.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error("OpenAI Moderation Error:", error);
            throw error;
        }
    },

    async askAssistant(userMessages) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("OpenAI API Key is missing. Chatbot functionalities are offline.");
            return "To use the AI Chatbot, please provide a valid `VITE_OPENAI_API_KEY` in your `.env` file.";
        }

        try {
            const formattedMessages = [
                {
                    role: "system",
                    content: "You are Birxy, a friendly, helpful, and highly intelligent AI assistant for the GlobixTech learning platform. Your job is to answer user questions about courses, technology, learning, or general inquiries in a concise but engaging manner."
                },
                ...userMessages.map(m => ({
                    role: m.sender === "bot" ? "assistant" : "user",
                    content: m.text
                }))
            ];

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
                    messages: formattedMessages,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "Failed to get AI response");
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error("AI Assistant Error:", error);
            throw error;
        }
    }
};
