create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid references public.discussions(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  storage_path text unique not null,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now(),
  check ((discussion_id is not null)::int + (reply_id is not null)::int = 1)
);
create index if not exists attachments_discussion_idx on public.attachments(discussion_id);
create index if not exists attachments_reply_idx on public.attachments(reply_id);
alter table public.attachments enable row level security;
drop policy if exists "visible attachments are public" on public.attachments;
create policy "visible attachments are public" on public.attachments for select to anon, authenticated using (
  (discussion_id is not null and exists (select 1 from public.discussions d where d.id=discussion_id and not d.is_hidden))
  or (reply_id is not null and exists (select 1 from public.replies r join public.discussions d on d.id=r.discussion_id where r.id=reply_id and not r.is_hidden and not d.is_hidden))
);
revoke all on public.attachments from anon, authenticated;
grant select on public.attachments to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-attachments', 'community-attachments', true, 10485760, array[
  'image/jpeg','image/png','image/webp','image/gif','image/avif','application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]) on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
