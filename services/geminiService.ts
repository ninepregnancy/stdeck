import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateDescription = async (name: string, category: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return "A revolutionary new startup transforming the industry.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Write a compelling, punchy, single-sentence tagline (max 20 words) for a startup called "${name}" in the "${category}" industry. Do not use quotes.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Innovating the future with cutting-edge technology.";
  }
};
