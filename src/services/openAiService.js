// Service to analyze user reports using OpenAI
// Note: Ensure VITE_OPENAI_API_KEY is placed in your .env file

export const openAiService = {
    async evaluateReport(reason, details, userMessages = []) {
        try {
            const response = await fetch("/api/moderate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason, details, userMessages })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Moderation failed");
            }
            return await response.json();
        } catch (error) {
            console.error("Moderation Error:", error);
            throw error;
        }
    },

    async askAssistant(messages) {
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || "AI Backend failed");
            }

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error("AI Assistant Error:", error);
            throw error;
        }
    },

    async parseQuizFromText(text) {
        try {
            const response = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Quiz generation failed");
            }
            return await response.json();
        } catch (error) {
            console.error("AI Quiz Parsing Error:", error);
            throw error;
        }
    }
};
