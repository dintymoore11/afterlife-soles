export const ATTACHMENT_BUCKET = "community-attachments";
export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "application/pdf", "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type AttachmentInput = { path: string; name: string; type: string; size: number };

export function validateAttachmentInputs(value: unknown, requiredPrefix: string): AttachmentInput[] {
  if (!Array.isArray(value)) return [];
  if (value.length > MAX_ATTACHMENTS) throw new Error(`Attach no more than ${MAX_ATTACHMENTS} files.`);
  return value.map((item) => {
    const input = item as Partial<AttachmentInput>;
    if (!input.path?.startsWith(requiredPrefix) || !input.name || !input.type || !ALLOWED_ATTACHMENT_TYPES.has(input.type) || !Number.isFinite(input.size) || Number(input.size) < 1 || Number(input.size) > MAX_ATTACHMENT_BYTES) throw new Error("Invalid attachment metadata.");
    return { path: input.path, name: input.name.slice(0, 255), type: input.type, size: Number(input.size) };
  });
}

export function publicAttachmentUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${ATTACHMENT_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
