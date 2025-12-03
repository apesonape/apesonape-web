'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getSupabaseFunctionsBase } from '@/lib/functions';

export async function GET(req: NextRequest) {
	try {
		const adminHeader = req.headers.get('x-admin-token') || '';
		const { searchParams } = new URL(req.url);
		const status = searchParams.get('status') || 'approved';
		const category = searchParams.get('category') || undefined;
		const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
		const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
		const sort = searchParams.get('sort') || 'created_at:desc';
		const [sortField, sortDirRaw] = sort.split(':');
		const ascending = (sortDirRaw || 'desc').toLowerCase() !== 'desc';

		// If admin header present, proxy to functions for pending/secure views
		if (adminHeader) {
			const base = getSupabaseFunctionsBase();
			const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
			if (!base || !anonKey) return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
			const qs = new URLSearchParams();
			if (status) qs.set('status', status);
			if (limit) qs.set('limit', String(limit));
			const res = await fetch(`${base}/gallery-moderate?${qs.toString()}`, {
				headers: {
					'apikey': anonKey,
					'Authorization': `Bearer ${anonKey}`,
					'x-admin-token': adminHeader,
				},
			});
			const text = await res.text();
			if (!res.ok) return NextResponse.json({ error: text.slice(0, 500) || 'List failed' }, { status: res.status });
			try {
				return NextResponse.json(JSON.parse(text));
			} catch {
				return NextResponse.json({ raw: text });
			}
		}

		// Public list (approved)
		const supabase = getSupabaseServerClient();
		let query = supabase
			.from('gallery_submissions')
			.select('*', { count: 'exact' })
			.eq('status', status);
		if (category) {
			query = query.eq('category', category);
		}
		query = query.order(sortField || 'created_at', { ascending }).range(offset, offset + limit - 1);

		const { data, error, count } = await query;
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ items: data ?? [], count: count ?? 0 });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return NextResponse.json({ error: msg }, { status: 500 });
	}
}


