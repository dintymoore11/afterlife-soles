const attempts = new Map<string, { count: number; reset: number }>();

export function rateLimit(request: Request, scope: string, limit = 10, windowMs = 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.reset > now && current.count >= limit) return false;
  attempts.set(key, { count: current && current.reset > now ? current.count + 1 : 1, reset: now + windowMs });
  return true;
}
