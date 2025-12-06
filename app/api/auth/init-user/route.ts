import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/auth/init-user
 * Initialize user profile on first sign-in
 * Body: { userId: string, displayName?: string, xUsername?: string, avatarUrl?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId?: string;
      displayName?: string;
      xUsername?: string;
      avatarUrl?: string;
    };
    const { userId, displayName, xUsername, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Check if user profile already exists and load stored values
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('glyph_user_id, display_name, x_username, avatar_url')
      .eq('glyph_user_id', userId)
      .maybeSingle();

    const isNewUser = !existingProfile;

    // Use SECURITY DEFINER DB function to upsert profile without service key
    const { error: upsertError } = await supabase.rpc('upsert_user_profile', {
      p_glyph_user_id: userId,
      p_display_name: (isNewUser || !existingProfile?.display_name) ? (displayName || null) : null,
      p_x_username: (isNewUser || !existingProfile?.x_username) ? (xUsername || null) : null,
      p_avatar_url: (isNewUser || !existingProfile?.avatar_url) ? (avatarUrl || null) : null
    });

    if (upsertError) {
      console.error('Error upserting user profile:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // If new user, award first sign-in achievement
    if (isNewUser) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'first_sign_in'
      });
    }

    // If X is linked, award Socialite + progress quest (idempotent; safe to re-run)
    if (xUsername) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: userId,
        p_achievement_code: 'link_x_account'
      });

      await supabase.rpc('progress_quest', {
        p_glyph_user_id: userId,
        p_quest_code: 'link_x_account_quest',
        p_increment: 1
      });
    }

    return NextResponse.json({ 
      ok: true, 
      isNewUser,
      message: isNewUser ? 'User profile created and first sign-in achievement awarded' : 'User profile updated'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in init-user endpoint:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

