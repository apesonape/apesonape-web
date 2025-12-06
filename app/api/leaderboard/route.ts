import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * GET /api/leaderboard
 * Fetches top users by bananas (points)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('glyph_user_id, display_name, x_username, avatar_url, bananas')
      .order('bananas', { ascending: false })
      .order('created_at', { ascending: true }) // Tiebreaker: earlier users rank higher
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const leaderboard = (data || []).map((user, index) => ({
      rank: index + 1,
      userId: user.glyph_user_id,
      displayName: user.display_name || user.x_username || 'Anonymous',
      username: user.x_username,
      avatarUrl: user.avatar_url,
      bananas: user.bananas
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in leaderboard endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
