// Service to analyze user reports using OpenAI
// Note: Ensure VITE_OPENAI_API_KEY is placed in your .env file

const handleJsonResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("AI Backend returned unexpected response format (non-JSON). Contact sysadmin.");
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.details || "AI Task failed");
    }
    return data;
};

export const openAiService = {
    async evaluateReport(reason, details, userMessages = []) {
        try {
            const response = await fetch("/api/moderate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason, details, userMessages })
            });
            return await handleJsonResponse(response);
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
            const data = await handleJsonResponse(response);
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
            return await handleJsonResponse(response);
        } catch (error) {
            console.error("AI Quiz Parsing Error:", error);
            throw error;
        }
    }
};
