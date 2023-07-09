// @see /supabase/functions/import_map.json
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log("Running Delete User Function");

// ユーザーを削除したい場合はそのユーザーIDを引数として持たせることで
// 関数を実行しているユーザーIDをサーバー側ではなく引数から判断する

type Body = {
  uid: string;
};

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${Deno.env.get(
              "SUPABASE_SERVICE_ROLE_KEY"
            )}`,
          },
        },
      }
    );

    const body: Body = await req.json();
    console.log("body:", body);
    const { uid } = body;

    // メモ: auth.getUser()は現在この関数を実行しようとしているユーザー情報を
    // `req.headers.get("Authorization")` からユーザーのjwtから判別する
    // const {
    //   data: { user },
    // } = await supabaseClient.auth.getUser();

    // if (!user) {
    //   throw new Error("User not exist.");
    // }

    // console.log("User Id", user.id);

    // メモ: auth.admin.deleteUser(id)を実行するには `service_role_key` をrequest headerに入れ込む必要がある
    const { data, error } = await supabaseClient.auth.admin.deleteUser(uid);

    console.log("Data:", data);
    console.log("Error:", error);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
