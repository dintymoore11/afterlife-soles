import { createAdminSupabase } from "@/lib/supabase/server";
import { verifyPreferenceToken } from "@/lib/notifications";

function page(message: string, token?: string) {
  const actions = token ? `<form method="post"><input type="hidden" name="token" value="${token.replace(/[\"<>]/g, "")}"><button name="action" value="thread">Mute this discussion</button><button name="action" value="all">Turn off all forum emails</button></form>` : "";
  return new Response(`<!doctype html><html><head><meta name="viewport" content="width=device-width"><title>Email preferences · AfterLife Soles</title><style>body{margin:0;background:#10120f;color:#f4f1e8;font:18px Arial,sans-serif;display:grid;min-height:100vh;place-items:center}.card{max-width:560px;margin:24px;padding:40px;border:1px solid #353931}.brand{color:#ff5a24;font-weight:800;letter-spacing:.12em}h1{font-size:38px}button{display:block;width:100%;margin-top:14px;padding:14px;border:0;background:#ff5a24;color:white;font-weight:800;cursor:pointer}button+button{background:#343832}a{color:#ff7b4d}</style></head><body><main class="card"><p class="brand">AFTERLIFE SOLES</p><h1>Email preferences</h1><p>${message}</p>${actions}<p><a href="/base-camp">Return to the Forum</a></p></main></body></html>`, { status: token ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  return (await verifyPreferenceToken(token)) ? page("Choose which forum notifications you would like to stop.", token) : page("This preferences link is invalid or has expired.");
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type") || "";
  let token = "", action = "thread";
  if (type.includes("application/json")) { const body = await request.json(); token = String(body.token || ""); action = String(body.action || "thread"); }
  else { const body = await request.formData(); token = String(body.get("token") || new URL(request.url).searchParams.get("token") || ""); action = String(body.get("action") || "thread"); }
  const payload = await verifyPreferenceToken(token);
  if (!payload) return page("This preferences link is invalid or has expired.");
  const db = createAdminSupabase();
  if (action === "all") {
    await db.from("users").update({ email_notifications_enabled: false }).eq("id", payload.userId);
    await db.from("discussion_subscriptions").update({ is_subscribed: false }).eq("user_id", payload.userId);
    return page("All forum email notifications have been turned off.", token);
  }
  await db.from("discussion_subscriptions").update({ is_subscribed: false }).eq("user_id", payload.userId).eq("discussion_id", payload.discussionId);
  return page("Email notifications for this discussion have been muted.", token);
}
