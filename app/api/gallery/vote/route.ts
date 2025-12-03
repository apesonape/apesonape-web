'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
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
		if (!submission_id) return NextResponse.json({ error: 'Missing submission_id' }, { status: 400 });

		const supabase = getSupabaseServerClient();
		const ip = getClientIp(req);
		// Permanently unique per IP + submission (not per-day)
		const ipHash = crypto.createHash('sha256').update(`${ip}:${submission_id}`).digest('hex');
		// Backward-compatible with schema unique (submission_id, voter_ip_hash, day): use constant day
		const day = 'alltime';

		const { error: insertErr } = await supabase.from('gallery_votes').insert({
			submission_id,
			voter_ip_hash: ipHash,
			day,
		});
		if (insertErr) {
			// Ignore duplicates (unique constraint) and proceed to recalc count
			const msg = `${insertErr.message || ''}`.toLowerCase();
			const isDuplicate = msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists');
			if (!isDuplicate) {
				return NextResponse.json({ error: insertErr.message }, { status: 400 });
			}
		}

		const { count, error: countErr } = await supabase
			.from('gallery_votes')
			.select('*', { count: 'exact', head: true })
			.eq('submission_id', submission_id);
		if (!countErr && typeof count === 'number') {
			await supabase.from('gallery_submissions').update({ votes_count: count }).eq('id', submission_id);
		}

		return NextResponse.json({ ok: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}


