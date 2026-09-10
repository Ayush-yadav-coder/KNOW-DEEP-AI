import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, corsHeaders } from "../_shared/auth.ts";

const validSummaryTypes = ["concise", "detailed", "key-points", "executive"];

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
    
    // Validate text input (max 100KB)
    const validatedText = validateString(body.text, "Text", 100000);
    if (validatedText instanceof Response) {
      return validatedText;
    }

    // Validate summary type
    const summaryType = validSummaryTypes.includes(body.summaryType) 
      ? body.summaryType 
      : "concise";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompts: Record<string, string> = {
      concise: "You are a summarization expert. Create a concise summary of the provided text in 2-3 sentences, capturing the main points.",
      detailed: "You are a summarization expert. Create a detailed summary with key points, main arguments, and important details organized in a clear structure with bullet points.",
      "key-points": "You are a summarization expert. Extract and list the key points from the text as bullet points, focusing on the most important information.",
      executive: "You are a business analyst. Create an executive summary suitable for decision-makers, highlighting key insights, recommendations, and action items.",
    };

    console.log(`User ${authResult.userId} - Summarizing text with type: ${summaryType}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[summaryType] },
          { role: "user", content: `Please summarize the following text:\n\n${validatedText}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error summarizing:", error);
    return new Response(
      JSON.stringify({ error: "Failed to summarize text. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
