import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/gamify/award
 * Awards an achievement and bananas to a user
 * Body: { userId: string, achievementCode: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, achievementCode } = body;

    if (!userId || !achievementCode) {
      return NextResponse.json({ error: 'userId and achievementCode required' }, { status: 400 });
    }

    // Use anon/server client; DB functions are SECURITY DEFINER
    const supabase = getSupabaseServerClient();

    // Call the award_achievement function
    const { data, error } = await supabase.rpc('award_achievement', {
      p_glyph_user_id: userId,
      p_achievement_code: achievementCode
    });

    if (error) {
      console.error('Error awarding achievement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // data will be a boolean indicating if the achievement was newly awarded
    return NextResponse.json({ ok: true, newlyAwarded: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in award endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

