import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateMessages, corsHeaders } from "../_shared/auth.ts";

const systemPrompt = `You are Know Deep, an advanced AI assistant combining the best of multiple AI systems. You are:
- Intelligent and helpful like ChatGPT
- Fast and accurate like Gemini  
- Research-focused and thorough like Perplexity
- Creative and insightful like Claude

When responding:
- Use **bold** for key terms, dates, and important names
- Break down complex topics with clear structure
- Provide actionable insights and examples
- Be conversational but professional`;

async function callProvider(url: string, headers: Record<string, string>, body: unknown) {
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) return authResult;
    const usageResponse = await consumeDailyAiMessage(authResult.userId);
    if (usageResponse) return usageResponse;

    const body = await req.json().catch(() => ({}));
    const validated = validateMessages(body?.messages, 50, 10000);
    if (validated instanceof Response) return validated;

    const messages = [{ role: "system", content: systemPrompt }, ...validated];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // Provider chain: Lovable AI Gateway first (free allowance), then OpenAI fallback
    const providers: Array<{ name: string; url: string; headers: Record<string, string>; model: string }> = [];

    if (LOVABLE_API_KEY) {
      providers.push({
        name: "lovable-gemini",
        url: "https://ai.gateway.lovable.dev/v1/chat/completions",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
        model: "google/gemini-2.5-flash",
      });
      providers.push({
        name: "lovable-gemini-lite",
        url: "https://ai.gateway.lovable.dev/v1/chat/completions",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
        model: "google/gemini-2.5-flash-lite",
      });
    }
    if (OPENAI_API_KEY) {
      providers.push({
        name: "openai",
        url: "https://api.openai.com/v1/chat/completions",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        model: "gpt-4o-mini",
      });
    }

    if (providers.length === 0) {
      return new Response(JSON.stringify({ error: "No AI provider configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let lastErrStatus = 0;
    let lastErrText = "";

    for (const p of providers) {
      const response = await callProvider(p.url, p.headers, {
        model: p.model,
        messages,
        stream: true,
      });

      if (response.ok) {
        console.log(`stream-chat: using ${p.name}`);
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      lastErrStatus = response.status;
      lastErrText = await response.text().catch(() => "");
      console.error(`${p.name} failed ${response.status}: ${lastErrText.slice(0, 200)}`);

      // Try next provider on rate limit / payment / server errors
      if (response.status === 429 || response.status === 402 || response.status >= 500) {
        continue;
      }
      // Other client errors: stop, surface them
      break;
    }

    if (lastErrStatus === 429) {
      return new Response(JSON.stringify({ error: "All AI providers are rate-limited. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (lastErrStatus === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in your workspace settings." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stream chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
