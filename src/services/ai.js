/**
 * Generates an AI image using Pollinations.ai (free tier)
 * @param {string} prompt - The user's event title or specific prompt
 * @returns {Promise<string>} - Base64 data URL of the image
 */
export const generateAiLogo = async (title) => {
    // Construct a rich prompt for better results
    const fullPrompt = `Vector Logo for a party named "${title}", minimalistic, modern, cool, neon colors, sticker style, white background, high quality, vector art, 8k`;

    // Pollinations API URL (Free, No Key)
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=flux&nologo=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Generation failed');

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};
