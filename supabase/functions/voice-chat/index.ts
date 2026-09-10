import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, validateMessages, corsHeaders } from "../_shared/auth.ts";

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
    
    // Validate message
    const validatedMessage = validateString(body.message, "Message", 2000);
    if (validatedMessage instanceof Response) {
      return validatedMessage;
    }

    // Validate optional conversation history
    let validatedHistory: { role: string; content: string }[] = [];
    if (body.conversationHistory && Array.isArray(body.conversationHistory)) {
      const historyResult = validateMessages(body.conversationHistory, 20, 2000);
      if (historyResult instanceof Response) {
        return historyResult;
      }
      validatedHistory = historyResult;
    }

    console.log(`User ${authResult.userId} - Voice chat message`);

    // Try Lovable API first (more reliable)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    const systemPrompt = `You are a friendly voice assistant like Alexa or Siri. Keep responses:
1. Conversational and natural
2. Concise (1-3 sentences for simple queries, longer for complex ones)
3. Helpful and engaging
4. Use simple language that sounds good when spoken aloud
5. Avoid special characters, bullet points, or formatting that doesn't translate to speech

Current date and time: ${new Date().toLocaleString()}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...validatedHistory.map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: validatedMessage }
    ];

    let response: Response | null = null;
    let data: any = null;

    // Try Lovable API first
    if (LOVABLE_API_KEY) {
      try {
        response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages,
          }),
        });

        if (response.ok) {
          data = await response.json();
        } else {
          console.log('Lovable API failed, trying OpenAI...');
        }
      } catch (error) {
        console.error('Lovable API error:', error);
      }
    }

    // Fallback to OpenAI
    if (!data && OPENAI_API_KEY) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
          }),
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Voice assistant temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assistantResponse = data.choices?.[0]?.message?.content;

    if (!assistantResponse) {
      return new Response(
        JSON.stringify({ error: "No response generated. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: "Voice chat service temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
