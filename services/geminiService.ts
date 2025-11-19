




import { GoogleGenAI, Modality, Type, LiveServerMessage, Blob } from "@google/genai";
// FIX: Add SearchResult and GroundingSource to imports for the new research function.
import type { VoiceSettings, VoiceSpeed, Equipment, LightingCue, VisualizerColorSchemeDetails, EventStatus, ScriptItem, SearchResult, GroundingSource } from "../types";
import { encode } from "../utils";

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

function getSpeedInstruction(speed: VoiceSpeed): string {
    switch (speed) {
        case 'slow': return 'Speak slowly and clearly. ';
        case 'fast': return 'Speak quickly and energetically. ';
        default: return '';
    }
}

function getPitchInstruction(pitch: number): string {
    if (pitch <= -4.0) return 'Use a deep voice. ';
    if (pitch >= 4.0) return 'Use a higher-pitched voice. ';
    return '';
}

export async function generateSpeech(text: string, voiceSettings: VoiceSettings): Promise<string> {
  try {
    const speedInstruction = getSpeedInstruction(voiceSettings.speed);
    const pitchInstruction = getPitchInstruction(voiceSettings.pitch);
    const fullText = `${speedInstruction}${pitchInstruction}${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceSettings.voiceName },
          },
        },
      },
    });
    
    const part = response?.candidates?.[0]?.content?.parts?.[0];

    if (part?.inlineData?.data) {
      if (part.inlineData.data.length < 1000) {
        console.warn(`[geminiService] Received very short audio data (length: ${part.inlineData.data.length}), which might be silent.`);
      }
      return part.inlineData.data;
    } else {
      console.error("No audio data in response:", JSON.stringify(response, null, 2));
      throw new Error("No audio data received from API.");
    }
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(`Failed to generate speech via Gemini API. Reason: ${errorMessage}`);
  }
}

export async function generateTextStream(prompt: string, onChunk: (text: string) => void): Promise<void> {
  try {
    const response = await ai.models.generateContentStream({
      // FIX: Use 'gemini-flash-lite-latest' as per the model naming guidelines.
      model: "gemini-flash-lite-latest",
      contents: prompt,
    });
    for await (const chunk of response) {
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error in generateTextStream:", error);
    throw new Error("Failed to generate text stream via Gemini API.");
  }
}

export async function generateScript(prompt: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { script: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ['script'],
        },
      },
    });
    
    const parsed = JSON.parse(response.text);
    if (!parsed.script || !Array.isArray(parsed.script)) {
        throw new Error("Invalid script format received from API");
    }
    return parsed.script;

  } catch (error) {
    console.error("Error in generateScript:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(`Failed to generate script via Gemini API. Reason: ${errorMessage}`);
  }
}

export async function getTroubleshootingSteps(equipment: Equipment): Promise<string> {
    try {
        const prompt = `You are an expert A/V technician for live events. The equipment '${equipment.name}' (${equipment.type}) has just gone offline. Provide a concise, step-by-step troubleshooting checklist in markdown format that an event director can follow to diagnose the problem quickly.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in getTroubleshootingSteps:", error);
        throw new Error("Failed to get troubleshooting steps from Gemini API.");
    }
}

// FIX: Add researchWithGoogleSearch function to implement research functionality.
export async function researchWithGoogleSearch(prompt: string): Promise<SearchResult> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text ?? "";

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: GroundingSource[] = groundingChunks
            ?.filter((chunk: any) => chunk.web)
            ?.map((chunk: any) => ({
                uri: chunk.web.uri,
                title: chunk.web.title,
            })) || [];

        return { text, sources };
    } catch (error) {
        console.error("Error in researchWithGoogleSearch:", error);
        throw new Error("Failed to get research results from Gemini API.");
    }
}

