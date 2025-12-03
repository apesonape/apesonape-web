 'use server';
 
 import { NextRequest, NextResponse } from 'next/server';
 import { getSupabaseFunctionsBase } from '@/lib/functions';
 
 export async function POST(req: NextRequest) {
 	try {
 		const base = getSupabaseFunctionsBase();
 		const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
 		if (!base || !anonKey) return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
 
 		const provided = req.headers.get('x-admin-token') || '';
 		const body = await req.json().catch(() => ({}));
 
 		const res = await fetch(`${base}/gallery-moderate`, {
 			method: 'POST',
 			headers: {
 				'Content-Type': 'application/json',
 				'apikey': anonKey,
 				'Authorization': `Bearer ${anonKey}`,
 				'x-admin-token': provided,
 			},
 			body: JSON.stringify(body),
 		});
 		const text = await res.text();
 		if (!res.ok) return NextResponse.json({ error: text.slice(0, 500) || 'Moderate failed' }, { status: res.status });
 		try {
 			return NextResponse.json(JSON.parse(text));
 		} catch {
 			return NextResponse.json({ ok: true, raw: text });
 		}
 	} catch (e: unknown) {
 		const msg = e instanceof Error ? e.message : 'Unknown error';
 		return NextResponse.json({ error: msg }, { status: 500 });
 	}
 }


