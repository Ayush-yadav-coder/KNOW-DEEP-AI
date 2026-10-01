import { GoogleGenAI } from "@google/genai";
import { getClientGeminiApiKey } from "./clientGeminiFallback";

export async function generateTextWithFallback({
  prompt,
  systemInstruction,
  preferredModel = "gemini-3.8-flash",
}: {
  prompt: string;
  systemInstruction?: string;
  preferredModel?: string;
}): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const clientKey = getClientGeminiApiKey();
  if (clientKey) {
    headers["x-gemini-api-key"] = clientKey;
  }

  // 1. Try server endpoint first
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        systemPrompt: systemInstruction,
        model: preferredModel,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.content || data.text || "";
      if (content && typeof content === "string") {
        return content;
      }
    }
  } catch {
    // Failover to client SDK
  }

  // 2. Direct client SDK failover
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const candidateModels = [
        preferredModel,
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
      ];
      for (const m of candidateModels) {
        try {
          const result = await ai.models.generateContent({
            model: m,
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined,
          });
          if (result.text) {
            return result.text;
          }
        } catch {
          // try next candidate
        }
      }
    } catch (sdkErr) {
      console.warn("Client Gemini direct call error:", sdkErr);
    }
  }

  throw new Error("Could not connect to AI engine. Please ensure your Gemini API Key is entered in Settings.");
}
