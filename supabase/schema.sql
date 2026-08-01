-- AfterLife Soles production schema for Supabase/Postgres.
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
  description text, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(), display_name text not null check (char_length(display_name) between 1 and 80),
  email text, device_token_hash text unique not null, is_admin boolean not null default false,
  created_at timestamptz not null default now(), last_seen_at timestamptz not null default now()
);
create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id),
  author_id uuid not null references public.users(id), title text not null check (char_length(title) between 4 and 120),
  body text not null check (char_length(body) between 1 and 5000), is_pinned boolean not null default false,
  is_locked boolean not null default false, is_hidden boolean not null default false,
  search_document tsvector generated always as (to_tsvector('english', title || ' ' || body)) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(), discussion_id uuid not null references public.discussions(id) on delete cascade,
  author_id uuid not null references public.users(id), parent_reply_id uuid references public.replies(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000), is_hidden boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid references public.users(id),
  discussion_id uuid references public.discussions(id) on delete cascade, reply_id uuid references public.replies(id) on delete cascade,
  reason text not null default 'Community report', status text not null default 'open' check (status in ('open','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now(), check ((discussion_id is not null)::int + (reply_id is not null)::int = 1)
);
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(), discussion_id uuid references public.discussions(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade, storage_path text unique not null,
  file_name text not null check (char_length(file_name) between 1 and 255), mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760), created_at timestamptz not null default now(),
  check ((discussion_id is not null)::int + (reply_id is not null)::int = 1)
);

create index if not exists discussions_category_created_idx on public.discussions(category_id, created_at desc);
create index if not exists discussions_search_idx on public.discussions using gin(search_document);
create index if not exists replies_discussion_created_idx on public.replies(discussion_id, created_at);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists attachments_discussion_idx on public.attachments(discussion_id);
create index if not exists attachments_reply_idx on public.attachments(reply_id);

insert into public.categories (slug,name,description,sort_order) values
 ('questions','Questions','Get repair help from the community.',1),
 ('tips-tricks','Tips & Tricks','Share hard-won workshop beta.',2),
 ('success-stories','Success Stories','Celebrate shoes that made it back.',3)
on conflict (slug) do update set name=excluded.name, description=excluded.description, sort_order=excluded.sort_order;

alter table public.categories enable row level security;
alter table public.users enable row level security;
alter table public.discussions enable row level security;
alter table public.replies enable row level security;
alter table public.reports enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "categories are public" on public.categories;
drop policy if exists "visible discussions are public" on public.discussions;
drop policy if exists "visible discussion authors are public" on public.users;
drop policy if exists "visible replies are public" on public.replies;
create policy "categories are public" on public.categories for select to anon, authenticated using (true);
create policy "visible discussions are public" on public.discussions for select to anon, authenticated using (not is_hidden);
create policy "visible discussion authors are public" on public.users for select to anon, authenticated using (
  exists (select 1 from public.discussions d where d.author_id = users.id and not d.is_hidden)
  or exists (select 1 from public.replies r join public.discussions d on d.id=r.discussion_id where r.author_id=users.id and not r.is_hidden and not d.is_hidden)
);
create policy "visible replies are public" on public.replies for select to anon, authenticated using (
  not is_hidden and exists (select 1 from public.discussions d where d.id=discussion_id and not d.is_hidden)
);
drop policy if exists "visible attachments are public" on public.attachments;
create policy "visible attachments are public" on public.attachments for select to anon, authenticated using (
  (discussion_id is not null and exists (select 1 from public.discussions d where d.id=discussion_id and not d.is_hidden))
  or (reply_id is not null and exists (select 1 from public.replies r join public.discussions d on d.id=r.discussion_id where r.id=reply_id and not r.is_hidden and not d.is_hidden))
);

revoke all on public.users, public.discussions, public.replies, public.reports from anon, authenticated;
grant select on public.categories, public.users, public.discussions, public.replies to anon, authenticated;
revoke all on public.attachments from anon, authenticated;
grant select on public.attachments to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-attachments', 'community-attachments', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif','application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists discussions_set_updated_at on public.discussions;
drop trigger if exists replies_set_updated_at on public.replies;
create trigger discussions_set_updated_at before update on public.discussions for each row execute function public.set_updated_at();
create trigger replies_set_updated_at before update on public.replies for each row execute function public.set_updated_at();
