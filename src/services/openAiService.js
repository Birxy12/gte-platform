// Service to analyze user reports using OpenAI
// Note: Ensure VITE_OPENAI_API_KEY is placed in your .env file

export const openAiService = {
    async evaluateReport(reason, details, userMessages = []) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OpenAI API Key is missing. Please set VITE_OPENAI_API_KEY.");
        }

        try {
            const messagesContext = userMessages.length > 0
                ? `\nRecent messages from this user:\n${userMessages.map(m => `- ${m}`).join("\n")}`
                : "\n(No recent public messages provided)";

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
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
    }
};
