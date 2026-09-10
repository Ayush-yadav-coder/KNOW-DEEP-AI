import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, validateOptionalString, corsHeaders } from "../_shared/auth.ts";

const enhancementPrompts: Record<string, string> = {
  "4k-upscale": "Enhance this image to 4K Ultra HD quality. Increase sharpness, add fine details, improve clarity and texture while preserving the original composition. Make colors more vibrant and reduce any noise or artifacts.",
  "remove-blur": "Remove all blur and noise from this image. Make it crystal clear and sharp with enhanced focus on all elements. Restore fine details and improve overall sharpness.",
  "ghibli-style": "Transform this image into Studio Ghibli anime art style with soft watercolor textures, warm lighting, whimsical atmosphere, and hand-drawn aesthetic. Add gentle gradients and dreamlike quality.",
  "anime-style": "Convert this image to high-quality anime/manga art style with bold outlines, vibrant colors, and characteristic anime aesthetics. Use clean linework and expressive features.",
  "cinematic": "Apply cinematic color grading with dramatic lighting, film grain, letterbox aspect, and movie-like atmosphere. Add depth and dramatic shadows for a Hollywood look.",
  "portrait-mode": "Enhance this as a professional portrait with bokeh background blur, soft skin tones, perfect lighting, and studio-quality finish. Improve skin texture naturally.",
  "hdr-effect": "Apply HDR effect with enhanced dynamic range, vivid colors, deep shadows, and bright highlights for a dramatic, impactful look with rich detail in all tones.",
  "vintage-film": "Transform with vintage film aesthetics including warm sepia tones, authentic film grain, light leaks, and nostalgic color palette. Add a classic analog feel.",
  "remove-background": "Remove the background completely, leaving only the main subject with a clean transparent or pure white background. Ensure clean edges.",
  "add-blur": "Add a professional depth-of-field blur effect to the background while keeping the main subject perfectly sharp and in focus.",
  "brighten": "Increase brightness and exposure naturally while maintaining balanced highlights and shadows. Make the image more vibrant and well-lit.",
  "vintage-filter": "Apply a vintage Instagram-style filter with faded colors, warm tones, and retro aesthetic. Add subtle vignette and soft contrast.",
  "black-white": "Convert to a stunning high-contrast black and white image with rich tonal range, deep blacks, bright whites, and beautiful grayscale gradients.",
  "sunlight-effect": "Add natural golden hour sunlight rays and warm lens flare effects. Create a warm, sunny atmosphere with beautiful light.",
  "remove-person": "Remove any people in the background while naturally preserving and filling in the rest of the image seamlessly.",
  "text-overlay": "Prepare this image for text overlay by adjusting contrast, adding a subtle gradient overlay for better text visibility while keeping the image appealing.",
};

const validEnhancementTypes = Object.keys(enhancementPrompts);

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
    
    // Validate imageUrl
    const validatedImageUrl = validateString(body.imageUrl, "Image URL", 15_000_000); // Allow large base64 (up to ~11MB image)
    if (validatedImageUrl instanceof Response) {
      return validatedImageUrl;
    }

    // Validate URL format or base64
    const isBase64 = validatedImageUrl.startsWith('data:image/');
    if (!isBase64) {
      try {
        new URL(validatedImageUrl);
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid image URL format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate enhancement type
    const enhancementType = validEnhancementTypes.includes(body.enhancementType) 
      ? body.enhancementType 
      : "4k-upscale";

    // Validate optional custom prompt
    const customPrompt = validateOptionalString(body.customPrompt, "Custom prompt", 500);
    if (customPrompt instanceof Response) {
      return customPrompt;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = customPrompt || enhancementPrompts[enhancementType] || "Enhance this image with better quality, sharpness, and vivid colors.";

    console.log(`User ${authResult.userId} - Enhancing image with: ${enhancementType}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: validatedImageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Image enhancement failed. Please try again.");
    }

    const data = await response.json();

    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!enhancedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("Failed to enhance image. Please try a different mode or image.");
    }

    return new Response(
      JSON.stringify({ imageUrl: enhancedImageUrl, description: textContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error enhancing image:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to enhance image. Please try again.";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
