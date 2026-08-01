import { ALLOWED_ATTACHMENT_TYPES, ATTACHMENT_BUCKET, MAX_ATTACHMENT_BYTES } from "@/lib/attachments";
import { rateLimit } from "@/lib/rate-limit";
import { getOrCreateDeviceToken, sha256 } from "@/lib/security";
import { createAdminSupabase } from "@/lib/supabase/server";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif",
  "application/pdf": "pdf", "text/plain": "txt", "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export async function POST(request: Request) {
  if (!rateLimit(request, "attachment-url", 20, 60_000)) return Response.json({ error: "Too many upload attempts." }, { status: 429 });
  const body = await request.json() as { name?: string; type?: string; size?: number };
  if (!body.name || !body.type || !ALLOWED_ATTACHMENT_TYPES.has(body.type) || !body.size || body.size > MAX_ATTACHMENT_BYTES) return Response.json({ error: "Unsupported file or file is larger than 10 MB." }, { status: 400 });
  const owner = await sha256(await getOrCreateDeviceToken());
  const path = `${owner}/${crypto.randomUUID()}.${extensions[body.type]}`;
  const { data, error } = await createAdminSupabase().storage.from(ATTACHMENT_BUCKET).createSignedUploadUrl(path);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ path, token: data.token });
}
