-- Make gamify functions run with elevated privileges (no service key needed)

-- Award bananas
CREATE OR REPLACE FUNCTION public.award_bananas(p_glyph_user_id TEXT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (glyph_user_id, bananas)
  VALUES (p_glyph_user_id, p_amount)
  ON CONFLICT (glyph_user_id)
  DO UPDATE SET
    bananas = user_profiles.bananas + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Award achievement
CREATE OR REPLACE FUNCTION public.award_achievement(p_glyph_user_id TEXT, p_achievement_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_bananas INTEGER;
  v_title TEXT;
  v_already_earned BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.gamify_user_achievements
    WHERE glyph_user_id = p_glyph_user_id AND achievement_code = p_achievement_code
  ) INTO v_already_earned;

  IF v_already_earned THEN
    RETURN FALSE;
  END IF;

  SELECT bananas_reward, title INTO v_bananas, v_title
  FROM public.gamify_achievements_catalog
  WHERE achievement_code = p_achievement_code;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.gamify_user_achievements (glyph_user_id, achievement_code)
  VALUES (p_glyph_user_id, p_achievement_code);

  PERFORM award_bananas(p_glyph_user_id, v_bananas);

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Progress quest
CREATE OR REPLACE FUNCTION public.progress_quest(p_glyph_user_id TEXT, p_quest_code TEXT, p_increment INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_target INTEGER;
  v_current_progress INTEGER;
  v_bananas INTEGER;
  v_title TEXT;
  v_quest_status TEXT;
BEGIN
  SELECT target_count, bananas_reward, title INTO v_target, v_bananas, v_title
  FROM public.gamify_quests_catalog
  WHERE quest_code = p_quest_code;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.gamify_user_quests (glyph_user_id, quest_code, progress, target, status)
  VALUES (p_glyph_user_id, p_quest_code, p_increment, v_target, 'active')
  ON CONFLICT (glyph_user_id, quest_code)
  DO UPDATE SET
    progress = LEAST(gamify_user_quests.progress + p_increment, v_target),
    updated_at = NOW()
  RETURNING progress, status INTO v_current_progress, v_quest_status;

  IF v_current_progress >= v_target AND v_quest_status = 'active' THEN
    UPDATE public.gamify_user_quests
    SET status = 'completed', completed_at = NOW()
    WHERE glyph_user_id = p_glyph_user_id AND quest_code = p_quest_code;

    PERFORM award_bananas(p_glyph_user_id, v_bananas);

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Upsert user profile (write display name / x handle / avatar once)
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_glyph_user_id TEXT,
  p_display_name TEXT,
  p_x_username TEXT,
  p_avatar_url TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (glyph_user_id, display_name, x_username, avatar_url)
  VALUES (p_glyph_user_id, p_display_name, p_x_username, p_avatar_url)
  ON CONFLICT (glyph_user_id)
  DO UPDATE SET
    display_name = COALESCE(user_profiles.display_name, EXCLUDED.display_name),
    x_username   = COALESCE(user_profiles.x_username, EXCLUDED.x_username),
    avatar_url   = COALESCE(user_profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at   = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grants so anon can call these SECURITY DEFINER functions
GRANT EXECUTE ON FUNCTION public.award_bananas(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.award_achievement(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.progress_quest(TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(TEXT, TEXT, TEXT, TEXT) TO anon;


