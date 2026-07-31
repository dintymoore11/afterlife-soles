import { createAdminSupabase } from "@/lib/supabase/server";
import { getOrCreateDeviceToken, sha256 } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request, "reply", 10, 60_000)) return Response.json({ error: "Please wait before replying again." }, { status: 429 });
  const { id } = await context.params;
  const body = await request.json() as Record<string, string>;
  if (body.website) return Response.json({ ok: true });
  const name = String(body.name || "").trim(), text = String(body.body || "").trim();
  if (!name || !text) return Response.json({ error: "Name and reply are required." }, { status: 400 });
  const db = createAdminSupabase();
  const { data: discussion } = await db.from("discussions").select("is_locked,is_hidden").eq("id", id).single();
  if (!discussion || discussion.is_hidden) return Response.json({ error: "Discussion not found." }, { status: 404 });
  if (discussion.is_locked) return Response.json({ error: "This discussion is locked." }, { status: 423 });
  const tokenHash = await sha256(await getOrCreateDeviceToken());
  const { data: user, error: userError } = await db.from("users").upsert({ display_name: name.slice(0, 80), device_token_hash: tokenHash, last_seen_at: new Date().toISOString() }, { onConflict: "device_token_hash" }).select("id").single();
  if (userError) return Response.json({ error: userError.message }, { status: 500 });
  const { error } = await db.from("replies").insert({ discussion_id: id, author_id: user.id, body: text.slice(0, 5000), parent_reply_id: body.parentReplyId || null });
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true }, { status: 201 });
}
