-- ============================================
-- CLEANUP SCRIPT (OPTIONAL)
-- Run this ONLY if you want to start fresh
-- WARNING: This will delete all gamification data!
-- ============================================

-- Drop all gamification tables
DROP TABLE IF EXISTS public.gamify_notifications CASCADE;
DROP TABLE IF EXISTS public.gamify_user_quests CASCADE;
DROP TABLE IF EXISTS public.gamify_quests_catalog CASCADE;
DROP TABLE IF EXISTS public.gamify_user_achievements CASCADE;
DROP TABLE IF EXISTS public.gamify_achievements_catalog CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS award_bananas(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS award_achievement(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS progress_quest(TEXT, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;

-- Drop trigger
DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles CASCADE;

-- Now you can run 004_profiles_gamify_full.sql to recreate everything

