'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { useGlyph } from '@use-glyph/sdk-react';

type Notification = {
	id: string;
	notification_type: string;
	title: string;
	message: string;
	bananas_earned: number;
	is_read: boolean;
	created_at: string;
};

export default function NotificationBell() {
	const glyph = (useGlyph() as unknown) as { user?: { id?: string } };
	const userId = glyph?.user?.id || '';

	const [open, setOpen] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchNotifications = useCallback(async () => {
		if (!userId) return;
		try {
			setLoading(true);
			const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&unreadOnly=false`, { cache: 'no-store' });
			if (!res.ok) return;
			const json = await res.json();
			if (Array.isArray(json?.notifications)) {
				setNotifications(json.notifications);
			}
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		if (open) {
			void fetchNotifications();
		}
	}, [open, userId, fetchNotifications]);

	const unreadCount = notifications.filter(n => !n.is_read).length;

	const markAsRead = async (ids: string[]) => {
		if (!ids.length) return;
		try {
			await fetch('/api/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notificationIds: ids })
			});
			setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
		} catch {
			// ignore
		}
	};

	const handleOpen = () => {
		setOpen(v => !v);
	};

	useEffect(() => {
		if (open && unreadCount > 0) {
			void markAsRead(notifications.filter(n => !n.is_read).map(n => n.id));
		}
	}, [open, unreadCount]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!userId) return null;

	return (
		<div className="relative">
			<button
				onClick={handleOpen}
				className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
				title="Notifications"
			>
				<Bell className="w-5 h-5 text-off-white" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 text-[11px] px-1.5 py-0.5 rounded-full bg-hero-blue text-white">
						{unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto glass-dark rounded-xl border border-white/10 shadow-xl z-50 p-3 space-y-2">
					<div className="flex items-center justify-between mb-2">
						<div className="text-sm font-semibold">Notifications</div>
						{unreadCount > 0 && (
							<button
								className="text-xs text-hero-blue flex items-center gap-1"
								onClick={() => markAsRead(notifications.filter(n => !n.is_read).map(n => n.id))}
							>
								<Check className="w-3 h-3" /> Mark read
							</button>
						)}
					</div>
					{loading ? (
						<div className="text-xs text-off-white/60">Loading...</div>
					) : notifications.length === 0 ? (
						<div className="text-xs text-off-white/60">No notifications yet.</div>
					) : (
						notifications.map((n) => (
							<div
								key={n.id}
								className={`p-3 rounded-lg border ${n.is_read ? 'border-white/10 bg-white/5' : 'border-hero-blue/30 bg-hero-blue/5'}`}
							>
								<div className="text-sm font-semibold">{n.title}</div>
								<div className="text-xs text-off-white/70">{n.message}</div>
								{n.bananas_earned > 0 && (
									<div className="text-[11px] text-yellow-400 mt-1">🍌 +{n.bananas_earned}</div>
								)}
								<div className="text-[10px] text-off-white/50 mt-1">
									{new Date(n.created_at).toLocaleString()}
								</div>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}

