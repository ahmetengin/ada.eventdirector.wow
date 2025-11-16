
import { GoogleGenAI, Modality } from "@google/genai";
import type { VoiceSettings } from "../types";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generateSpeech(text: string, settings: VoiceSettings): Promise<string> {
  try {
    let promptPrefix = 'Say with a deep, cinematic, and clear voice';
    if (settings.tone) {
        promptPrefix = `Say in an ${settings.tone} tone, with a deep, cinematic, and clear voice`;
    }
    if (settings.speed !== 'normal') {
        promptPrefix += ` at a ${settings.speed} pace`;
    }

    const fullPrompt = `${promptPrefix}: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: settings.voiceName },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("No audio data received from API.");
    }
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw new Error("Failed to generate speech via Gemini API.");
  }
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateText:", error);
    throw new Error("Failed to generate text via Gemini API.");
  }
}
