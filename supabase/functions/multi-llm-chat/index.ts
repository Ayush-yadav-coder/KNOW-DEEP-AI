import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, validateMessages, corsHeaders } from "../_shared/auth.ts";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface LLMResponse {
  content: string;
  provider: "lovable" | "openai" | "gemini" | "fallback";
  fallback?: boolean;
  error?: string;
}

async function tryLovableGateway(messages: Message[], apiKey: string): Promise<LLMResponse> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "edge-function",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Lovable AI Gateway error: ${response.status} ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Lovable AI Gateway returned an empty response");
  }

  return {
    content,
    provider: "lovable",
  };
}

async function tryOpenAI(messages: Message[], apiKey: string): Promise<LLMResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: "openai",
  };
}

async function tryGemini(messages: Message[], apiKey: string): Promise<LLMResponse> {
  const geminiMessages = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemMessage = messages.find(m => m.role === "system");
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    provider: "gemini",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await req.json();
    
    // Validate messages input
    const validatedMessages = validateMessages(body.messages, 50, 10000);
    if (validatedMessages instanceof Response) {
      return validatedMessages;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!LOVABLE_API_KEY && !OPENAI_API_KEY && !GEMINI_API_KEY) {
      throw new Error("No API keys configured");
    }

    // Validate optional type parameter
    const validTypes = ["summarize", "homework", "translate", "chat"];
    const type = validTypes.includes(body.type) ? body.type : "chat";

    let systemPrompt = "You are a helpful AI learning assistant for students. Provide clear, educational responses.";
    if (type === "summarize") {
      systemPrompt = "You are an expert summarizer. Create concise, well-structured summaries.";
    } else if (type === "homework") {
      systemPrompt = "You are a patient homework tutor. Guide students step-by-step without giving direct answers.";
    } else if (type === "translate") {
      systemPrompt = "You are a professional translator. Translate accurately while preserving meaning and context.";
    }

    const allMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...validatedMessages as Message[],
    ];

    let result: LLMResponse;

    // Try Lovable AI Gateway first, then user-provided providers as fallbacks.
    if (LOVABLE_API_KEY) {
      try {
        console.log(`User ${authResult.userId} - Attempting Lovable AI Gateway...`);
        result = await tryLovableGateway(allMessages, LOVABLE_API_KEY);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Lovable AI Gateway failed, trying fallback:", err instanceof Error ? err.message : String(err));
      }
    }

    // Try OpenAI next
    if (OPENAI_API_KEY) {
      try {
        console.log(`User ${authResult.userId} - Attempting OpenAI...`);
        result = await tryOpenAI(allMessages, OPENAI_API_KEY);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("OpenAI failed, trying fallback");
      }
    }

    // Fallback to Gemini
    if (GEMINI_API_KEY) {
      try {
        console.log(`User ${authResult.userId} - Attempting Gemini fallback...`);
        result = await tryGemini(allMessages, GEMINI_API_KEY);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Gemini failed");
      }
    }

    throw new Error("All AI providers failed");

  } catch (err) {
    console.error("Multi-LLM error:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        content: "I’m having trouble reaching the AI service right now. Please try again in a moment.",
        provider: "fallback",
        fallback: true,
        error: "AI_SERVICE_UNAVAILABLE",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
