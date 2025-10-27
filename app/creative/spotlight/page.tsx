'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import NextImage from 'next/image';

type SpotlightItem = {
  id: string;
  title: string;
  creator: string;
  xHandle?: string; // without @
  mediaType: 'image' | 'video' | 'x';
  src: string; // image url, video url, or X status URL
  videoSrc?: string; // optional: direct video file hosted on our site/CDN
  story: string;
};

// Placeholder content – can be replaced with fetched content later
const demos: SpotlightItem[] = [
  {
    id: '3',
    title: '199ZEN — Community Spotlight',
    creator: '199ZEN',
    xHandle: '199ZEN',
    mediaType: 'x',
    src: 'https://x.com/i/status/1982779941092573399',
    story: 'GM — 199ZEN’s first professional-style video, opening a new era of creative work inspired by the @apechainapes community.',
  },
  {
    id: '4',
    title: 'NoTime — Video/Song Spotlight',
    creator: 'NoTime',
    xHandle: 'AlexNoTime',
    mediaType: 'x',
    src: 'https://x.com/AlexNoTime/status/1980187830623010851',
    story: 'Spotlight: NoTime shaping lyrics for the second album while revisiting “Ethercore,” which has already earned thousands of plays with support from @apechainapes on #SoundCloud — the biggest music community in NFTs.',
  },
  {
    id: '5',
    title: 'PizzaZak — AoA Tribute Artwork',
    creator: 'PizzaZak',
    xHandle: 'PizzaZak',
    mediaType: 'image',
    src: '/artwork/zaa-artwork.png',
    story: 'Showcasing an artwork made for the AoA community featuring Gorkulus, ApeProfessore and SmokeThatDank.',
  },
  {
    id: '6',
    title: 'dudeman22_eth — Community Spotlight',
    creator: 'dudeman22_eth',
    xHandle: 'dudeman22_eth',
    mediaType: 'x',
    src: 'https://x.com/dudeman22_eth/status/1979971051011613166',
    story: '',
  },
];

export default function CreatorSpotlightPage() {

  function extractTweetId(url: string): string | null {
    try {
      const u = new URL(url);
      // Formats: /status/123 or /i/status/123
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.lastIndexOf('status');
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
      const iidx = parts.findIndex((p) => p === 'i');
      if (iidx !== -1 && parts[iidx + 1] === 'status' && parts[iidx + 2]) return parts[iidx + 2];
      return null;
    } catch {
      return null;
    }
  }

  function XStatusEmbed({ url }: { url: string }) {
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const container = ref.current;
      if (!container) return;

      // Extract tweet id (not strictly required for blockquote mode)
      const extract = extractTweetId(url);
      // Skip if already rendered same tweet
      if ((container as HTMLElement).dataset.tweetId === (extract || url)) return;
      (container as HTMLElement).dataset.tweetId = extract || url;

      // Determine theme on client
      const themeAttr = document.documentElement.getAttribute('data-theme');
      const isDark = themeAttr ? themeAttr !== 'light' : document.documentElement.classList.contains('dark');
      const theme: 'light' | 'dark' = isDark ? 'dark' : 'light';

      // Normalize to twitter.com URL for better reliability
      const id = extract || '';
      const canonical = id ? `https://twitter.com/i/status/${id}` : url.replace('https://x.com', 'https://twitter.com');
      // Inject blockquote that widgets.js transforms
      container.innerHTML = `<blockquote class=\"twitter-tweet\" data-theme=\"${theme}\"><a href=\"${canonical}\"></a></blockquote>`;

      const tryLoad = () => {
        const w = (window as unknown) as { twttr?: { widgets?: { load?: (el?: HTMLElement) => void } } };
        w.twttr?.widgets?.load?.(container);
      };

      // Attempt immediately and once more shortly after
      tryLoad();
      const t = window.setTimeout(tryLoad, 600);
      return () => window.clearTimeout(t);
    }, [url]);

    // Return empty container on SSR; all work happens client-side
    return <div ref={ref} />;
  }

  return (
    <div className="min-h-screen relative">
      <Script
        id="twitter-wjs"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = (window as unknown) as { twttr?: { widgets?: { load?: (el?: HTMLElement) => void } } };
          w.twttr?.widgets?.load?.();
        }}
      />
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-6 text-hero-blue"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Creator Spotlight
        </motion.h1>
        <p className="text-off-white/80 max-w-3xl mb-10">
          Art and videos by the Apes On Ape community — a place where Apes get spotlighted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demos.map((item, idx) => (
            <motion.div
              key={item.id}
              className="glass-dark rounded-xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <div className="w-full">
                {item.mediaType === 'image' ? (
                  <NextImage src={item.src} alt={item.title} width={1200} height={500} className="w-full h-auto object-cover" />
                ) : item.mediaType === 'video' ? (
                  <video className="w-full h-auto" autoPlay muted loop playsInline>
                    <source src={item.src} />
                  </video>
                ) : (
                  <div className="p-0">
                    {item.videoSrc ? (
                      <video className="w-full h-auto rounded" controls playsInline>
                        <source src={item.videoSrc} />
                      </video>
                    ) : (
                      <XStatusEmbed url={item.src} />
                    )}
                  </div>
                )}
              </div>
              {item.mediaType !== 'x' && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
                  <div className="text-sm text-off-white/70 mb-2">
                    By <span className="font-medium" style={{ color: 'var(--foreground)' }}>{item.creator}</span>
                    {item.xHandle && (
                      <>
                        {' '}•{' '}
                        <a
                          href={`https://x.com/${item.xHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hero-blue hover:underline"
                        >
                          @{item.xHandle}
                        </a>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-off-white/80 leading-relaxed">{item.story}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}


