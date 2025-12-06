import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/gamify/check-milestones
 * Checks and awards milestone achievements based on bananas and leaderboard position
 * Body: { userId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 1. Get user's banana count
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('bananas')
      .eq('glyph_user_id', userId)
      .single();

    const bananas = profile?.bananas || 0;

    // 2. Award banana milestone achievements
    if (bananas >= 100) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: '100_bananas'
      });
    }
    if (bananas >= 500) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: '500_bananas'
      });
    }
    if (bananas >= 1000) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: '1000_bananas'
      });
    }

    // 3. Get user's leaderboard rank
    const { data: leaderboard } = await supabase
      .from('user_profiles')
      .select('glyph_user_id, bananas, created_at')
      .order('bananas', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    const userRank = (leaderboard || []).findIndex(u => u.glyph_user_id === userId) + 1;

    // 4. Award leaderboard achievements
    if (userRank === 1) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'rank_1_leaderboard'
      });
    }
    if (userRank > 0 && userRank <= 3) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'top_3_leaderboard'
      });
    }
    if (userRank > 0 && userRank <= 10) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'top_10_leaderboard'
      });
    }

    return NextResponse.json({ 
      ok: true, 
      bananas, 
      rank: userRank || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking milestones:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

