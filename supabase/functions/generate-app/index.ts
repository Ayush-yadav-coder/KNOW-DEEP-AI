import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, validateArray, corsHeaders } from "../_shared/auth.ts";

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
    
    // Validate description
    const validatedDescription = validateString(body.description, "Description", 5000);
    if (validatedDescription instanceof Response) {
      return validatedDescription;
    }

    // Validate optional features array
    let validatedFeatures: string[] = [];
    if (body.features && Array.isArray(body.features)) {
      const featuresResult = validateArray(body.features, "Features", 20, 200);
      if (featuresResult instanceof Response) {
        return featuresResult;
      }
      validatedFeatures = featuresResult;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("API key not configured");
    }

    console.log(`User ${authResult.userId} - Generating app`);

    const featuresText = validatedFeatures.length > 0 
      ? `\n\nRequired features:\n${validatedFeatures.map((f: string) => `- ${f}`).join('\n')}` 
      : '';

    const systemPrompt = `You are an expert full-stack developer. Generate complete, working React + TypeScript code.

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no explanation, no code blocks.

The JSON must have this exact structure:
{
  "appName": "App Name Here",
  "description": "Brief description",
  "files": [
    {
      "path": "src/App.tsx",
      "content": "// Complete React code here",
      "language": "tsx"
    }
  ],
  "supabaseSchema": "-- SQL schema here",
  "edgeFunctions": [],
  "setupInstructions": ["npm install", "npm run dev"]
}

Requirements:
1. Use React 18 with TypeScript
2. Use Tailwind CSS for styling
3. Create at least 3-5 files: App.tsx, components, types
4. Include proper imports and exports
5. Make it functional and runnable
6. Use modern React patterns (hooks, functional components)`;

    const userPrompt = `Create a complete web app: ${validatedDescription}${featuresText}

Remember: Respond with ONLY the JSON object, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to generate app");
    }

    const data = await response.json();
    let appContent = data.choices?.[0]?.message?.content || "";

    console.log("Raw response length:", appContent.length);

    // Clean up the response
    appContent = appContent.trim();
    
    // Remove markdown code blocks if present
    if (appContent.startsWith("```")) {
      appContent = appContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    // Try multiple parsing strategies
    let appData = null;

    // Strategy 1: Direct parse
    try {
      appData = JSON.parse(appContent);
    } catch (e) {
      console.log("Direct parse failed, trying extraction...");
    }

    // Strategy 2: Extract JSON from content
    if (!appData) {
      const jsonMatch = appContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          appData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.log("JSON extraction failed...");
        }
      }
    }

    // Strategy 3: Fix common JSON issues
    if (!appData) {
      try {
        let fixed = appContent
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes
        
        const match = fixed.match(/\{[\s\S]*\}/);
        if (match) {
          appData = JSON.parse(match[0]);
        }
      } catch (e) {
        console.log("Fixed parse failed...");
      }
    }

    // Validate and ensure proper structure
    if (!appData || !appData.files || !Array.isArray(appData.files) || appData.files.length === 0) {
      console.error("Invalid app data structure");
      
      // Create a minimal fallback app
      appData = {
        appName: "Generated App",
        description: validatedDescription,
        files: [
          {
            path: "src/App.tsx",
            content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ${validatedDescription.slice(0, 50)}
        </h1>
        <p className="text-gray-600">
          Your app is being generated. Please try again for a more complete version.
        </p>
      </div>
    </div>
  );
}`,
            language: "tsx"
          }
        ],
        supabaseSchema: "-- No schema required for this basic app",
        edgeFunctions: [],
        setupInstructions: [
          "npm install",
          "npm run dev",
          "Try regenerating for more features"
        ],
      };
    }

    // Ensure all required fields exist
    appData.appName = appData.appName || "Generated App";
    appData.description = appData.description || validatedDescription;
    appData.files = appData.files || [];
    appData.supabaseSchema = appData.supabaseSchema || "";
    appData.edgeFunctions = appData.edgeFunctions || [];
    appData.setupInstructions = appData.setupInstructions || ["npm install", "npm run dev"];

    return new Response(
      JSON.stringify(appData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating app:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate app";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
