-- 001_user_profiles.sql
-- Ensure user_profiles has a points_total column used for leaderboard/gamification

alter table if exists public.user_profiles
  add column if not exists points_total integer not null default 0;

-- Keep updated_at fresh on updates
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'set_updated_at_timestamp') then
    create or replace function public.set_updated_at_timestamp()
    returns trigger
    language plpgsql
    as $func$
    begin
      new.updated_at := now();
      return new;
    end
    $func$;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_user_profiles_set_updated_at'
  ) then
    create trigger trg_user_profiles_set_updated_at
    before update on public.user_profiles
    for each row
    execute function public.set_updated_at_timestamp();
  end if;
end$$;


