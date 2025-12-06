import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * GET /api/profile/summary
 * Fetches user profile, bananas, achievements, and active quests
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 1. Get user profile (bananas)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('bananas, avatar_url, display_name, x_username')
      .eq('glyph_user_id', userId)
      .single();

    const bananas = profile?.bananas || 0;

    // 2. Get user achievements (earned achievements with catalog details)
    const { data: userAchievements } = await supabase
      .from('gamify_user_achievements')
      .select(`
        achievement_code,
        earned_at,
        gamify_achievements_catalog (
          title,
          description,
          badge_icon,
          bananas_reward,
          category
        )
      `)
      .eq('glyph_user_id', userId)
      .order('earned_at', { ascending: false });

    // 3. Get all achievements catalog to show not-yet-earned
    const { data: allAchievements } = await supabase
      .from('gamify_achievements_catalog')
      .select('achievement_code, title, description, badge_icon, bananas_reward, category')
      .order('category', { ascending: true });

    const earnedCodes = new Set((userAchievements || []).map(a => a.achievement_code));
    
    const achievements = (allAchievements || []).map(ach => {
      const earned = earnedCodes.has(ach.achievement_code);
      const userAch = (userAchievements || []).find(ua => ua.achievement_code === ach.achievement_code);
      return {
        achievement_code: ach.achievement_code,
        title: ach.title,
        description: ach.description,
        badge_icon: ach.badge_icon,
        bananas_reward: ach.bananas_reward,
        category: ach.category,
        earned,
        earned_at: earned && userAch ? userAch.earned_at : null
      };
    });

    // 4. Get active quests (not completed)
    const { data: activeQuests } = await supabase
      .from('gamify_user_quests')
      .select(`
        quest_code,
        progress,
        target,
        status,
        gamify_quests_catalog (
          title,
          description,
          quest_icon,
          bananas_reward,
          category
        )
      `)
      .eq('glyph_user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // 5. Get all quests catalog for not-yet-started quests
    const { data: allQuests } = await supabase
      .from('gamify_quests_catalog')
      .select('quest_code, title, description, quest_icon, bananas_reward, category, target_count')
      .order('category', { ascending: true });

    // Get completed quest codes to filter them out
    const { data: completedQuests } = await supabase
      .from('gamify_user_quests')
      .select('quest_code')
      .eq('glyph_user_id', userId)
      .eq('status', 'completed');
    
    const completedQuestCodes = new Set((completedQuests || []).map(q => q.quest_code));

    const quests = (allQuests || [])
      .filter(q => !completedQuestCodes.has(q.quest_code)) // Hide completed quests
      .map(quest => {
        const userQuest = (activeQuests || []).find(uq => uq.quest_code === quest.quest_code);
        return {
          quest_code: quest.quest_code,
          title: quest.title,
          description: quest.description,
          quest_icon: quest.quest_icon,
          bananas_reward: quest.bananas_reward,
          category: quest.category,
          progress: userQuest?.progress || 0,
          target: quest.target_count,
          status: userQuest?.status || 'not_started'
        };
      });

    return NextResponse.json({
      bananas,
      achievements,
      quests,
      profile: {
        avatar_url: profile?.avatar_url,
        display_name: profile?.display_name,
        x_username: profile?.x_username
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching profile summary:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
