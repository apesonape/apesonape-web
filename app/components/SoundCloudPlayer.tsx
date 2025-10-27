'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

type SoundCloudTrack = { title?: string };

interface SoundCloudWidgetOptions {
  auto_play?: boolean;
  visual?: boolean;
  show_comments?: boolean;
  hide_related?: boolean;
  show_reposts?: boolean;
  show_user?: boolean;
  show_teaser?: boolean;
  start_track?: number;
}

interface SoundCloudWidget {
  bind(event: string, listener: () => void): void;
  play(): void;
  pause(): void;
  next(): void;
  isPaused(callback: (paused: boolean) => void): void;
  setVolume(volumePercent: number): void;
  getCurrentSound(callback: (sound: SoundCloudTrack | null) => void): void;
  getSounds(callback: (sounds: SoundCloudTrack[]) => void): void;
  load(url: string, options?: SoundCloudWidgetOptions): void;
}

interface SoundCloud {
  Widget: {
    (iframe: HTMLIFrameElement): SoundCloudWidget;
    Events: {
      READY: string;
      PLAY: string;
      PAUSE: string;
      FINISH: string;
    };
  };
}

declare global {
  interface Window {
    SC?: SoundCloud;
  }
}

const PLAYLIST_URL = 'https://soundcloud.com/apesonape/sets/sinatra-season-by-dr-dibs';

export default function SoundCloudPlayer() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const hasAutoTriedRef = useRef(false);
  const unmuteOnFirstInteractionRef = useRef(true);

  // Use a stable start index for SSR/CSR match; we randomize after READY
  const stableStartIndex = 0;

  // Build iframe src with minimal classic player UI
  const playerSrc = useMemo(() => {
    const encoded = encodeURIComponent(PLAYLIST_URL);
    const params = new URLSearchParams({
      url: encoded,
      auto_play: 'true',
      hide_related: 'true',
      show_comments: 'false',
      show_user: 'true',
      show_reposts: 'false',
      show_teaser: 'false',
      visual: 'false',
      start_track: String(stableStartIndex),
    });
    return `https://w.soundcloud.com/player/?${params.toString()}`;
  }, []);

  useEffect(() => {
    let cancelled = false;

    function initWidget() {
      if (!iframeRef.current || !window.SC || !window.SC.Widget) return;
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        if (cancelled) return;
        setIsReady(true);
        // Start muted to satisfy autoplay policies
        widget.setVolume(0);

        // Ensure random start within playlist length
        widget.getSounds((sounds: SoundCloudTrack[]) => {
          if (!Array.isArray(sounds) || sounds.length === 0) return;
          const randomIndex = Math.floor(Math.random() * sounds.length);
          widget.load(PLAYLIST_URL, {
            auto_play: true,
            visual: false,
            show_comments: false,
            hide_related: true,
            show_reposts: false,
            show_user: true,
            show_teaser: false,
            start_track: randomIndex,
          });
        });

        // Fallback attempt to play if blocked
        if (!hasAutoTriedRef.current) {
          hasAutoTriedRef.current = true;
          setTimeout(() => {
            widget.isPaused((paused: boolean) => {
              if (paused) {
                try { widget.play(); } catch {}
              }
            });
          }, 600);
        }
      });

      widget.bind(window.SC.Widget.Events.PLAY, () => {
        if (cancelled) return;
        setIsPlaying(true);
        widget.getCurrentSound((sound: SoundCloudTrack | null) => setCurrentTitle(sound?.title || ''));
      });

      widget.bind(window.SC.Widget.Events.PAUSE, () => {
        if (cancelled) return;
        setIsPlaying(false);
      });

      widget.bind(window.SC.Widget.Events.FINISH, () => {
        if (cancelled) return;
        playRandomTrack();
      });

      // On first user interaction, unmute and ensure playback
      const resumeFromGesture = () => {
        if (!unmuteOnFirstInteractionRef.current) return;
        unmuteOnFirstInteractionRef.current = false;
        try {
          widget.setVolume(50);
          widget.isPaused((paused: boolean) => {
            if (paused) widget.play();
          });
        } catch {}
        window.removeEventListener('pointerdown', resumeFromGesture);
        window.removeEventListener('keydown', resumeFromGesture);
        window.removeEventListener('touchstart', resumeFromGesture);
      };
      window.addEventListener('pointerdown', resumeFromGesture, { once: true });
      window.addEventListener('keydown', resumeFromGesture, { once: true });
      window.addEventListener('touchstart', resumeFromGesture, { once: true });
    }

    function ensureScript() {
      const sc = window.SC;
      if (sc && typeof sc.Widget === 'function') {
        initWidget();
        return;
      }
      const existing = document.querySelector('script[data-sc-widget]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', initWidget);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-sc-widget', 'true');
      script.addEventListener('load', initWidget);
      document.body.appendChild(script);
    }

    ensureScript();
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePlay() {
    const widget = widgetRef.current;
    if (!widget) return;
    widget.isPaused((paused: boolean) => {
      if (paused) {
        widget.play();
      } else {
        widget.pause();
      }
    });
  }

  function nextTrack() {
    const widget = widgetRef.current;
    if (!widget) return;
    widget.next();
  }

  function playRandomTrack() {
    const widget = widgetRef.current;
    if (!widget) return;
    widget.getSounds((sounds: SoundCloudTrack[]) => {
      if (!Array.isArray(sounds) || sounds.length === 0) return;
      const randomIndex = Math.floor(Math.random() * sounds.length);
      widget.load(PLAYLIST_URL, {
        auto_play: true,
        visual: false,
        show_comments: false,
        hide_related: true,
        show_reposts: false,
        show_user: true,
        show_teaser: false,
        start_track: randomIndex,
      });
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 glass-dark border border-white/10 rounded-xl p-3 shadow-lg">
      {/* Hidden/minimal iframe player */}
      <iframe
        ref={iframeRef}
        title="Apes On Ape — SoundCloud Player"
        style={{ width: 0, height: 0, opacity: 0, pointerEvents: 'none', position: 'absolute' }}
        src={playerSrc}
        allow="autoplay; encrypted-media"
      />

      {/* Simple Controls */}
      <button
        onClick={togglePlay}
        className="p-2 rounded-lg bg-hero-blue/10 hover:bg-hero-blue/20 transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={!isReady}
      >
        {isPlaying ? <Pause className="w-5 h-5 text-hero-blue" /> : <Play className="w-5 h-5 text-hero-blue" />}
      </button>
      <button
        onClick={nextTrack}
        className="p-2 rounded-lg bg-hero-blue/10 hover:bg-hero-blue/20 transition-colors"
        aria-label="Next"
        disabled={!isReady}
      >
        <SkipForward className="w-5 h-5 text-hero-blue" />
      </button>

      <div className="max-w-[14rem] truncate" style={{ color: 'var(--foreground)' }}>
        {currentTitle || 'SoundCloud Player'}
      </div>
    </div>
  );
}


