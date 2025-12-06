'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
	try {
		const form = await req.formData();
		const file = form.get('file') as File | null;
		const userId = String(form.get('userId') || '').trim();
		if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
		if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

		const svc = getSupabaseServiceClient();
		const supabase = svc || getSupabaseServerClient();

		// Allow configurable bucket; default to "avatars"
		const bucket = process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET || 'avatars';

		const ext = (file.type && file.type.split('/')[1]) || 'png';
		const key = `avatars/${encodeURIComponent(userId)}/${Date.now()}.${ext}`;

		const arrayBuf = await file.arrayBuffer();
		const { error: uploadErr } = await supabase
			.storage
			.from(bucket)
			.upload(key, new Uint8Array(arrayBuf), {
				contentType: file.type || 'image/png',
				upsert: true,
			});
		if (uploadErr) {
			const msg = uploadErr.message || 'Upload failed';
			if (msg.toLowerCase().includes('bucket') && msg.toLowerCase().includes('not found')) {
				return NextResponse.json({
					error: `Bucket "${bucket}" not found. Create it in Supabase Storage or set NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET to an existing bucket.`,
				}, { status: 400 });
			}
			return NextResponse.json({ error: msg }, { status: 500 });
		}
		const { data } = supabase.storage.from(bucket).getPublicUrl(key);
		const url = data?.publicUrl || null;

		// Persist avatar_url to profile
		try {
			await supabase
				.from('user_profiles')
				.upsert({
					glyph_user_id: userId,
					avatar_url: url,
					updated_at: new Date().toISOString(),
				}, { onConflict: 'glyph_user_id' });
		} catch {}

		return NextResponse.json({ ok: true, url });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}


