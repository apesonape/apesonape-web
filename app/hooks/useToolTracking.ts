import { useEffect, useRef } from 'react';
import { useGlyph } from '@use-glyph/sdk-react';

/**
 * Hook to track creative tool usage for gamification
 * Call this in any creative tool page
 * 
 * @param toolCode - The tool identifier (banner, pfp_border, meme, collage, emote, sticker, qr, wardrobe)
 */
export function useToolTracking(toolCode: string) {
  const glyph = (useGlyph() as unknown) as { user?: { id?: string } };
  const userId = glyph?.user?.id || '';
  const tracked = useRef(false);

  // Gamification requests removed; keep hook no-op for compatibility
  useEffect(() => {
    if (!userId || !toolCode || tracked.current) return;
    tracked.current = true;
  }, [userId, toolCode]);
}

