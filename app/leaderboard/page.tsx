'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SafeImage from '../components/SafeImage';

interface LeaderboardEntry {
	rank: number;
	userId: string;
	displayName: string;
	username: string | null;
	avatarUrl: string | null;
	bananas: number;
}

export default function LeaderboardPage() {
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [limit, setLimit] = useState<number>(50);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await fetch(`/api/leaderboard?limit=${limit}`);
				if (res.ok) {
					const json = await res.json();
					if (Array.isArray(json?.leaderboard)) {
						setLeaderboard(json.leaderboard);
					}
				}
			} catch (err) {
				console.error('Error fetching leaderboard:', err);
			} finally {
				setLoading(false);
			}
		})();
	}, [limit]);

	return (
		<div className="min-h-screen relative">
			<Nav />
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
						🏅 Leaderboard
					</h1>
					<p className="text-off-white/70">Top community members ranked by bananas</p>
				</div>

				{loading ? (
					<div className="text-center text-off-white/60 py-12">Loading leaderboard...</div>
				) : leaderboard.length === 0 ? (
					<div className="text-center text-off-white/60 py-12">No leaderboard data yet.</div>
				) : (
					<div className="glass-dark rounded-xl p-6 border border-white/10">
						<div className="space-y-3">
							{leaderboard.map((entry) => (
								<div
									key={entry.userId}
									className={`p-4 rounded-lg border flex items-center gap-4 transition-all hover:scale-105 ${
										entry.rank === 1
											? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/20'
											: entry.rank === 2
											? 'bg-gray-300/10 border-gray-300/40 shadow-lg shadow-gray-300/20'
											: entry.rank === 3
											? 'bg-orange-600/10 border-orange-600/40 shadow-lg shadow-orange-600/20'
											: 'bg-black/20 border-white/10'
									}`}
								>
									<div className="text-2xl font-bold w-12 text-center flex-shrink-0">
										{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
									</div>
									<div className="w-16 h-16 rounded-full overflow-hidden bg-black/40 flex-shrink-0 border-2 border-white/20 relative">
									{entry.avatarUrl ? (
										<SafeImage src={entry.avatarUrl} alt={entry.displayName} className="w-full h-full object-cover" width={128} height={128} />
									) : (
											<div className="w-full h-full flex items-center justify-center text-lg text-off-white/60">?</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-lg font-bold truncate" style={{ color: 'var(--foreground)' }}>
											{entry.displayName}
										</div>
										{entry.username && (
											<div className="text-sm text-off-white/70 truncate">@{entry.username}</div>
										)}
									</div>
									<div className="flex items-center gap-2 flex-shrink-0">
										<span className="text-3xl">🍌</span>
										<div className="text-2xl font-bold text-yellow-400">{entry.bananas}</div>
									</div>
								</div>
							))}
						</div>

						{/* Load More */}
						{leaderboard.length >= limit && (
							<div className="text-center mt-6">
								<button
									className="btn-primary px-4 py-2 text-sm"
									onClick={() => setLimit(prev => prev + 50)}
								>
									Load More
								</button>
							</div>
						)}
					</div>
				)}

				<div className="text-center mt-8">
					<Link href="/profile" className="btn-secondary px-4 py-2 text-sm inline-block">
						← Back to Profile
					</Link>
				</div>
			</main>
			<Footer />
		</div>
	);
}
