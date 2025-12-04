import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from './supabase-env';

let cachedServerClient: SupabaseClient | null = null;
let cachedBrowserClient: SupabaseClient | null = null;
let cachedServiceClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
	// Use public anon key for server calls; ensure RLS policies protect data
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anonKey) {
		throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
	}
	if (cachedServerClient) return cachedServerClient;
	cachedServerClient = createClient(url, anonKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return cachedServerClient;
}

export function getSupabaseBrowserClient(): SupabaseClient {
	if (typeof window === 'undefined') {
		return getSupabaseServerClient();
	}
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !anonKey) {
		throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
	}
	if (cachedBrowserClient) return cachedBrowserClient;
	cachedBrowserClient = createClient(url, anonKey, {
		auth: { persistSession: true, autoRefreshToken: true },
	});
	return cachedBrowserClient;
}

export function getSupabaseServiceClient(): SupabaseClient | null {
	// Use service role for server-only privileged operations
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL;
	// Prefer non-reserved env var name. Keep old name as fallback for dev.
	const serviceKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) return null;
	if (cachedServiceClient) return cachedServiceClient;
	cachedServiceClient = createClient(url, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return cachedServiceClient;
}


