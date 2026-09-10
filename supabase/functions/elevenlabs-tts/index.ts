import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, corsHeaders } from "../_shared/auth.ts";

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

    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb", feature = "other" } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof voiceId !== "string" || !/^[A-Za-z0-9]{20,}$/.test(voiceId)) {
      return new Response(
        JSON.stringify({ error: "Invalid voice ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use different keys based on feature type
    // ELEVENLABS_API_KEY_1: for live chat, AI chat, web search
    // ELEVENLABS_API_KEY: for all other features
    const primaryFeatures = ["live-chat", "ai-chat", "web-search"];
    const ELEVENLABS_API_KEY = primaryFeatures.includes(feature)
      ? (Deno.env.get("ELEVENLABS_API_KEY_1") || Deno.env.get("ELEVENLABS_API_KEY"))
      : (Deno.env.get("ELEVENLABS_API_KEY") || Deno.env.get("ELEVENLABS_API_KEY_1"));

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${authResult.userId} - Generating TTS with ElevenLabs`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.slice(0, 5000), // Limit text length
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      
      // Return fallback signal for client to use browser speech synthesis
      return new Response(
        JSON.stringify({ 
          error: "ElevenLabs unavailable", 
          useFallback: true,
          text: text.slice(0, 5000) // Return text for browser TTS fallback
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Return audio as base64 for easier client handling
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: "Text-to-speech service temporarily unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
