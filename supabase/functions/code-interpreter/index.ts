import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, consumeDailyAiMessage, validateString, corsHeaders } from "../_shared/auth.ts";

const validActions = ["execute", "explain", "debug", "optimize", "generate"];
const validLanguages = [
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "go", "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css"
];

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
    
    // Validate action
    const action = validActions.includes(body.action) ? body.action : "explain";
    
    // Validate language
    const language = validLanguages.includes(body.language?.toLowerCase()) 
      ? body.language.toLowerCase() 
      : "javascript";

    // Validate code (max 50KB)
    if (action !== 'explain' && !body.code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedCode = validateString(body.code || "", "Code", 50000);
    if (validatedCode instanceof Response) {
      return validatedCode;
    }

    console.log(`User ${authResult.userId} - Processing ${action} for ${language}`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'execute':
        systemPrompt = `You are a code execution simulator. Given code in ${language}, simulate its execution and provide:
1. The expected output (what would print/return)
2. Any errors that would occur
3. Step-by-step execution trace if helpful

Format as JSON:
{
  "output": "The console output or return value",
  "error": null or "Error message",
  "executionTrace": ["Step 1: ...", "Step 2: ..."],
  "variables": {"varName": "value at end"}
}`;
        userPrompt = validatedCode;
        break;

      case 'explain':
        systemPrompt = `You are a code explanation expert. Explain the given ${language} code in detail:
1. What the code does overall
2. Line-by-line explanation
3. Time and space complexity if applicable
4. Best practices and potential improvements

Format your response in clear markdown.`;
        userPrompt = validatedCode;
        break;

      case 'debug':
        systemPrompt = `You are a debugging expert. Analyze the given ${language} code for:
1. Syntax errors
2. Logic errors
3. Runtime errors
4. Edge cases not handled
5. Provide the corrected code

Format as JSON:
{
  "issues": [{"type": "error type", "line": number, "description": "...", "fix": "..."}],
  "correctedCode": "The fixed code",
  "explanation": "What was wrong and how it was fixed"
}`;
        userPrompt = validatedCode;
        break;

      case 'optimize':
        systemPrompt = `You are a code optimization expert. Optimize the given ${language} code for:
1. Performance
2. Readability
3. Best practices
4. Memory efficiency

Format as JSON:
{
  "optimizedCode": "The optimized code",
  "improvements": ["Improvement 1", "Improvement 2"],
  "complexityBefore": "O(n^2)",
  "complexityAfter": "O(n)",
  "explanation": "Detailed explanation of optimizations"
}`;
        userPrompt = validatedCode;
        break;

      case 'generate':
        systemPrompt = `You are a code generation expert. Generate clean, well-commented ${language} code based on the description. Include:
1. Complete, working code
2. Comments explaining the logic
3. Example usage

Format as JSON:
{
  "code": "The generated code",
  "explanation": "How the code works",
  "usage": "Example of how to use it"
}`;
        userPrompt = validatedCode;
        break;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      throw new Error("Code interpreter service error");
    }

    const data = await response.json();
    let result = data.choices[0].message.content;

    // Try to parse JSON response
    try {
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(result);
      return new Response(JSON.stringify({ result: parsed, action }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ result: { text: result }, action }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: "Code interpreter service temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
