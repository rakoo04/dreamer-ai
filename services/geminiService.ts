
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDreamImage = async (dreamTranscription: string): Promise<string> => {
  const prompt = `Generate a surrealist and fantastical painting that captures the essence of this dream: "${dreamTranscription}". The image should be rich in symbolism and dream-like logic, but with recognizable figures and scenes. Aim for a visually compelling and imaginative style that is neither overly dark nor pessimistic, reflecting the nuanced emotions of the dream.`;
  
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate dream image.");
  }
};

export const interpretDream = async (dreamTranscription: string): Promise<string> => {
  const model = 'gemini-2.5-pro';
  const systemInstruction = `You are a dream psychologist specializing in Jungian analysis. Analyze the following dream transcript. Provide a structured interpretation in Markdown format.
- Start with a title: '# Dream Interpretation'.
- Create a section: '## Core Emotional Theme' summarizing the primary feeling.
- Create a main section: '## Jungian Analysis'. Under it, create two subsections:
    - '### Key Symbols & Archetypes': List 3-5 major symbols and their potential Jungian meanings.
    - '### Potential Meaning': Offer a holistic view from a Jungian perspective.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Here is the dream: "${dreamTranscription}"`,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Error interpreting dream:", error);
    throw new Error("Failed to interpret dream.");
  }
};

export const createChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
    });
};