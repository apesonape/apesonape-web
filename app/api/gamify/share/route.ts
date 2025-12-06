import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/gamify/share
 * Awards achievements and progresses quests when a user shares content
 * Body: { userId: string, shareType?: 'gallery' | 'general' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string = String(body?.userId || '').trim();
    const shareType: string = String(body?.shareType || 'general').trim();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 1. Award "first_share" achievement
    await supabase.rpc('award_achievement', {
      p_glyph_user_id: userId,
      p_achievement_code: 'first_share'
    });

    // 2. Progress share-related quests
    if (shareType === 'gallery') {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'share_gallery_image',
        p_increment: 1
      });
    }

    await supabase.rpc('progress_quest', {
      p_glyph_user_id: userId,
      p_quest_code: 'share_3_times',
      p_increment: 1
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error in share gamify endpoint:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
