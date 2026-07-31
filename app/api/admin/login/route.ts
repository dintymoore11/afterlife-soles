import { rateLimit } from "@/lib/rate-limit";
import { safeEqual, setAdminSession } from "@/lib/security";
export async function POST(request: Request) {
  if (!rateLimit(request, "admin-login", 5, 15 * 60_000)) return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const { password } = await request.json() as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password || !safeEqual(password, expected)) return Response.json({ error: "Access code not recognized." }, { status: 401 });
  await setAdminSession();
  return Response.json({ ok: true });
}
