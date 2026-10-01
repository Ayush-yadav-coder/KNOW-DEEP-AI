import { GoogleGenAI } from "@google/genai";

export function getClientGeminiApiKey(): string | undefined {
  try {
    const local =
      localStorage.getItem("knowdeep_gemini_api_key") ||
      localStorage.getItem("knowdeep_user_api_key") ||
      localStorage.getItem("gemini_api_key");
    if (local && local.trim()) return local.trim();
  } catch {}

  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_GEMINI_API_KEY) return String(import.meta.env.VITE_GEMINI_API_KEY).trim();
    if (import.meta.env.VITE_GOOGLE_API_KEY) return String(import.meta.env.VITE_GOOGLE_API_KEY).trim();
  }
  return undefined;
}

export async function* streamClientGemini({
  messages,
  systemPrompt,
  preferredModel = "gemini-3.8-flash",
  apiKey,
}: {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  preferredModel?: string;
  apiKey?: string;
}): AsyncGenerator<string, void, unknown> {
  const resolvedKey = apiKey || getClientGeminiApiKey();
  if (!resolvedKey) {
    throw new Error("No Gemini API key available. Please enter your API key in Settings → API Keys.");
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });
  
  // Format contents for Google GenAI SDK
  const contents = messages
    .filter((m) => m.content && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const defaultInstruction =
    "You are Know Deep, a versatile, highly intelligent AI assistant. " +
    "Provide clear, helpful, respectful, and accurate answers.";

  const candidateModels = [
    preferredModel,
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview",
  ];

  let stream: any = null;
  let lastErr: any = null;

  for (const model of candidateModels) {
    try {
      stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt || defaultInstruction,
        },
      });
      if (stream) break;
    } catch (err: any) {
      lastErr = err;
      console.info(`[Client Gemini Fallback] Failover from ${model}:`, err?.message || err);
    }
  }

  if (!stream) {
    throw lastErr || new Error("Direct client connection to Gemini failed.");
  }

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
