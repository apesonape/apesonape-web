-- 002_gamify_tables.sql
-- Core tables for achievements and quests

create table if not exists public.gamify_user_achievements (
  id uuid primary key default gen_random_uuid(),
  glyph_user_id text not null,
  achievement_code text not null,
  earned_at timestamptz not null default now(),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_gamify_achievements_user on public.gamify_user_achievements(glyph_user_id);
create index if not exists idx_gamify_achievements_code on public.gamify_user_achievements(achievement_code);

-- Optional: enforce one-time achievements for specific codes
create unique index if not exists uniq_ach_like_once
  on public.gamify_user_achievements(glyph_user_id)
  where achievement_code = 'like_once';

create unique index if not exists uniq_ach_share_once
  on public.gamify_user_achievements(glyph_user_id)
  where achievement_code = 'share_once';

-- Quests table, one row per quest per user
create table if not exists public.gamify_user_quests (
  id uuid primary key default gen_random_uuid(),
  glyph_user_id text not null,
  quest_code text not null,
  status text not null default 'pending', -- pending | in_progress | completed
  progress integer not null default 0,
  target integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uniq_user_quest on public.gamify_user_quests(glyph_user_id, quest_code);
create index if not exists idx_gamify_quests_user on public.gamify_user_quests(glyph_user_id);

-- Auto-update updated_at
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_gamify_user_quests_updated_at'
  ) then
    create trigger trg_gamify_user_quests_updated_at
    before update on public.gamify_user_quests
    for each row
    execute function public.set_updated_at_timestamp();
  end if;
end$$;

-- RLS is recommended; service role can bypass when needed.
alter table public.gamify_user_achievements enable row level security;
alter table public.gamify_user_quests enable row level security;


