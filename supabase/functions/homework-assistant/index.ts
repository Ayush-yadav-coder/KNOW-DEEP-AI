import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, validateString, validateOptionalString, validateMessages, corsHeaders } from "../_shared/auth.ts";

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

    const body = await req.json();
    
    // Validate question (required unless image is provided)
    let validatedQuestion: string | null = null;
    if (body.question) {
      const questionResult = validateString(body.question, "Question", 5000);
      if (questionResult instanceof Response) {
        return questionResult;
      }
      validatedQuestion = questionResult;
    }

    // Validate optional image URL
    let validatedImage: string | null = null;
    if (body.image) {
      const imageResult = validateOptionalString(body.image, "Image", 10000);
      if (imageResult instanceof Response) {
        return imageResult;
      }
      validatedImage = imageResult;
      
      // Basic URL validation for image
      if (validatedImage && !validatedImage.startsWith('data:') && !validatedImage.startsWith('http')) {
        return new Response(
          JSON.stringify({ error: "Invalid image format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Either question or image must be provided
    if (!validatedQuestion && !validatedImage) {
      return new Response(
        JSON.stringify({ error: "Either question or image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate optional conversation history
    let validatedHistory: { role: string; content: string }[] = [];
    if (body.conversationHistory && Array.isArray(body.conversationHistory)) {
      const historyResult = validateMessages(body.conversationHistory, 20, 5000);
      if (historyResult instanceof Response) {
        return historyResult;
      }
      validatedHistory = historyResult;
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${authResult.userId} - Processing homework question`);

    const systemPrompt = `You are an expert homework tutor and academic assistant. Your role is to help students understand and solve their homework problems across all subjects including:
- Mathematics (algebra, geometry, calculus, statistics)
- Science (physics, chemistry, biology)
- Language Arts (grammar, essay writing, literature analysis)
- History and Social Studies
- Computer Science and Programming

When helping students:
1. Break down problems step-by-step
2. Explain the underlying concepts, not just the answer
3. Use clear, age-appropriate language
4. If given an image of homework, analyze it carefully and identify all questions/problems
5. Provide complete solutions with explanations
6. Use markdown formatting for better readability
7. For math, use code blocks for formulas and calculations
8. Encourage learning by explaining the "why" behind each step

If the student shares an image, describe what you see and then solve the problems shown.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...validatedHistory,
    ];

    // Handle image if provided
    if (validatedImage) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: validatedImage },
          },
          {
            type: "text",
            text: validatedQuestion || "Please analyze this homework image and provide step-by-step solutions for all problems shown.",
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: validatedQuestion,
      });
    }

    // Use OpenAI API directly
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid OpenAI API key. Please check your settings." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I couldn't process your homework. Please try again.";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing homework:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process homework. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
