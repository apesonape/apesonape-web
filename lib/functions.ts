export function getSupabaseFunctionsBase(): string {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
	try {
		const u = new URL(supabaseUrl);
		// example host: bqcrbcpmimfojnjdhvrz.supabase.co -> bqcrbcpmimfojnjdhvrz.functions.supabase.co
		const [projectRef] = u.host.split('.');
		return `https://${projectRef}.functions.supabase.co`;
	} catch {
		return '';
	}
}


