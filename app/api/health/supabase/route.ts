export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url) return Response.json({ ok: false, error: "NEXT_PUBLIC_SUPABASE_URL is missing in Vercel." }, { status: 503 });
  if (!key) return Response.json({ ok: false, error: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing in Vercel." }, { status: 503 });
  try {
    const endpoint = new URL("/rest/v1/categories?select=id&limit=1", url);
    const response = await fetch(endpoint, { headers: { apikey: key }, cache: "no-store" });
    const text = await response.text();
    if (!response.ok) {
      let detail = text.slice(0, 300);
      try { detail = JSON.parse(text)?.message || detail; } catch {}
      return Response.json({ ok: false, status: response.status, error: detail || response.statusText }, { status: 503 });
    }
    const rows = JSON.parse(text) as unknown[];
    return Response.json({ ok: true, status: response.status, categoriesReachable: Array.isArray(rows) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Supabase direct health check failed:", error);
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
