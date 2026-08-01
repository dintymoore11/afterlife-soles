import { createAdminSupabase, createPublicSupabase } from "@/lib/supabase/server";
import { getOrCreateDeviceToken, sha256 } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { publicAttachmentUrl, validateAttachmentInputs } from "@/lib/attachments";
import { subscribeToDiscussion } from "@/lib/notifications";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search")?.trim();
  const ascending = url.searchParams.get("sort") === "oldest";
  const db = createPublicSupabase();
  let query = db.from("discussions").select("id,title,body,created_at,is_pinned,is_locked,categories!inner(name,slug),users!discussions_author_id_fkey(display_name),attachments(id,file_name,mime_type,size_bytes,storage_path),replies(id,body,created_at,parent_reply_id,users!replies_author_id_fkey(display_name),attachments(id,file_name,mime_type,size_bytes,storage_path))").eq("is_hidden", false).eq("replies.is_hidden", false).order("is_pinned", { ascending: false }).order("created_at", { ascending });
  if (category && category !== "All") query = query.eq("categories.name", category);
  if (search) query = query.textSearch("search_document", search, { type: "websearch", config: "english" });
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const withUrls = (data || []).map((discussion) => ({ ...discussion,
    attachments: discussion.attachments?.map((file) => ({ ...file, url: publicAttachmentUrl(file.storage_path) })),
    replies: discussion.replies?.map((reply) => ({ ...reply, attachments: reply.attachments?.map((file) => ({ ...file, url: publicAttachmentUrl(file.storage_path) })) })),
  }));
  return Response.json({ discussions: withUrls });
}

export async function POST(request: Request) {
  if (!rateLimit(request, "discussion", 5, 60_000)) return Response.json({ error: "Please wait before posting again." }, { status: 429 });
  const body = await request.json() as Record<string, unknown>;
  if (body.website) return Response.json({ ok: true });
  const name = String(body.name || "").trim(), title = String(body.title || "").trim(), text = String(body.body || "").trim(), category = String(body.category || "");
  const email = String(body.email || "").trim().toLowerCase(), notify = body.notify === "on" || body.notify === true;
  if (!name || title.length < 4 || !text || !category) return Response.json({ error: "Please complete all required fields." }, { status: 400 });
  if (notify && !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter your email to receive reply notifications." }, { status: 400 });
  const db = createAdminSupabase();
  const tokenHash = await sha256(await getOrCreateDeviceToken());
  let attachments;
  try { attachments = validateAttachmentInputs(body.attachments, `${tokenHash}/`); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Invalid attachments." }, { status: 400 }); }
  const userValues: Record<string, unknown> = { display_name: name.slice(0, 80), device_token_hash: tokenHash, last_seen_at: new Date().toISOString() };
  if (email) userValues.email = email.slice(0, 320);
  const { data: user, error: userError } = await db.from("users").upsert(userValues, { onConflict: "device_token_hash" }).select("id").single();
  if (userError) return Response.json({ error: userError.message }, { status: 500 });
  const { data: cat } = await db.from("categories").select("id").eq("name", category).single();
  if (!cat) return Response.json({ error: "Unknown category." }, { status: 400 });
  const { data, error } = await db.from("discussions").insert({ author_id: user.id, category_id: cat.id, title: title.slice(0, 120), body: text.slice(0, 5000) }).select("id").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (attachments.length) {
    const { error: attachmentError } = await db.from("attachments").insert(attachments.map((file) => ({ discussion_id: data.id, storage_path: file.path, file_name: file.name, mime_type: file.type, size_bytes: file.size })));
    if (attachmentError) { await db.storage.from("community-attachments").remove(attachments.map((file) => file.path)); await db.from("discussions").delete().eq("id", data.id); return Response.json({ error: attachmentError.message }, { status: 500 }); }
  }
  await subscribeToDiscussion(db, user.id, data.id, notify);
  return Response.json({ id: data.id }, { status: 201 });
}
