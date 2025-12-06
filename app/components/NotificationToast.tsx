'use client';

import React, { useEffect, useState } from 'react';
import { useGlyph } from '@use-glyph/sdk-react';

interface Notification {
	id: string;
	notification_type: string;
	title: string;
	message: string;
	bananas_earned: number;
	is_read: boolean;
	created_at: string;
}

export default function NotificationToast() {
	const glyph = (useGlyph() as unknown) as { user?: { id?: string } };
	const userId = glyph?.user?.id || '';

	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [visible, setVisible] = useState<Set<string>>(new Set());

	// Poll for new notifications every 10 seconds
	useEffect(() => {
		if (!userId) return;

		const fetchNotifications = async () => {
			try {
				const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&unreadOnly=true`);
				if (res.ok) {
					const json = await res.json();
					if (Array.isArray(json?.notifications)) {
						const newNotifs = json.notifications.filter((n: Notification) => !visible.has(n.id));
						if (newNotifs.length > 0) {
							setNotifications(prev => [...newNotifs, ...prev].slice(0, 5)); // Keep max 5
							newNotifs.forEach((n: Notification) => {
								setVisible(prev => new Set(prev).add(n.id));
								// Auto-dismiss after 5 seconds
								setTimeout(() => {
									setNotifications(prev => prev.filter(notif => notif.id !== n.id));
								}, 5000);
							});
						}
					}
				}
			} catch (err) {
				console.error('Error fetching notifications:', err);
			}
		};

		fetchNotifications();
		const interval = setInterval(fetchNotifications, 10000);
		return () => clearInterval(interval);
	}, [userId, visible]);

	const dismissNotification = async (id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id));
		// Mark as read
		try {
			await fetch('/api/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notificationIds: [id] })
			});
		} catch {}
	};

	if (notifications.length === 0) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
			{notifications.map((notif) => (
				<div
					key={notif.id}
					className="glass-dark rounded-lg p-4 border border-hero-blue/40 shadow-lg animate-slide-up pointer-events-auto max-w-sm"
				>
					<div className="flex items-start gap-3">
						<div className="text-3xl flex-shrink-0">
							{notif.notification_type === 'achievement' ? '🏆' : notif.notification_type === 'quest_complete' ? '🎯' : '🎉'}
						</div>
						<div className="flex-1 min-w-0">
							<div className="font-bold text-sm mb-1">{notif.title}</div>
							<div className="text-xs text-off-white/80 mb-2">{notif.message}</div>
							{notif.bananas_earned > 0 && (
								<div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
									<span>🍌</span> +{notif.bananas_earned}
								</div>
							)}
						</div>
						<button
							onClick={() => dismissNotification(notif.id)}
							className="text-off-white/50 hover:text-off-white text-lg flex-shrink-0"
						>
							×
						</button>
					</div>
				</div>
			))}
		</div>
	);
}

