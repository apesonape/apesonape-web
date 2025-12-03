import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Gallery Item';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type UGCItem = {
	id: number;
	title: string;
	author: string | null;
	image_url: string | null;
};

async function fetchItem(id: string): Promise<UGCItem | null> {
	const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
	if (!base || !key) return null;
	const url = `${base}/rest/v1/gallery_submissions?id=eq.${encodeURIComponent(id)}&select=id,title,author,image_url&limit=1`;
	const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' });
	if (!res.ok) return null;
	const arr = await res.json();
	return arr?.[0] || null;
}

export default async function Image({ params }: { params: { id: string } }) {
	const item = await fetchItem(params.id);
	const title = item?.title || 'Apes On Ape Community';
	const author = item?.author || 'Anonymous';
	const img = item?.image_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://apesonape.io'}/favicon.png`;

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					background: '#000',
					color: '#fff',
					position: 'relative',
					fontFamily: 'sans-serif',
				}}
			>
				<img src={img} alt="" width={1200} height={630} style={{ objectFit: 'cover', opacity: 0.9 }} />
				<div
					style={{
						position: 'absolute',
						left: 40,
						right: 40,
						bottom: 40,
						padding: 16,
						background: 'rgba(0,0,0,0.55)',
						borderRadius: 12,
					}}
				>
					<div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{title}</div>
					<div style={{ fontSize: 24, opacity: 0.85 }}>By {author}</div>
				</div>
			</div>
		),
		{ ...size },
	);
}


