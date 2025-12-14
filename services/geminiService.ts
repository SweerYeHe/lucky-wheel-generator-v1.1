import { GoogleGenAI, Type } from "@google/genai";
import { Prize } from '../types';
import { COLORS } from '../constants';

const apiKey = process.env.API_KEY || '';

// Initialize AI only if key exists, otherwise we'll handle errors gracefully
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generatePrizesFromTheme = async (theme: string): Promise<Prize[]> => {
  if (!ai) {
    throw new Error("API Key is missing. Cannot generate prizes.");
  }

  const prompt = `Generate a list of 8 to 12 fun and creative prizes for a lucky draw based on the theme: "${theme}". 
  Assign a reasonable "weight" (probability factor, integer between 1 and 10) to each prize, where higher weight means higher chance.
  Keep names concise (under 10 characters if possible).
  Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the prize" },
              weight: { type: Type.INTEGER, description: "Weight of the prize (1-10)" }
            },
            required: ["name", "weight"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || '[]');
    
    // Map to our Prize structure
    return rawData.map((item: any, index: number) => ({
      id: Date.now().toString() + index,
      name: item.name,
      weight: item.weight,
      color: COLORS[index % COLORS.length]
    }));

  } catch (error) {
    console.error("Failed to generate prizes:", error);
    throw error;
  }
};
