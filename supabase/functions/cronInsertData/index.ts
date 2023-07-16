// @see /supabase/functions/import_map.json
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

serve(async () => {
  try {
    await supabaseClient
      .from("countries")
      .insert({ name: "Denmark", timestamp: new Date().toISOString() });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
