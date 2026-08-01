import { isAdminSession } from "@/lib/security";
import { createAdminSupabase } from "@/lib/supabase/server";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params; const input = await request.json() as Record<string, boolean>;
  const allowed: Record<string, boolean> = {};
  for (const key of ["is_pinned", "is_locked", "is_hidden"]) if (typeof input[key] === "boolean") allowed[key] = input[key];
  const { error } = await createAdminSupabase().from("discussions").update(allowed).eq("id", id);
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true });
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params; const db = createAdminSupabase();
  const { data: discussionFiles } = await db.from("attachments").select("storage_path").eq("discussion_id", id);
  const { data: replies } = await db.from("replies").select("id").eq("discussion_id", id);
  const replyIds = replies?.map((reply) => reply.id) || [];
  const { data: replyFiles } = replyIds.length ? await db.from("attachments").select("storage_path").in("reply_id", replyIds) : { data: [] };
  const paths = [...(discussionFiles || []), ...(replyFiles || [])].map((file) => file.storage_path);
  if (paths.length) await db.storage.from("community-attachments").remove(paths);
  const { error } = await db.from("discussions").delete().eq("id", id);
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true });
}
