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

    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 4) {
      return new Response(JSON.stringify({ facts: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `You extract durable personal facts from a single user chat message so an assistant can remember them across sessions.
Return STRICT JSON only:
{"facts":[{"category":"identity|preferences|active_projects|learning_style|other","fact":"short third-person fact, <90 chars","importance":1-10}]}
Rules:
- Only include facts that are stable/long-term (name, age, DOB, location, job, school, languages, hobbies, recurring projects, strong likes/dislikes, learning preferences).
- Ignore questions, requests, opinions about external things, transient state, and trivia.
- Rewrite first-person to third-person ("User's name is Ayush", "User is building Know Deep", "User prefers dark mode").
- If nothing durable, return {"facts":[]}.`;

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
          { role: "user", content: text.slice(0, 2000) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      return new Response(JSON.stringify({ facts: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { facts: [] };
    }
    const facts = Array.isArray(parsed.facts) ? parsed.facts.slice(0, 8) : [];
    return new Response(JSON.stringify({ facts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-memory error", e);
    return new Response(JSON.stringify({ facts: [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
