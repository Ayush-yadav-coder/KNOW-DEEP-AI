import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface AuthResult {
  userId: string;
  email?: string;
}

export async function consumeDailyAiMessage(userId: string): Promise<Response | null> {
  const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data, error } = await admin.rpc('consume_daily_ai_message', { _user_id: userId, _daily_limit: 15 });
  if (error) {
    console.error('Daily usage check failed:', error.message);
    return new Response(JSON.stringify({ error: 'Usage limit service temporarily unavailable. Please try again.' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (!(data as { allowed?: boolean })?.allowed) {
    return new Response(JSON.stringify({ error: "You've reached today's free limit of 15 messages on Know Deep 2.5 Pro Preview." }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return null;
}

export async function authenticateRequest(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Check if it's just the anon key (not a real JWT)
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (token === supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Authentication required. Please sign in.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    supabaseAnonKey,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired session. Please sign in again.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return {
    userId: data.user.id,
    email: data.user.email,
  };
}

// Input validation helpers
export function validateString(value: unknown, fieldName: string, maxLength: number): string | Response {
  if (typeof value !== 'string') {
    return new Response(
      JSON.stringify({ error: `${fieldName} must be a string` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (value.length === 0) {
    return new Response(
      JSON.stringify({ error: `${fieldName} is required` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (value.length > maxLength) {
    return new Response(
      JSON.stringify({ error: `${fieldName} must be less than ${maxLength} characters` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Remove control characters
  return value.replace(/[\x00-\x1F\x7F]/g, '');
}

export function validateOptionalString(value: unknown, fieldName: string, maxLength: number): string | null | Response {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return validateString(value, fieldName, maxLength);
}

export function validateMessages(messages: unknown, maxMessages: number = 50, maxContentLength: number = 10000): { role: string; content: string }[] | Response {
  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: 'Messages must be an array' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'At least one message is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (messages.length > maxMessages) {
    return new Response(
      JSON.stringify({ error: `Maximum ${maxMessages} messages allowed` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const validatedMessages: { role: string; content: string }[] = [];
  const validRoles = ['user', 'assistant', 'system'];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      return new Response(
        JSON.stringify({ error: `Message at index ${i} is invalid` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!validRoles.includes(msg.role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role at message ${i}. Must be: user, assistant, or system` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (typeof msg.content !== 'string' || msg.content.length > maxContentLength) {
      return new Response(
        JSON.stringify({ error: `Message content at index ${i} exceeds ${maxContentLength} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    validatedMessages.push({
      role: msg.role,
      content: msg.content.replace(/[\x00-\x1F\x7F]/g, ''),
    });
  }
  
  return validatedMessages;
}

export function validateEnum<T extends string>(value: unknown, fieldName: string, allowedValues: T[]): T | Response {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    return new Response(
      JSON.stringify({ error: `${fieldName} must be one of: ${allowedValues.join(', ')}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  return value as T;
}

export function validateArray(value: unknown, fieldName: string, maxItems: number, maxItemLength: number): string[] | Response {
  if (!Array.isArray(value)) {
    return new Response(
      JSON.stringify({ error: `${fieldName} must be an array` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (value.length > maxItems) {
    return new Response(
      JSON.stringify({ error: `${fieldName} cannot have more than ${maxItems} items` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const validated: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.length > maxItemLength) {
      return new Response(
        JSON.stringify({ error: `Each item in ${fieldName} must be a string with max ${maxItemLength} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    validated.push(item.replace(/[\x00-\x1F\x7F]/g, ''));
  }
  
  return validated;
}
