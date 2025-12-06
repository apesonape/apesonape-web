'use client';

import Image from 'next/image';
import React from 'react';

type Props = {
	src: string | null | undefined;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	fill?: boolean;
	sizes?: string;
	unoptimized?: boolean;
	priority?: boolean;
};

// Wrapper to simplify replacing <img> with next/image; defaults to unoptimized for data/blob URLs.
export default function SafeImage({
	src,
	alt,
	className,
	width = 800,
	height = 800,
	fill = false,
	sizes = '100vw',
	unoptimized = true,
	priority = false,
}: Props) {
	const safeSrc = src || '/placeholder.png';

	if (fill) {
		return (
			<Image
				src={safeSrc}
				alt={alt}
				fill
				sizes={sizes}
				unoptimized={unoptimized}
				className={className}
				priority={priority}
			/>
		);
	}

	return (
		<Image
			src={safeSrc}
			alt={alt}
			width={width}
			height={height}
			sizes={sizes}
			unoptimized={unoptimized}
			className={className}
			priority={priority}
		/>
	);
}

