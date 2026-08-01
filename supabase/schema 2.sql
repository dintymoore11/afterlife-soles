create extension if not exists pgcrypto;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 80),
  email text,
  device_token_hash text unique not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  author_id uuid not null references public.users(id),
  title text not null check (char_length(title) between 4 and 120),
  body text not null check (char_length(body) between 1 and 5000),
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  author_id uuid not null references public.users(id),
  parent_reply_id uuid references public.replies(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id),
  discussion_id uuid references public.discussions(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  reason text not null default 'Community report',
  status text not null default 'open' check (status in ('open','reviewed','dismissed','actioned')),
  created_at timestamptz not null default now(),
  check ((discussion_id is not null)::int + (reply_id is not null)::int = 1)
);

create index discussions_category_created_idx on public.discussions(category_id, created_at desc);
create index discussions_search_idx on public.discussions using gin(to_tsvector('english', title || ' ' || body));
create index replies_discussion_created_idx on public.replies(discussion_id, created_at);
create index reports_status_idx on public.reports(status, created_at desc);

insert into public.categories (slug,name,description,sort_order) values
 ('questions','Questions','Get repair help from the community.',1),
 ('tips-tricks','Tips & Tricks','Share hard-won workshop beta.',2),
 ('success-stories','Success Stories','Celebrate shoes that made it back.',3)
on conflict (slug) do nothing;

alter table public.categories enable row level security;
alter table public.users enable row level security;
alter table public.discussions enable row level security;
alter table public.replies enable row level security;
alter table public.reports enable row level security;

create policy "categories are public" on public.categories for select using (true);
create policy "visible discussions are public" on public.discussions for select using (not is_hidden);
create policy "visible replies are public" on public.replies for select using (not is_hidden);
