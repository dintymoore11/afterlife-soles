import { createPublicSupabase } from "@/lib/supabase/server";
export async function GET() {
  try {
    const { count, error } = await createPublicSupabase().from("categories").select("*", { count: "exact", head: true });
    if (error) throw error;
    return Response.json({ ok: true, categories: count });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Supabase connection failed" }, { status: 503 });
  }
}
