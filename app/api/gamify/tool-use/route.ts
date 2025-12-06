import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/gamify/tool-use
 * Awards achievements and progresses quests when a user uses a creative tool
 * Body: { userId: string, toolCode: string }
 * 
 * Tool codes:
 * - pfp_border, meme, collage, emote, sticker, qr, wardrobe, banner
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string = String(body?.userId || '').trim();
    const toolCode: string = String(body?.toolCode || '').trim();

    if (!userId || !toolCode) {
      return NextResponse.json({ error: 'Missing userId or toolCode' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 1. Award "first_tool_use" achievement
    await supabase.rpc('award_achievement', {
      p_glyph_user_id: userId,
      p_achievement_code: 'first_tool_use'
    });

    // 2. Award tool-specific achievements
    const toolAchievementMap: Record<string, string> = {
      pfp_border: 'pfp_border_created',
      meme: 'meme_created',
      collage: 'collage_created',
      emote: 'emote_created',
      sticker: 'sticker_created',
      qr: 'qr_created',
      wardrobe: 'wardrobe_used',
      banner: 'banner_created'
    };

    const achievementCode = toolAchievementMap[toolCode];
    if (achievementCode) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: achievementCode
      });
    }

    // 3. Progress quests
    await supabase.rpc('progress_quest', {
      p_glyph_user_id: userId,
      p_quest_code: 'daily_tool_use',
      p_increment: 1
    });

    await supabase.rpc('progress_quest', {
      p_glyph_user_id: userId,
      p_quest_code: 'use_all_tools',
      p_increment: 1
    });

    // Tool-specific quests
    if (toolCode === 'meme') {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'create_5_memes',
        p_increment: 1
      });
    } else if (toolCode === 'pfp_border') {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'create_3_pfps',
        p_increment: 1
      });
    } else if (toolCode === 'collage') {
      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'create_2_collages',
        p_increment: 1
      });
    }

    // 4. Check if all tools have been used
    const { data: userAchievements } = await supabase
      .from('gamify_user_achievements')
      .select('achievement_code')
      .eq('glyph_user_id', userId)
      .in('achievement_code', [
        'banner_created',
        'pfp_border_created',
        'meme_created',
        'collage_created',
        'emote_created',
        'sticker_created',
        'qr_created',
        'wardrobe_used'
      ]);

    if (userAchievements && userAchievements.length >= 8) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'all_tools_used'
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error in tool-use gamify endpoint:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

