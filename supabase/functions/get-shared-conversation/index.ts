import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const token = body?.token;
    if (typeof token !== "string" || !/^[A-Za-z0-9]{16,64}$/.test(token)) {
      return new Response(JSON.stringify({ error: "Invalid share link" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data, error } = await admin.rpc("get_shared_conversation", { _token: token });
    if (error) {
      console.error("Shared conversation lookup failed:", error.message);
      return new Response(JSON.stringify({ error: "Conversation unavailable" }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ data }), { headers: corsHeaders });
  } catch (error) {
    console.error("get-shared-conversation error:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: corsHeaders });
  }
});