export async function generateLightingCue(prompt: string, equipment: Equipment[]): Promise<Omit<LightingCue, 'isAiGenerated'>> {
    const equipmentList = equipment.map(e => `- ${e.name} (id: ${e.id}, type: ${e.type})`).join('\n');
    const fullPrompt = `You are a professional lighting designer for the Oscars. The available lighting equipment is:\n${equipmentList}\n\nCreate a lighting cue preset for the following mood or instruction: "${prompt}". Your response must be in JSON format. The name should be creative and descriptive. The settings object keys must be valid equipment IDs from the list.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        settings: {
                            type: Type.OBJECT,
                            properties: equipment.reduce((acc, eq) => {
                                acc[eq.id] = { type: Type.BOOLEAN };
                                return acc;
                            }, {} as Record<string, { type: Type }>)
                        }
                    },
                    required: ['name', 'settings']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error in generateLightingCue:", error);
        throw new Error("Failed to generate lighting cue from Gemini API.");
    }
}

export async function generateVisualizerTheme(prompt: string): Promise<{ name: string, colors: Omit<VisualizerColorSchemeDetails, 'name' | 'isAiGenerated'> }> {
    const fullPrompt = `You are a visual artist and color theorist. Create a 5-color palette for an audio visualizer based on this theme: "${prompt}". The colors should be aesthetically pleasing and work well together as valid hex codes. Provide a creative name for the theme. Your response must be in JSON format.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        colors: {
                            type: Type.OBJECT,
                            properties: {
                                base: { type: Type.STRING, description: "A valid hex color code." },
                                highlight: { type: Type.STRING, description: "A valid hex color code." },
                                shadow: { type: Type.STRING, description: "A valid hex color code." },
                                idleBase: { type: Type.STRING, description: "A valid hex color code." },
                                idleHighlight: { type: Type.STRING, description: "A valid hex color code." }
                            },
                            required: ['base', 'highlight', 'shadow', 'idleBase', 'idleHighlight']
                        }
                    },
                    required: ['name', 'colors']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error in generateVisualizerTheme:", error);
        throw new Error("Failed to generate visualizer theme from Gemini API.");
    }
}

export async function suggestNextStatus(currentStatus: EventStatus, script: ScriptItem[], activeScriptId: number | null): Promise<EventStatus> {
    const activeIndex = activeScriptId !== null ? script.findIndex(item => item.id === activeScriptId) : -1;
    const nextItem = activeIndex !== -1 && activeIndex < script.length - 1 ? script[activeIndex + 1] : (activeScriptId === null && script.length > 0 ? script[0] : null);
    const nextItemText = nextItem ? nextItem.text : "The show is concluding or has not yet started.";
    const statusList = ['Starting Soon', 'Live', 'Intermission', 'Concluded'].join(', ');

    const prompt = `You are an AI assistant for an event director at the Oscars. The current event status is '${currentStatus}'. The script is at item ${activeIndex + 1} of ${script.length}. The upcoming announcement is: "${nextItemText}". Based on this context, suggest the most logical next event status from this list: [${statusList}]. Respond with ONLY the suggested status name and nothing else.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: prompt,
        });
        const suggested = response.text.trim();
        if (['Starting Soon', 'Live', 'Intermission', 'Concluded'].includes(suggested)) {
            return suggested as EventStatus;
        }
        throw new Error("Invalid status suggested by model.");
    } catch(error) {
        console.error("Error in suggestNextStatus:", error);
        throw new Error("Failed to suggest next status from Gemini API.");
    }
}

// --- Image & Video Generation ---
export async function generateImageFromPrompt(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error in generateImageFromPrompt:", error);
        throw new Error("Failed to generate image from prompt using Gemini API.");
    }
}


function getVeoAiInstance() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY! });
}

export async function generateVideoFromImage(base64Image: string, mimeType: string, prompt: string, aspectRatio: '16:9' | '9:16') {
    const veoAi = getVeoAiInstance();
    try {
        let operation = await veoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64Image,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio,
                resolution: '720p',
            }
        });
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
             throw new Error("API key not valid. Please select a valid API key.");
        }
        throw new Error("Failed to start video generation.");
    }
}

export async function getVideosOperationStatus(operation: any) {
    const veoAi = getVeoAiInstance();
    try {
        const updatedOperation = await veoAi.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error polling video status:", error);
         if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
             throw new Error("API key not valid. Please select a valid API key.");
        }
        throw new Error("Failed to get video generation status.");
    }
}


// --- Live Conversation Service ---

// FIX: The callback keys for ai.live.connect must be all lowercase (e.g., onopen, onmessage).
interface ConversationCallbacks { onopen: () => void; onmessage: (message: LiveServerMessage) => Promise<void>; onerror: (e: ErrorEvent) => void; onclose: (e: CloseEvent) => void; }

export function startConversation(voiceSettings: VoiceSettings, callbacks: ConversationCallbacks) {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceSettings.voiceName } } },
            systemInstruction: 'You are ADA, the AI Event Director for the Oscars. Be helpful, concise, and professional. Your voice is the command center\'s voice.',
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
}

export function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}
