import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/gamify/quest
 * Progresses a quest for a user
 * Body: { userId: string, questCode: string, increment?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, questCode, increment = 1 } = body;

    if (!userId || !questCode) {
      return NextResponse.json({ error: 'userId and questCode required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Call the progress_quest function
    const { data, error } = await supabase.rpc('progress_quest', {
      p_glyph_user_id: userId,
      p_quest_code: questCode,
      p_increment: increment
    });

    if (error) {
      console.error('Error progressing quest:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // data will be a boolean indicating if the quest was completed
    return NextResponse.json({ ok: true, completed: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in quest endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

