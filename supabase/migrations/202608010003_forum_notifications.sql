alter table public.users add column if not exists email_notifications_enabled boolean not null default false;

create table if not exists public.discussion_subscriptions (
  user_id uuid not null references public.users(id) on delete cascade,
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  is_subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, discussion_id)
);

create index if not exists discussion_subscriptions_discussion_idx
  on public.discussion_subscriptions(discussion_id) where is_subscribed;

alter table public.discussion_subscriptions enable row level security;
revoke all on public.discussion_subscriptions from anon, authenticated;
