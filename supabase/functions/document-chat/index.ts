import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, validateOptionalString, corsHeaders } from "../_shared/auth.ts";

const validActions = ["summarize", "chat", "extract", "analyze"];

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
    
    // Validate document content (max 200KB)
    const validatedContent = validateString(body.documentContent, "Document content", 200000);
    if (validatedContent instanceof Response) {
      return validatedContent;
    }

    // Validate document name
    const documentName = validateOptionalString(body.documentName, "Document name", 255);
    if (documentName instanceof Response) {
      return documentName;
    }
    const safeName = documentName || "Uploaded Document";

    // Validate action
    const action = validActions.includes(body.action) ? body.action : "summarize";

    // Validate optional question
    const question = validateOptionalString(body.question, "Question", 2000);
    if (question instanceof Response) {
      return question;
    }

    console.log(`User ${authResult.userId} - Processing document: ${safeName}, action: ${action}`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'summarize':
        systemPrompt = `You are a document summarization expert. Analyze the following document and provide:
1. A concise executive summary (2-3 paragraphs)
2. Key points and takeaways (bullet points)
3. Main topics covered
4. Any important data, statistics, or figures mentioned

Format your response in clear markdown with sections.`;
        userPrompt = `Document: "${safeName}"\n\nContent:\n${validatedContent}`;
        break;

      case 'chat':
        systemPrompt = `You are a document analysis assistant. You have access to the following document. Answer questions about it accurately and thoroughly. Always reference specific parts of the document when answering. If the answer is not in the document, say so clearly.

Document: "${safeName}"

Content:
${validatedContent}`;
        userPrompt = question || 'What is this document about?';
        break;

      case 'extract':
        systemPrompt = `You are a data extraction expert. Extract structured information from the document:
1. Key entities (people, organizations, places)
2. Dates and numbers
3. Important facts
4. Action items or tasks if any
5. Contact information if present

Format as JSON:
{
  "entities": {"people": [], "organizations": [], "places": []},
  "dates": [],
  "numbers": [],
  "keyFacts": [],
  "actionItems": [],
  "contacts": []
}`;
        userPrompt = `Document: "${safeName}"\n\nContent:\n${validatedContent}`;
        break;

      case 'analyze':
        systemPrompt = `You are a document analysis expert. Provide a comprehensive analysis:
1. Document type and purpose
2. Writing style and tone
3. Target audience
4. Strengths and weaknesses
5. Suggestions for improvement
6. Overall assessment

Format your response in clear markdown.`;
        userPrompt = `Document: "${safeName}"\n\nContent:\n${validatedContent}`;
        break;

      default:
        systemPrompt = `You are a helpful document assistant. Answer questions about the document accurately.`;
        userPrompt = `Document: "${safeName}"\n\nContent:\n${validatedContent}\n\nQuestion: ${question || 'What is this about?'}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      throw new Error("Document chat service error");
    }

    const data = await response.json();
    let result = data.choices[0].message.content;

    // Try to parse JSON response for extract action
    if (action === 'extract') {
      try {
        result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(result);
        return new Response(JSON.stringify({ result: parsed, action }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // Continue with text response
      }
    }

    return new Response(JSON.stringify({ result, action }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: "Document chat service temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
