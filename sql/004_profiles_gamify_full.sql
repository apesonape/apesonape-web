-- ============================================
-- FULL GAMIFICATION SYSTEM
-- User profiles, achievements, quests, leaderboard
-- ============================================

-- 1. USER PROFILES (with bananas points and avatar)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glyph_user_id TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  display_name TEXT,
  x_username TEXT,
  bananas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_bananas ON public.user_profiles(bananas DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_glyph_user_id ON public.user_profiles(glyph_user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- 2. ACHIEVEMENTS CATALOG (all possible achievements)
CREATE TABLE IF NOT EXISTS public.gamify_achievements_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL, -- emoji or icon identifier
  bananas_reward INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL, -- 'gallery', 'creative', 'social', 'milestone'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USER ACHIEVEMENTS (earned achievements)
CREATE TABLE IF NOT EXISTS public.gamify_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glyph_user_id TEXT NOT NULL,
  achievement_code TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(glyph_user_id, achievement_code)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.gamify_user_achievements(glyph_user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_code ON public.gamify_user_achievements(achievement_code);

-- 4. QUESTS CATALOG (all possible quests)
CREATE TABLE IF NOT EXISTS public.gamify_quests_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_icon TEXT NOT NULL, -- emoji or icon identifier
  bananas_reward INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL, -- 'daily', 'social', 'creative', 'gallery'
  target_count INTEGER NOT NULL DEFAULT 1, -- how many times action must be done
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. USER QUESTS (quest progress and completion)
CREATE TABLE IF NOT EXISTS public.gamify_user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glyph_user_id TEXT NOT NULL,
  quest_code TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(glyph_user_id, quest_code)
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user ON public.gamify_user_quests(glyph_user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_status ON public.gamify_user_quests(status);

-- 6. NOTIFICATIONS (for achievement unlocks)
CREATE TABLE IF NOT EXISTS public.gamify_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glyph_user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'achievement', 'quest_complete', 'level_up'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  bananas_earned INTEGER NOT NULL DEFAULT 0,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add is_read column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gamify_notifications' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.gamify_notifications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.gamify_notifications(glyph_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.gamify_notifications(is_read);

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================
INSERT INTO public.gamify_achievements_catalog (achievement_code, title, description, badge_icon, bananas_reward, category) VALUES
-- GETTING STARTED
('first_sign_in', 'First Steps', 'Sign in to Apes on Ape for the first time', '🎉', 5, 'social'),
('link_x_account', 'Socialite', 'Link your X (Twitter) account', '🐦', 10, 'social'),
('join_discord', 'Community Member', 'Join the Apes on Ape Discord', '💬', 10, 'social'),

-- GALLERY SUBMISSIONS
('first_submission', 'First Upload', 'Submit your first image to the gallery', '📸', 5, 'gallery'),
('5_submissions', 'Prolific Creator', 'Submit 5 images to the gallery', '🎨', 20, 'gallery'),
('10_submissions', 'Unstoppable', 'Submit 10 images to the gallery', '🚀', 40, 'gallery'),
('25_submissions', 'Legend', 'Submit 25 images to the gallery', '👑', 100, 'gallery'),

-- GALLERY VOTING
('first_vote', 'Voter', 'Cast your first vote on a gallery image', '👍', 2, 'gallery'),
('10_votes_cast', 'Active Voter', 'Cast 10 votes on gallery images', '⭐', 10, 'gallery'),
('50_votes_cast', 'Super Voter', 'Cast 50 votes on gallery images', '🌟', 25, 'gallery'),
('100_votes_cast', 'Mega Voter', 'Cast 100 votes on gallery images', '💫', 50, 'gallery'),

-- GALLERY POPULARITY
('10_votes_received', 'Popular', 'Get 10 votes on a single submission', '🔥', 15, 'gallery'),
('50_votes_received', 'Viral', 'Get 50 votes on a single submission', '💥', 50, 'gallery'),
('100_votes_received', 'Influencer', 'Get 100 votes on a single submission', '⚡', 100, 'gallery'),

-- CREATIVE TOOLS
('first_tool_use', 'Creator', 'Use any creative tool', '🛠️', 5, 'creative'),
('banner_created', 'Banner Master', 'Create a custom banner', '🎨', 5, 'creative'),
('pfp_border_created', 'PFP Artist', 'Create a PFP with custom border', '🖼️', 5, 'creative'),
('meme_created', 'Meme Lord', 'Create your first meme', '😂', 5, 'creative'),
('collage_created', 'Collage Master', 'Create a photo collage', '🎭', 5, 'creative'),
('emote_created', 'Emote Enthusiast', 'Create a custom emote', '😎', 5, 'creative'),
('sticker_created', 'Sticker Collector', 'Create a sticker pack', '✨', 5, 'creative'),
('qr_created', 'QR Genius', 'Generate a QR code badge', '📱', 5, 'creative'),
('wardrobe_used', 'Wardrobe Wizard', 'Customize your look in wardrobe', '👔', 5, 'creative'),
('all_tools_used', 'Master Creator', 'Use all creative tools', '🏆', 50, 'creative'),

-- SOCIAL ENGAGEMENT
('first_share', 'Sharer', 'Share content from the site', '📤', 3, 'social'),
('hashtag_aoa', 'AOA Ambassador', 'Use #AOA in a post', '🏷️', 5, 'social'),
('hashtag_apesonape', 'Apes Advocate', 'Use #ApesOnApe in a post', '🏷️', 5, 'social'),
('tag_official', 'Ape Ally', 'Tag @apechainapes in a post', '🦍', 5, 'social'),

-- MILESTONES
('100_bananas', 'Banana Collector', 'Earn your first 100 bananas', '🍌', 10, 'milestone'),
('500_bananas', 'Banana Hoarder', 'Earn 500 bananas', '🍌🍌', 25, 'milestone'),
('1000_bananas', 'Banana Tycoon', 'Earn 1000 bananas', '🍌🍌🍌', 50, 'milestone'),
('top_10_leaderboard', 'Rising Star', 'Reach top 10 on the leaderboard', '🌠', 50, 'milestone'),
('top_3_leaderboard', 'Elite Ape', 'Reach top 3 on the leaderboard', '💎', 100, 'milestone'),
('rank_1_leaderboard', 'Apex Ape', 'Reach #1 on the leaderboard', '👑', 200, 'milestone')

ON CONFLICT (achievement_code) DO NOTHING;

-- ============================================
-- SEED QUESTS
-- ============================================
INSERT INTO public.gamify_quests_catalog (quest_code, title, description, quest_icon, bananas_reward, category, target_count) VALUES
-- DAILY/BASIC QUESTS
('daily_vote_5', 'Daily Voter', 'Vote on 5 images today', '🗳️', 5, 'daily', 5),
('daily_submit', 'Daily Creator', 'Submit an image today', '📸', 5, 'daily', 1),
('daily_tool_use', 'Daily Artist', 'Use any creative tool today', '🎨', 3, 'daily', 1),

-- GALLERY QUESTS
('like_5_images', 'Spread the Love', 'Like 5 different gallery images', '❤️', 5, 'gallery', 5),
('like_20_images', 'Super Supporter', 'Like 20 different gallery images', '💕', 10, 'gallery', 20),
('share_gallery_image', 'Gallery Ambassador', 'Share an image from the gallery', '📢', 3, 'gallery', 1),
('vote_on_20', 'Vote Marathon', 'Cast 20 votes on gallery images', '🎯', 10, 'gallery', 20),
('submit_3_one_day', 'Submission Spree', 'Submit 3 images in one day', '⚡', 10, 'gallery', 3),

-- CREATIVE QUESTS
('use_all_tools', 'Tool Master', 'Use all 7 creative tools', '🛠️', 20, 'creative', 7),
('create_5_memes', 'Meme Machine', 'Create 5 memes', '😂', 15, 'creative', 5),
('create_3_pfps', 'PFP Pro', 'Create 3 custom PFPs', '🖼️', 10, 'creative', 3),
('create_2_collages', 'Collage Connoisseur', 'Create 2 collages', '🎭', 8, 'creative', 2),

-- SOCIAL QUESTS
('share_with_aoa', 'AOA Hashtag Hero', 'Share on X with #AOA', '🏷️', 5, 'social', 1),
('share_with_apesonape', 'ApesOnApe Promoter', 'Share on X with #ApesOnApe', '🏷️', 5, 'social', 1),
('tag_apechainapes', 'Official Mention', 'Tag @apechainapes in a post', '🦍', 5, 'social', 1),
('share_3_times', 'Social Butterfly', 'Share from the site 3 times', '🦋', 10, 'social', 3),

-- COMMUNITY QUESTS
('link_x_account_quest', 'Connect Your Identity', 'Link your X account', '🔗', 10, 'social', 1),
('visit_all_pages', 'Explorer', 'Visit all main pages (Home, Gallery, Creative, Arcade)', '🗺️', 8, 'daily', 4),
('complete_5_quests', 'Quest Hunter', 'Complete 5 different quests', '🎯', 15, 'milestone', 5),
('complete_10_achievements', 'Achievement Hunter', 'Unlock 10 achievements', '🏅', 25, 'milestone', 10)

ON CONFLICT (quest_code) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamify_achievements_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamify_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamify_quests_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamify_user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamify_notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies for catalog tables (everyone can see available achievements/quests)
CREATE POLICY "Anyone can view achievements catalog" ON public.gamify_achievements_catalog FOR SELECT USING (true);
CREATE POLICY "Anyone can view quests catalog" ON public.gamify_quests_catalog FOR SELECT USING (true);

-- User profiles: anyone can read (for leaderboard), service role can write
CREATE POLICY "Anyone can view profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Service role can insert profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update profiles" ON public.user_profiles FOR UPDATE USING (true);

-- User achievements: anyone can read, service role can write
CREATE POLICY "Anyone can view user achievements" ON public.gamify_user_achievements FOR SELECT USING (true);
CREATE POLICY "Service role can insert achievements" ON public.gamify_user_achievements FOR INSERT WITH CHECK (true);

-- User quests: anyone can read, service role can write
CREATE POLICY "Anyone can view user quests" ON public.gamify_user_quests FOR SELECT USING (true);
CREATE POLICY "Service role can insert quests" ON public.gamify_user_quests FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update quests" ON public.gamify_user_quests FOR UPDATE USING (true);

-- Notifications: users can read their own, service role can insert
CREATE POLICY "Users can view own notifications" ON public.gamify_notifications FOR SELECT USING (true);
CREATE POLICY "Service role can insert notifications" ON public.gamify_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.gamify_notifications FOR UPDATE USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to award bananas and update profile
CREATE OR REPLACE FUNCTION award_bananas(p_glyph_user_id TEXT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (glyph_user_id, bananas)
  VALUES (p_glyph_user_id, p_amount)
  ON CONFLICT (glyph_user_id) 
  DO UPDATE SET 
    bananas = user_profiles.bananas + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(p_glyph_user_id TEXT, p_achievement_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_bananas INTEGER;
  v_title TEXT;
  v_already_earned BOOLEAN;
BEGIN
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM public.gamify_user_achievements 
    WHERE glyph_user_id = p_glyph_user_id AND achievement_code = p_achievement_code
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN FALSE;
  END IF;
  
  -- Get achievement details
  SELECT bananas_reward, title INTO v_bananas, v_title
  FROM public.gamify_achievements_catalog
  WHERE achievement_code = p_achievement_code;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Award achievement
  INSERT INTO public.gamify_user_achievements (glyph_user_id, achievement_code)
  VALUES (p_glyph_user_id, p_achievement_code);
  
  -- Award bananas
  PERFORM award_bananas(p_glyph_user_id, v_bananas);
  
  -- Create notification
  INSERT INTO public.gamify_notifications (glyph_user_id, notification_type, title, message, bananas_earned)
  VALUES (
    p_glyph_user_id, 
    'achievement', 
    'Achievement Unlocked!', 
    v_title || ' - You earned ' || v_bananas || ' bananas!',
    v_bananas
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to progress quest
CREATE OR REPLACE FUNCTION progress_quest(p_glyph_user_id TEXT, p_quest_code TEXT, p_increment INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_target INTEGER;
  v_current_progress INTEGER;
  v_bananas INTEGER;
  v_title TEXT;
  v_quest_status TEXT;
BEGIN
  -- Get quest details
  SELECT target_count, bananas_reward, title INTO v_target, v_bananas, v_title
  FROM public.gamify_quests_catalog
  WHERE quest_code = p_quest_code;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Insert or update quest progress
  INSERT INTO public.gamify_user_quests (glyph_user_id, quest_code, progress, target, status)
  VALUES (p_glyph_user_id, p_quest_code, p_increment, v_target, 'active')
  ON CONFLICT (glyph_user_id, quest_code) 
  DO UPDATE SET 
    progress = LEAST(gamify_user_quests.progress + p_increment, v_target),
    updated_at = NOW()
  RETURNING progress, status INTO v_current_progress, v_quest_status;
  
  -- Check if quest is now complete
  IF v_current_progress >= v_target AND v_quest_status = 'active' THEN
    -- Mark as completed
    UPDATE public.gamify_user_quests
    SET status = 'completed', completed_at = NOW()
    WHERE glyph_user_id = p_glyph_user_id AND quest_code = p_quest_code;
    
    -- Award bananas
    PERFORM award_bananas(p_glyph_user_id, v_bananas);
    
    -- Create notification
    INSERT INTO public.gamify_notifications (glyph_user_id, notification_type, title, message, bananas_earned)
    VALUES (
      p_glyph_user_id, 
      'quest_complete', 
      'Quest Complete!', 
      v_title || ' - You earned ' || v_bananas || ' bananas!',
      v_bananas
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.gamify_notifications(glyph_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_status ON public.gamify_user_quests(glyph_user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_bananas_desc ON public.user_profiles(bananas DESC, created_at ASC);
