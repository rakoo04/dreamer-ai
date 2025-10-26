
import { GoogleGenAI, Chat, Modality } from "@google/genai";

export const generateDreamImage = async (apiKey: string, dreamTranscription: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Generate a surrealist and fantastical painting in a 16:9 widescreen aspect ratio that captures the essence of this dream: "${dreamTranscription}". The image should be rich in symbolism and dream-like logic, but with recognizable figures and scenes. Aim for a visually compelling and imaginative style that is neither overly dark nor pessimistic, reflecting the nuanced emotions of the dream.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      throw new Error(`Image generation failed. Reason: ${finishReason}. Please check safety settings or try a different prompt.`);
    }

    throw new Error("No image data was returned from the API.");
  } catch (error) {
    console.error("Error generating image:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate dream image. ${message}`);
  }
};

export const interpretDream = async (apiKey: string, dreamTranscription: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
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

export const generateInterpretationAudio = async (apiKey: string, textToSpeak: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, soothing voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data was returned from the API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating audio:", error);
        throw new Error("Failed to generate audio for interpretation.");
    }
};


export const createChat = (apiKey: string, systemInstruction: string): Chat => {
    const ai = new GoogleGenAI({ apiKey });
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction
        }
    });
};