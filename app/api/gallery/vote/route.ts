'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase';
import crypto from 'crypto';

function getClientIp(req: NextRequest): string {
	const fwd = req.headers.get('x-forwarded-for') || '';
	const parts = fwd.split(',').map(s => s.trim()).filter(Boolean);
	return parts[0] || req.headers.get('x-real-ip') || '0.0.0.0';
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}));
		const submission_id = body?.submission_id as number | undefined;
		const likerId = (body?.likerId as string | undefined) || '';
		const authorId = (body?.authorId as string | undefined) || '';
		if (!submission_id) return NextResponse.json({ error: 'Missing submission_id' }, { status: 400 });

		// Prefer service role (server-only) to bypass RLS for controlled write
		const svc = getSupabaseServiceClient();
		const supabase = svc || getSupabaseServerClient();
		const ip = getClientIp(req);
		
		// Create unique identifier: if logged in, use userId + submission_id, else use IP + submission_id
		const uniqueKey = likerId ? `user:${likerId}:${submission_id}` : `ip:${ip}:${submission_id}`;
		const ipHash = crypto.createHash('sha256').update(uniqueKey).digest('hex');
		
		// Backward-compatible with schema unique (submission_id, voter_ip_hash, day): use constant day
		const day = 'alltime';

		// Check if user already voted (prevents duplicate likes)
		const { data: existingVote } = await supabase
			.from('gallery_votes')
			.select('id')
			.eq('submission_id', submission_id)
			.eq('voter_ip_hash', ipHash)
			.eq('day', day)
			.single();

		let isNewVote = false;
		if (existingVote) {
			// User already voted, return current count without inserting
			console.log('Duplicate vote prevented:', { submission_id, likerId, ip });
		} else {
			// Insert new vote
			const { error: insertErr } = await supabase.from('gallery_votes').insert({
				submission_id,
				voter_ip_hash: ipHash,
				day,
			});
			
			if (insertErr) {
				// Ignore duplicates (unique constraint) - race condition
				const msg = `${insertErr.message || ''}`.toLowerCase();
				const isDuplicate = msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists');
				if (!isDuplicate) {
					return NextResponse.json({ error: insertErr.message }, { status: 400 });
				}
			} else {
				isNewVote = true;
			}
		}

		const { count, error: countErr } = await supabase
			.from('gallery_votes')
			.select('*', { count: 'exact', head: true })
			.eq('submission_id', submission_id);
		if (countErr || typeof count !== 'number') {
			return NextResponse.json({ error: countErr?.message || 'Failed to count votes' }, { status: 500 });
		}

		const { error: updateErr } = await supabase
			.from('gallery_submissions')
			.update({ votes_count: count })
			.eq('id', submission_id);
		if (updateErr) {
			return NextResponse.json({ error: updateErr.message }, { status: 500 });
		}

		return NextResponse.json({ ok: true, count, alreadyVoted: !isNewVote });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}


