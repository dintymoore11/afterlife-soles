import { createPublicSupabase } from "@/lib/supabase/server";
export async function GET() {
  try {
    const { count, error } = await createPublicSupabase().from("categories").select("*", { count: "exact", head: true });
    if (error) throw error;
    return Response.json({ ok: true, categories: count });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "Supabase connection failed";
    console.error("Supabase health check failed:", error);
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
