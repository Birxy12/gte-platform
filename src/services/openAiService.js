// OpenAI Integration Service with Multi-Key Pool & Automatic Rotation

const getKeyPool = () => {
    const rawKeys = import.meta.env.VITE_OPENAI_API_KEYS || import.meta.env.VITE_OPENAI_API_KEY || "";
    const keys = rawKeys
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.startsWith("sk-"));
    return keys.length > 0 ? keys : ["sk-abcdef1234567890abcdef1234567890abcdef12"];
};

let currentKeyIndex = 0;

const getActiveKey = () => {
    const pool = getKeyPool();
    return pool[currentKeyIndex % pool.length];
};

const rotateToNextKey = () => {
    const pool = getKeyPool();
    currentKeyIndex = (currentKeyIndex + 1) % pool.length;
    console.warn(`[OpenAI Service] Rotated to API Key #${currentKeyIndex + 1}/${pool.length}`);
    return getActiveKey();
};

/**
 * Execute OpenAI completion with automatic fallback and key rotation
 */
const executeOpenAIWithRotation = async (endpoint, payload, fallbackDirectOptions) => {
    // Direct OpenAI completion with key rotation (via Vite Proxy to bypass CORS)
    const pool = getKeyPool();
    let lastError = null;

    for (let attempts = 0; attempts < Math.min(pool.length, 5); attempts++) {
        const apiKey = getActiveKey();
        try {
            const res = await fetch("/api/openai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: fallbackDirectOptions.model || "gpt-4o-mini",
                    messages: fallbackDirectOptions.messages,
                    temperature: fallbackDirectOptions.temperature ?? 0.7,
                    ...(fallbackDirectOptions.response_format ? { response_format: fallbackDirectOptions.response_format } : {})
                })
            });

            if (res.status === 429 || res.status === 401) {
                console.warn(`[OpenAI Service] Key #${currentKeyIndex + 1} returned status ${res.status}. Rotating key...`);
                rotateToNextKey();
                continue;
            }

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error?.message || "OpenAI completion failed");
            }

            return data;
        } catch (err) {
            lastError = err;
            rotateToNextKey();
        }
    }

    throw lastError || new Error("All OpenAI API keys in the pool failed.");
};

export const openAiService = {
    /**
     * Moderation & Report analysis
     */
    async evaluateReport(reason, details, userMessages = []) {
        try {
            const data = await executeOpenAIWithRotation(
                "/api/moderate",
                { reason, details, userMessages },
                {
                    model: "gpt-4o-mini",
                    temperature: 0.1,
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: "You are an automated moderation AI for a learning platform. Determine if a user should be BANNED/BLOCKED based on reports. Respond with ONLY JSON: { \"decision\": \"ban\" | \"ignore\" | \"review\", \"confidence\": 0-100, \"reasoning\": \"string\" }."
                        },
                        {
                            role: "user",
                            content: `A user was reported for: "${reason}".\nDetails: "${details}".\nRecent messages: ${userMessages.join(", ") || "None"}`
                        }
                    ]
                }
            );

            if (data.decision) return data;
            if (data.choices?.[0]?.message?.content) {
                return JSON.parse(data.choices[0].message.content);
            }
            return { decision: "review", confidence: 50, reasoning: "Automated analysis completed" };
        } catch (error) {
            console.error("Moderation Error:", error);
            throw error;
        }
    },

    /**
     * AI Assistant & Chatbot
     */
    async askAssistant(messages) {
        try {
            const formattedMessages = messages.map(msg => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text || msg.content || ""
            }));

            const data = await executeOpenAIWithRotation(
                "/api/chat",
                { messages },
                {
                    model: "gpt-4o-mini",
                    temperature: 0.7,
                    messages: [
                        {
                            role: "system",
                            content: "You are Birxy, a smart AI learning assistant for the GlobixTech platform. You are helpful, professional, friendly, and concise."
                        },
                        ...formattedMessages
                    ]
                }
            );

            return data.reply || data.choices?.[0]?.message?.content || "No response received";
        } catch (error) {
            console.error("AI Assistant Error:", error);
            throw error;
        }
    },

    /**
     * AI Quiz Parser
     */
    async parseQuizFromText(text) {
        try {
            const data = await executeOpenAIWithRotation(
                "/api/quiz",
                { text },
                {
                    model: "gpt-4o-mini",
                    temperature: 0.2,
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional quiz generator. Convert the following unstructured text into a valid JSON array of quiz questions. Each object must have: 'question' (string), 'options' (array of 4 strings), and 'correct' (integer 0-3). Respond ONLY with the JSON array."
                        },
                        {
                            role: "user",
                            content: `Convert this text into a quiz JSON array:\n\n${text}`
                        }
                    ]
                }
            );

            if (Array.isArray(data)) return data;
            const content = data.choices?.[0]?.message?.content;
            if (content) {
                return JSON.parse(content.replace(/```json|```/g, "").trim());
            }
            return data;
        } catch (error) {
            console.error("AI Quiz Parsing Error:", error);
            throw error;
        }
    }
};
