-- DSA Quest Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor

-- 1. Problems table
create table if not exists public.problems (
  id integer primary key,
  title text not null,
  slug text not null,
  url text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  node_order integer not null,
  node text not null,
  node_key text not null,
  day integer not null,
  order_in_day integer not null,
  created_at timestamptz default now()
);

-- 2. User settings table
create table if not exists public.settings (
  user_id text primary key default 'me',
  start_date date not null default current_date,
  daily_target integer not null default 3,
  streak_freezes_available integer not null default 0,
  sound_enabled boolean not null default false,
  weekly_commitment text default '',
  updated_at timestamptz default now()
);

-- 3. Problem Progress table
create table if not exists public.progress (
  user_id text not null default 'me',
  problem_id integer not null references public.problems(id) on delete cascade,
  status text not null check (status in ('not_started', 'in_progress', 'solved_clean', 'solved_hint', 'needed_solution', 'skipped')),
  notes text default '',
  time_spent_seconds integer default 0,
  attempts integer default 0,
  opened_at timestamptz,
  solved_at timestamptz,
  last_attempt_at timestamptz default now(),
  primary key (user_id, problem_id)
);

-- 4. Day completions table
create table if not exists public.days (
  user_id text not null default 'me',
  day_number integer not null,
  completed_at timestamptz not null default now(),
  used_freeze boolean default false,
  primary key (user_id, day_number)
);

-- 5. XP Events table
create table if not exists public.xp_events (
  id text primary key,
  user_id text not null default 'me',
  problem_id integer references public.problems(id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz default now()
);

-- 6. Revisits table (spaced repetition)
create table if not exists public.revisits (
  id text primary key,
  user_id text not null default 'me',
  problem_id integer not null references public.problems(id) on delete cascade,
  interval_day integer not null check (interval_day in (1, 3, 7)),
  scheduled_for_day integer not null,
  graduated boolean default false,
  created_at timestamptz default now()
);

-- 7. Boss completions table
create table if not exists public.boss_completions (
  user_id text not null default 'me',
  node_key text not null,
  problem_id integer not null,
  time_taken_seconds integer not null,
  passed boolean default true,
  completed_at timestamptz default now(),
  primary key (user_id, node_key)
);

-- 8. Mock interview results table
create table if not exists public.mock_interviews (
  id text primary key,
  user_id text not null default 'me',
  day_number integer not null check (day_number in (44, 45)),
  approach_clarity integer default 5,
  edge_cases integer default 5,
  complexity_stated integer default 5,
  communication integer default 5,
  clean_code integer default 5,
  notes text default '',
  completed_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.problems enable row level security;
alter table public.settings enable row level security;
alter table public.progress enable row level security;
alter table public.days enable row level security;
alter table public.xp_events enable row level security;
alter table public.revisits enable row level security;
alter table public.boss_completions enable row level security;
alter table public.mock_interviews enable row level security;

-- Permissive policy for single-user sync
create policy "Allow all for problems" on public.problems for all using (true) with check (true);
create policy "Allow all for settings" on public.settings for all using (true) with check (true);
create policy "Allow all for progress" on public.progress for all using (true) with check (true);
create policy "Allow all for days" on public.days for all using (true) with check (true);
create policy "Allow all for xp_events" on public.xp_events for all using (true) with check (true);
create policy "Allow all for revisits" on public.revisits for all using (true) with check (true);
create policy "Allow all for boss_completions" on public.boss_completions for all using (true) with check (true);
create policy "Allow all for mock_interviews" on public.mock_interviews for all using (true) with check (true);
