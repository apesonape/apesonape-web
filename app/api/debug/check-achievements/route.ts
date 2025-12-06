import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * GET /api/debug/check-achievements
 * Debug endpoint to check user's achievements
 * Query: ?userId=XXX
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('glyph_user_id', userId)
      .single();

    // Get user achievements
    const { data: achievements } = await supabase
      .from('gamify_user_achievements')
      .select(`
        achievement_code,
        earned_at,
        gamify_achievements_catalog (
          title,
          bananas_reward
        )
      `)
      .eq('glyph_user_id', userId)
      .order('earned_at', { ascending: false });

    // Get user quests
    const { data: quests } = await supabase
      .from('gamify_user_quests')
      .select(`
        quest_code,
        progress,
        target,
        status,
        gamify_quests_catalog (
          title,
          bananas_reward
        )
      `)
      .eq('glyph_user_id', userId);

    return NextResponse.json({
      userId,
      profile,
      achievements: achievements || [],
      quests: quests || [],
      totalAchievements: achievements?.length || 0,
      totalBananas: profile?.bananas || 0
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in debug check-achievements:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/debug/check-achievements
 * Manually trigger achievement award for testing
 * Body: { userId: string, achievementCode: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, achievementCode } = body;

    if (!userId || !achievementCode) {
      return NextResponse.json({ error: 'userId and achievementCode required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Try to award the achievement
    const { data, error } = await supabase.rpc('award_achievement', {
      p_glyph_user_id: userId,
      p_achievement_code: achievementCode
    });

    if (error) {
      return NextResponse.json({ 
        ok: false, 
        error: error.message,
        message: `Failed to award achievement: ${achievementCode}`
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      newlyAwarded: data,
      message: data 
        ? `✅ Achievement "${achievementCode}" awarded!` 
        : `⚠️ Achievement "${achievementCode}" was already earned`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in debug award achievement:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

