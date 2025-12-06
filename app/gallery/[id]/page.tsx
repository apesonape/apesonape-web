import React from 'react';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase';
import SafeImage from '@/app/components/SafeImage';

// Static export compatibility: declare empty static params
export const dynamic = 'force-static';
export async function generateStaticParams() {
	return [];
}

// Match Next typed build which expects params as a Promise in PageProps
type Props = { params: Promise<{ id: string }> };

function isVideoUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	const lower = url.toLowerCase();
	return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.m4v');
}

export default async function GalleryItemPage({ params }: Props) {
	const { id } = await params;
	const idNum = Number(id);
	const supabase = getSupabaseServerClient();
	const { data, error } = await supabase
		.from('gallery_submissions')
		.select('*')
		.eq('id', idNum)
		.single();

	if (error || !data) {
		return (
			<div className="container mx-auto px-4 py-6">
				<h1 className="text-2xl font-semibold mb-4">Not found</h1>
				<Link className="btn-secondary" href="/gallery">Back to Gallery</Link>
			</div>
		);
	}

	const item = data as {
		id: number;
		title: string;
		author: string | null;
		image_url: string | null; // can be video too
		art_url: string | null;
		twitter_url: string | null;
		votes_count?: number | null;
	};

	const shareUrl = () => {
		const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://apesonape.io';
		const url = `${origin}/gallery/${item.id}`;
		const text = `Community art: ${item.title || 'Check this out!'} #ApesOnApe`;
		return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ApesOnApe`;
	};

	const isVideo = isVideoUrl(item.image_url || undefined);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</h1>
				<Link href="/gallery" className="btn-secondary">Back to Gallery</Link>
			</div>
			<div className="rounded-xl border border-white/20 bg-black/60 p-4 shadow-2xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="rounded-md overflow-hidden">
						{item.image_url ? (
							isVideo ? (
								<video className="w-full h-auto" src={item.image_url} controls playsInline />
							) : (
								<SafeImage src={item.image_url || ''} alt={item.title} className="w-full h-auto object-contain" width={1200} height={900} unoptimized />
							)
						) : (
							<div className="w-full aspect-square bg-white/5"></div>
						)}
					</div>
					<div>
						<p className="text-off-white/80 mb-3">By {item.author || 'Anonymous'}</p>
						<div className="flex gap-2 mb-4">
							<a href={shareUrl()} target="_blank" rel="noopener noreferrer" className="btn-primary">Share to X</a>
							{item.twitter_url && <a className="btn-secondary" href={item.twitter_url} target="_blank" rel="noopener noreferrer">Original Post</a>}
							{item.art_url && <a className="btn-secondary" href={item.art_url} target="_blank" rel="noopener noreferrer">Artwork Link</a>}
						</div>
						<p className="text-sm text-off-white/70">Votes: {item.votes_count ?? 0}</p>
					</div>
				</div>
			</div>
		</div>
	);
}


