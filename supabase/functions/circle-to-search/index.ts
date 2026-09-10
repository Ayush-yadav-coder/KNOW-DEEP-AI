import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-for, cf-ipcountry",
};

function detectCountry(req: Request, locale?: string, timezone?: string): string {
  // 1. CF/Vercel-style geo header
  const cf = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country");
  if (cf && cf.length === 2) return cf.toUpperCase();
  // 2. Locale tag like en-IN, hi-IN
  if (locale) {
    const m = locale.match(/[-_]([A-Z]{2})/i);
    if (m) return m[1].toUpperCase();
  }
  // 3. Timezone hint
  if (timezone && /Asia\/(Kolkata|Calcutta)/i.test(timezone)) return "IN";
  return "US";
}

function currencyForCountry(country: string): { code: string; symbol: string } {
  switch (country) {
    case "IN": return { code: "INR", symbol: "₹" };
    case "GB": return { code: "GBP", symbol: "£" };
    case "EU": case "FR": case "DE": case "IT": case "ES": case "NL": return { code: "EUR", symbol: "€" };
    case "JP": return { code: "JPY", symbol: "¥" };
    case "AU": return { code: "AUD", symbol: "A$" };
    case "CA": return { code: "CAD", symbol: "C$" };
    default: return { code: "USD", symbol: "$" };
  }
}

function platformsForCountry(country: string): string[] {
  if (country === "IN") return ["Amazon.in", "Flipkart", "Myntra", "Croma"];
  if (country === "GB") return ["Amazon UK", "Argos", "Currys", "eBay UK"];
  if (country === "JP") return ["Amazon JP", "Rakuten", "Yahoo Shopping", "Mercari"];
  return ["Amazon", "Walmart", "Best Buy", "eBay"];
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

    const { image, mode, locale, timezone } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "image required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const country = detectCountry(req, locale, timezone);
    const cur = currencyForCountry(country);
    const platforms = platformsForCountry(country);

    const systemPrompt = `You are a Spatial Vision AI analyzing a circled region from a live camera feed.
The user is located in ${country}. Use ${cur.code} (${cur.symbol}) as the PRIMARY currency for ALL price values.
Use these local marketplaces when generating priceComparison: ${platforms.join(", ")}.

Return STRICT JSON only (no markdown fences) with this exact shape:
{
  "type": "product" | "text" | "general",
  "title": "<short label of what is seen>",
  "summary": "<expert 2-3 sentence product summary with features and sentiment>",
  "pros": ["pro1","pro2","pro3"],
  "cons": ["con1","con2"],
  "currency": "${cur.code}",
  "priceComparison": [
    {"platform": "${platforms[0]}", "price": "${cur.symbol}XX,XXX", "bestDeal": true, "url": "https://${platforms[0].toLowerCase().replace(/\\s|\\./g,'')}.com/s?k=<query>"},
    {"platform": "${platforms[1]}", "price": "${cur.symbol}XX,XXX", "bestDeal": false, "url": "https://..."},
    {"platform": "${platforms[2]}", "price": "${cur.symbol}XX,XXX", "bestDeal": false, "url": "https://..."},
    {"platform": "${platforms[3]}", "price": "${cur.symbol}XX,XXX", "bestDeal": false, "url": "https://..."}
  ],
  "ocrText": "<extracted text if any>",
  "translation": "<English translation if foreign text>",
  "academicBreakdown": "<bulleted explanation if a textbook problem/equation>",
  "followUps": ["question 1", "question 2", "question 3", "question 4"]
}

Rules:
- If a physical product is detected, type="product". Generate realistic ESTIMATED prices in ${cur.symbol} (${cur.code}). Mark the cheapest as bestDeal:true. Always include a plausible search URL for each platform using the product name as the query.
- Provide pros and cons (2-4 each) for products. Omit for non-products.
- If text/equation/code is detected, type="text" with ocrText filled. Add translation only if not English. Add academicBreakdown only if it's an academic problem.
- Always include exactly 4 short, contextual followUps.
- Return ONLY valid JSON, no prose, no fences.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Mode: ${mode ?? "auto"}. Country: ${country}. Currency: ${cur.code}. Analyze the circled region and respond with strict JSON.` },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errTxt = await response.text().catch(() => "");
      console.error("Gateway error", response.status, errTxt);
      return new Response(JSON.stringify({ error: "AI vision failed", status: response.status }), {
        status: response.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        type: "general",
        title: "Analysis",
        summary: cleaned.slice(0, 280),
        followUps: ["Tell me more about this", "How does this work?", "What are similar items?", "Explain in simple terms"],
      };
    }
    parsed.currency = cur.code;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("circle-to-search error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
