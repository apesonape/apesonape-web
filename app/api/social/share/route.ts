import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/social/share
 * Records a social share and awards achievements
 * Body: { userId: string, platform: 'x' | 'discord', shareType: 'gallery' | 'general', hashtags?: string[], mention?: boolean, questCode?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, platform, shareType, hashtags, mention, questCode } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const svc = getSupabaseServiceClient();
    const supabase = svc || getSupabaseServerClient();

    // Award share achievements
    await supabase.rpc('award_achievement', {
      p_glyph_user_id: userId,
      p_achievement_code: 'first_share'
    });

    // Award hashtag achievements
    if (platform === 'x' && Array.isArray(hashtags)) {
      if (hashtags.includes('AOA') || hashtags.includes('aoa')) {
        await supabase.rpc('award_achievement', {
          p_glyph_user_id: userId,
          p_achievement_code: 'hashtag_aoa'
        });
        
        await supabase.rpc('progress_quest', {
          p_glyph_user_id: userId,
          p_quest_code: 'share_with_aoa',
          p_increment: 1
        });
      }

      if (hashtags.includes('ApesOnApe') || hashtags.includes('apesonape')) {
        await supabase.rpc('award_achievement', {
          p_glyph_user_id: userId,
          p_achievement_code: 'hashtag_apesonape'
        });
        
        await supabase.rpc('progress_quest', {
          p_glyph_user_id: userId,
          p_quest_code: 'share_with_apesonape',
          p_increment: 1
        });
      }
    }

    // Award mention achievement
    if (platform === 'x' && mention) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'tag_official'
      });
      
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'tag_apechainapes',
        p_increment: 1
      });
    }

    // Progress specific quest if provided (from quest card button)
    if (questCode) {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: questCode,
        p_increment: 1
      });
    }

    // Progress general share quests (if not already handled by questCode)
    if (shareType === 'gallery' && questCode !== 'share_gallery_image') {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'share_gallery_image',
        p_increment: 1
      });
    }

    if (questCode !== 'share_3_times') {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'share_3_times',
        p_increment: 1
      });
    }

    return NextResponse.json({ ok: true, message: 'Share recorded and achievements awarded!' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in social share endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

