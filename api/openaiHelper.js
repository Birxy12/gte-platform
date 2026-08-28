export const getServerKeyPool = () => {
    const raw = process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "";
    const keys = raw
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.startsWith("sk-"));
    return keys.length > 0 ? keys : ["sk-abcdef1234567890abcdef1234567890abcdef12"];
};

export const fetchOpenAIWithRotation = async (payload) => {
    const pool = getServerKeyPool();
    let lastError = null;

    for (let i = 0; i < Math.min(pool.length, 5); i++) {
        const key = pool[i];
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 || response.status === 401) {
                console.warn(`[API] Server key #${i + 1} returned status ${response.status}. Trying next key...`);
                continue;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "OpenAI failed");
            }

            return data;
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError || new Error("All OpenAI server keys failed");
};
