import { createAdminSupabase } from "@/lib/supabase/server";

type TokenPayload = { userId: string; discussionId: string; expires: number };

function base64url(value: string) {
  return Buffer.from(value).toString("base64url");
}

async function signature(value: string) {
  const secret = process.env.NOTIFICATION_SIGNING_SECRET;
  if (!secret) throw new Error("Missing NOTIFICATION_SIGNING_SECRET");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Buffer.from(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))).toString("base64url");
}

export async function createPreferenceToken(userId: string, discussionId: string) {
  const encoded = base64url(JSON.stringify({ userId, discussionId, expires: Date.now() + 365 * 24 * 60 * 60 * 1000 } satisfies TokenPayload));
  return `${encoded}.${await signature(encoded)}`;
}

export async function verifyPreferenceToken(token: string): Promise<TokenPayload | null> {
  try {
    const [encoded, supplied] = token.split(".");
    if (!encoded || !supplied || (await signature(encoded)) !== supplied) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as TokenPayload;
    return payload.userId && payload.discussionId && payload.expires > Date.now() ? payload : null;
  } catch { return null; }
}

export async function subscribeToDiscussion(db: ReturnType<typeof createAdminSupabase>, userId: string, discussionId: string, enabled: boolean) {
  if (!enabled) return;
  await db.from("users").update({ email_notifications_enabled: true }).eq("id", userId);
  await db.from("discussion_subscriptions").upsert({ user_id: userId, discussion_id: discussionId, is_subscribed: true }, { onConflict: "user_id,discussion_id" });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

export async function sendReplyNotifications(discussionId: string, replyAuthorId: string, replyAuthor: string, replyBody: string) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_SIGNING_SECRET) return;
  const db = createAdminSupabase();
  const { data: discussion } = await db.from("discussions").select("title").eq("id", discussionId).single();
  const { data: subscriptions } = await db.from("discussion_subscriptions").select("user_id,users!inner(email,email_notifications_enabled)").eq("discussion_id", discussionId).eq("is_subscribed", true);
  if (!discussion || !subscriptions?.length) return;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.afterlifesoles.com").replace(/\/$/, "");
  const sent = new Set<string>();
  await Promise.all(subscriptions.map(async subscription => {
    const user = Array.isArray(subscription.users) ? subscription.users[0] : subscription.users;
    const email = user?.email?.trim().toLowerCase();
    if (subscription.user_id === replyAuthorId || !user?.email_notifications_enabled || !email || sent.has(email)) return;
    sent.add(email);
    const token = await createPreferenceToken(subscription.user_id, discussionId);
    const preferences = `${site}/api/notifications/preferences?token=${encodeURIComponent(token)}`;
    const thread = `${site}/base-camp?discussion=${discussionId}`;
    const excerpt = replyBody.length > 500 ? `${replyBody.slice(0, 497)}…` : replyBody;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFICATION_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || "AfterLife Soles <onboarding@resend.dev>",
        to: [email],
        subject: `New reply: ${discussion.title}`,
        text: `${replyAuthor} added a reply to “${discussion.title}”:\n\n${excerpt}\n\nView the discussion: ${thread}\n\nManage email notifications: ${preferences}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171915;max-width:620px"><p style="color:#ff5a24;font-weight:700;letter-spacing:.08em">AFTERLIFE SOLES · FORUM</p><h1 style="font-size:26px">New reply in ${escapeHtml(discussion.title)}</h1><p><strong>${escapeHtml(replyAuthor)}</strong> added a reply:</p><blockquote style="margin:20px 0;padding:16px 20px;border-left:4px solid #ff5a24;background:#f4f3ee">${escapeHtml(excerpt).replace(/\n/g, "<br>")}</blockquote><p><a href="${thread}" style="display:inline-block;padding:12px 18px;background:#ff5a24;color:#fff;text-decoration:none;font-weight:700">View discussion</a></p><p style="font-size:12px;color:#666">You received this because you opted in to updates for this discussion. <a href="${preferences}">Mute this discussion or turn off forum emails</a>.</p></div>`,
        headers: { "List-Unsubscribe": `<${preferences}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      }),
    });
    if (!response.ok) console.error("Forum notification delivery failed", await response.text());
  }));
}
