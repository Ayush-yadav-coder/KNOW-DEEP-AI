import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { authenticateRequest } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) return authResult;

    const { userMessage, assistantMessage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `Generate 3 short, highly-specific follow-up questions a curious user would naturally ask AFTER reading the assistant's reply.
Return STRICT JSON only: {"questions":["...","...","..."]}
Rules:
- Each question must reference concrete entities/concepts from the assistant's reply (not generic "tell me more").
- 4-10 words each, end with "?".
- Distinct angles (deeper, broader, applied).`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `User asked: ${String(userMessage || "").slice(0, 600)}\n\nAssistant replied: ${String(assistantMessage || "").slice(0, 2000)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      return new Response(JSON.stringify({ questions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { questions: [] }; }
    const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 3) : [];
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ questions: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
