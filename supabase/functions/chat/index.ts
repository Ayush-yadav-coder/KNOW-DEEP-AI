import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateMessages, corsHeaders } from "../_shared/auth.ts";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

async function callOpenAI(messages: Message[], apiKey: string): Promise<ReadableStream> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  return response.body!;
}

async function callGemini(messages: Message[], apiKey: string): Promise<string> {
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
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
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
    const usageResponse = await consumeDailyAiMessage(authResult.userId);
    if (usageResponse) return usageResponse;

    const body = await req.json();
    
    // Validate messages
    const validatedMessages = validateMessages(body.messages, 50, 10000);
    if (validatedMessages instanceof Response) {
      return validatedMessages;
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "No API keys configured. Please add OPENAI_API_KEY or GEMINI_API_KEY." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate type parameter
    const validTypes = ["summarize", "code", "chat"];
    const type = validTypes.includes(body.type) ? body.type : "chat";

    let systemPrompt = `You are Deep AI, an advanced AI assistant that combines the best capabilities of multiple AI systems. You are:
- Intelligent and helpful like ChatGPT
- Fast and accurate like Gemini
- Research-focused and thorough like Perplexity
- Creative and insightful like Claude
- Practical and action-oriented like Microsoft Copilot

Provide clear, accurate, and helpful responses. When appropriate, break down complex topics, provide examples, and offer actionable advice. Be conversational but professional.`;

    if (type === "summarize") {
      systemPrompt = "You are a summarization expert. Provide clear, concise summaries of the content provided. Focus on key points and main ideas.";
    } else if (type === "code") {
      systemPrompt = "You are an expert programmer. Help users write, debug, and understand code. Provide clean, well-commented code examples.";
    }

    const allMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...(validatedMessages as Message[]),
    ];

    console.log(`User ${authResult.userId} - Chat request with type: ${type}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Try Lovable AI Gateway first (free allowance, no rate-limit issues)
    if (LOVABLE_API_KEY) {
      try {
        console.log("Using Lovable AI Gateway...");
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: allMessages,
            stream: true,
          }),
        });
        if (response.ok) {
          return new Response(response.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        console.error("Lovable AI Gateway failed:", response.status, await response.text().catch(() => ""));
      } catch (err) {
        console.error("Lovable AI Gateway error:", err instanceof Error ? err.message : String(err));
      }
    }

    // Fallback to OpenAI
    if (OPENAI_API_KEY) {
      try {
        console.log("Using OpenAI...");
        const stream = await callOpenAI(allMessages, OPENAI_API_KEY);
        return new Response(stream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } catch (err) {
        console.error("OpenAI failed:", err instanceof Error ? err.message : String(err));
      }
    }

    // Fallback to Gemini direct
    if (GEMINI_API_KEY) {
      try {
        console.log("Using Gemini fallback...");
        const content = await callGemini(allMessages, GEMINI_API_KEY);
        const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(sseData, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } catch (err) {
        console.error("Gemini failed:", err instanceof Error ? err.message : String(err));
      }
    }

    throw new Error("All AI providers failed");
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: "Chat service temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
