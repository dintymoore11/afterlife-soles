import { createAdminSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!rateLimit(request, "report", 5, 60_000)) return Response.json({ error: "Too many reports." }, { status: 429 });
  const { id } = await context.params; const body = await request.json().catch(() => ({}));
  const { error } = await createAdminSupabase().from("reports").insert({ discussion_id: id, reason: String(body.reason || "Community report").slice(0, 500) });
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true }, { status: 201 });
}
