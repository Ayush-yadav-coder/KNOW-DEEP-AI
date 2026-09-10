// Concept X-Ray edge function
// Given a textbook image (base64), returns a structured JSON breakdown
// with N steps, each containing an SVG overlay that visually animates how
// a concept / equation / process works on top of the image.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authenticateRequest, consumeDailyAiMessage } from "../_shared/auth.ts";

interface XRayStep {
  title: string;
  explanation: string;
  /** Inner SVG markup (no <svg> wrapper). Coordinates in 0..100 viewBox. */
  svg: string;
}

interface XRayResult {
  concept: string;
  steps: XRayStep[];
}

const SYSTEM = `You are Concept X-Ray, an educational vision AI that turns flat textbook pages into interactive animated breakdowns.

Given an image of a textbook page (equation, diagram, biology illustration, physics setup, chemistry reaction, or process flow), produce a JSON object with exactly this shape:

{
  "concept": "<one short sentence naming the concept>",
  "steps": [
    { "title": "Step 1: ...", "explanation": "<one or two sentences>", "svg": "<inline SVG primitives>" },
    ...
  ]
}

REQUIREMENTS for svg field:
- 3 to 5 steps total. Each step's svg must be VALID inner SVG markup WITHOUT the outer <svg> tag.
- Use a viewBox coordinate system of 0 0 100 100 (the frontend wraps it).
- Each step must build on the previous: step N should re-include relevant primitives from step N-1 and add the next layer (arrows, highlights, labels, equation re-arrangements, force vectors, atom bonds, etc).
- Use bright accessible colors: #00f0ff (cyan), #ff5cf3 (magenta), #ffd84d (yellow), #5cffb0 (green), #ffffff (white).
- Use stroke-width="0.5" to "1.2", font-size 3 to 5 for labels.
- Wrap labels in <text> elements. Use <circle>, <rect>, <line>, <path>, <polygon>, <g>.
- DO NOT include explanatory comments or markdown fences in the svg.

Return ONLY the JSON object. No markdown, no prose around it.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) return authResult;
    const usageResponse = await consumeDailyAiMessage(authResult.userId);
    if (usageResponse) return usageResponse;

    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUrl = imageBase64.startsWith("data:image/")
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "edge-function",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this textbook image and return the JSON breakdown." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";

    let parsed: XRayResult;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { concept: "Concept", steps: [] };
    }

    if (!parsed.steps || parsed.steps.length === 0) {
      parsed = {
        concept: parsed.concept || "Concept analysis",
        steps: [
          {
            title: "Step 1: Overview",
            explanation: "Could not fully analyze the image. Please try a clearer photo.",
            svg: `<rect x="5" y="5" width="90" height="90" fill="none" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="2 2"/><text x="50" y="52" text-anchor="middle" fill="#00f0ff" font-size="4">Re-scan needed</text>`,
          },
        ],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("concept-xray error", error);
    return new Response(
      JSON.stringify({ error: "Server error", fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
