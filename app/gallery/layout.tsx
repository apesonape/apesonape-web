import React from 'react';
import Nav from '@/app/components/Nav';

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Nav />
			<div className="pt-24">
				{children}
			</div>
		</>
	);
}


