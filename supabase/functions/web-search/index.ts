import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
    
    // Validate query
    const validatedQuery = validateString(body.query, "Query", 1000);
    if (validatedQuery instanceof Response) {
      return validatedQuery;
    }

    console.log(`User ${authResult.userId} - Searching for: ${validatedQuery}`);

    // Try dedicated web search OpenAI key first, fallback to main key
    const OPENAI_API_KEY_WEBSEARCH = Deno.env.get('OPENAI_API_KEY_WEBSEARCH');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    let apiKey = OPENAI_API_KEY_WEBSEARCH || OPENAI_API_KEY;
    let useOpenAI = !!apiKey;

    const systemPrompt = `You are an advanced AI search assistant like Perplexity. When answering questions:
1. Provide comprehensive, well-researched answers
2. Structure your response with clear sections using markdown
3. Include relevant facts, statistics, and details
4. Always include a "Sources" section at the end with 3-5 relevant, realistic source citations in this format:
   - [Source Title](url) - Brief description

Format your response as JSON with this structure:
{
  "answer": "Your detailed markdown answer here",
  "sources": [
    {"title": "Source Title", "url": "https://example.com/article", "description": "Brief description of the source"}
  ],
  "relatedQuestions": ["Related question 1?", "Related question 2?", "Related question 3?"]
}

Current date: ${new Date().toISOString().split('T')[0]}`;

    // Try OpenAI first
    if (useOpenAI) {
      console.log('Using OpenAI for web search');
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: validatedQuery }
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (openAIResponse.ok) {
        const data = await openAIResponse.json();
        let result = data.choices?.[0]?.message?.content || "";
        
        try {
          result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(result);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch {
          return new Response(JSON.stringify({
            answer: result,
            sources: [],
            relatedQuestions: []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        console.log('OpenAI failed, falling back to Gemini');
      }
    }

    // Fallback to Lovable AI Gateway (Gemini) or direct Gemini key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    let response: Response;
    let usingGateway = false;
    if (LOVABLE_API_KEY) {
      console.log('Using Lovable AI Gateway for web search');
      usingGateway = true;
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: validatedQuery },
          ],
        }),
      });
    } else if (GEMINI_API_KEY) {
      console.log('Using Gemini direct for web search');
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser query: ${validatedQuery}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });
    } else {
      return new Response(JSON.stringify({ error: "No API keys configured for web search." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fallback API error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: "Search failed. Please try again." }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let result: string = usingGateway
      ? (data.choices?.[0]?.message?.content || "")
      : (data.candidates?.[0]?.content?.parts?.[0]?.text || "");

    try {
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(result);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ answer: result, sources: [], relatedQuestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: "Web search service temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
