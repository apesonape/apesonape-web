import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * POST /api/gamify/like
 * Awards achievements and progresses quests when a user likes a gallery image
 * Body: { likerId: string, authorId?: string, submissionId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const likerId: string = String(body?.likerId || '').trim();
    const authorId: string = String(body?.authorId || '').trim();

    if (!likerId) {
      return NextResponse.json({ error: 'Missing likerId' }, { status: 400 });
    }

		// Use anon/server client; DB functions are SECURITY DEFINER
		const supabase = getSupabaseServerClient();

    // 1. Award "first_vote" achievement if first time voting
    await supabase.rpc('award_achievement', {
      p_glyph_user_id: likerId,
      p_achievement_code: 'first_vote'
    });

    // 2. Progress voting quests
    await supabase.rpc('progress_quest', {
      p_glyph_user_id: likerId,
      p_quest_code: 'like_5_images',
      p_increment: 1
    });

    await supabase.rpc('progress_quest', {
      p_glyph_user_id: likerId,
      p_quest_code: 'like_20_images',
      p_increment: 1
    });

    await supabase.rpc('progress_quest', {
      p_glyph_user_id: likerId,
      p_quest_code: 'vote_on_20',
      p_increment: 1
    });

    await supabase.rpc('progress_quest', {
      p_glyph_user_id: likerId,
      p_quest_code: 'daily_vote_5',
      p_increment: 1
    });

    // 3. Check total votes cast for milestone achievements
    const { count: voteCount } = await supabase
      .from('gallery_votes')
      .select('*', { count: 'exact', head: true })
      .eq('voter_ip_hash', likerId); // This is a simplification; ideally track per user

    const totalVotes = voteCount || 0;
    if (totalVotes >= 10) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: likerId,
        p_achievement_code: '10_votes_cast'
      });
    }
    if (totalVotes >= 50) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: likerId,
        p_achievement_code: '50_votes_cast'
      });
    }
    if (totalVotes >= 100) {
      await supabase.rpc('award_achievement', {
        p_glyph_user_id: likerId,
        p_achievement_code: '100_votes_cast'
      });
    }

    // 4. If author provided, check their submission vote counts for popularity achievements
    if (authorId) {
      // Check if any of the author's submissions reached vote milestones
      const { data: submissions } = await supabase
        .from('gallery_submissions')
        .select('votes_count')
        .eq('user_id', authorId)
        .order('votes_count', { ascending: false })
        .limit(1);

      const maxVotes = submissions?.[0]?.votes_count || 0;
      if (maxVotes >= 10) {
        await supabase.rpc('award_achievement', {
          p_glyph_user_id: authorId,
          p_achievement_code: 'popular'
        });
      }
      if (maxVotes >= 50) {
        await supabase.rpc('award_achievement', {
          p_glyph_user_id: authorId,
          p_achievement_code: 'viral'
        });
      }
      if (maxVotes >= 100) {
        await supabase.rpc('award_achievement', {
          p_glyph_user_id: authorId,
          p_achievement_code: 'influencer'
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error in like gamify endpoint:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
