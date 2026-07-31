import { isAdminSession } from "@/lib/security";
import { createAdminSupabase } from "@/lib/supabase/server";
export async function GET() {
  if (!await isAdminSession()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await createAdminSupabase().from("discussions").select("id,title,is_pinned,is_locked,is_hidden,created_at,categories(name),users!discussions_author_id_fkey(display_name),replies(count)").order("created_at", { ascending: false });
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ discussions: data });
}
