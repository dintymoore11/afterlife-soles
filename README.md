# AfterLife Soles

A responsive product and community website for AfterLife Soles. Built with Next.js 16, React 19, TypeScript, Tailwind CSS, and a Supabase-ready PostgreSQL schema.

## What is included

- Premium responsive product homepage
- Written installation guide with photo/video placeholders
- Base Camp discussion board with categories, search, sorting, replies, reports, and low-friction device identity
- Hidden `/admin` moderation workspace with pin, lock, hide, and delete controls
- Contact form with honeypot, rate limiting, optional Turnstile verification, and Resend delivery
- Supabase schema for users, categories, discussions, threaded replies, and reports
- Vercel and Sites deployment configuration

The site runs with sample community data out of the box. In preview mode, new discussions and replies are stored in the current browser so the complete experience can be tested immediately. The supplied Supabase schema is the production data model; connect the API routes to Supabase before opening Base Camp publicly.

## Local development

Requirements: Node.js 22.13 or later and npm.

1. Copy `.env.example` to `.env.local`.
2. Fill in the services you want to enable. The site can run without them for local UI testing.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql` once. This creates the five requested tables, indexes, starter categories, and read policies.
3. Copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Add the service-role key as `SUPABASE_SERVICE_ROLE_KEY`. Never expose this value through a `NEXT_PUBLIC_` variable.
5. Set a long random `DEVICE_TOKEN_SECRET`. Production write routes should hash the device cookie with this value before storing it as `users.device_token_hash`.
6. Set `ADMIN_PASSWORD`, and protect moderation mutations with a server-side admin session. The visible preview panel uses `NEXT_PUBLIC_ADMIN_PREVIEW_PASSWORD` only for local demonstration and must not be treated as production security.

The schema supports nested replies through `parent_reply_id`, future profiles, full-text discussion search, moderation reports, and soft-hiding of community content.

## Contact delivery

The form posts to `/api/contact`. Set:

- `RESEND_API_KEY` to enable actual email delivery.
- `CONTACT_FROM_EMAIL` to a verified sender in Resend.
- `CONTACT_TO_EMAIL` to the private destination address.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` when enabling Cloudflare Turnstile.

Without a Resend key, local submissions return a successful preview response and do not send email. The destination address is never rendered publicly.

The included limiter is intentionally lightweight and per runtime instance. For a public launch, move rate-limit state to Vercel KV, Upstash, or another shared store.

## Deploy to Vercel

1. Push this directory to a Git repository.
2. Import the repository into Vercel.
3. Add the values from `.env.example` under Project Settings → Environment Variables.
4. Deploy. `vercel.json` selects the standard Next.js build automatically.
5. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` production domain and redeploy so social previews use the canonical host.

## Production launch checklist

- Replace the Before / After and instruction placeholders with final photography or video.
- Wire Base Camp reads and writes to the supplied Supabase schema.
- Replace preview admin access with a server-issued, HTTP-only admin session.
- Enable Turnstile on both community write forms and contact submissions.
- Review Supabase row-level-security policies before enabling public writes.
- Verify the sender domain in Resend and test message delivery.
- Add the final privacy policy and community guidelines.

## Commands

- `npm run dev` — local Sites-compatible development server
- `npm run build` — Sites/Cloudflare production build
- `npm run build:vercel` — standard Next.js production build for Vercel
- `npm run lint` — lint the project

## Structure

- `app/` — routes, page components, styling, and server endpoints
- `app/components/` — shared navigation, footer, and interaction components
- `supabase/schema.sql` — production database schema
- `public/` — public brand and social-preview assets

The codebase intentionally keeps the MVP small so commerce, photo uploads, product pages, profiles, notifications, and articles can be added without unwinding a large framework layer.
