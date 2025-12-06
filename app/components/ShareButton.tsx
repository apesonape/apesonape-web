'use client';

import React from 'react';
import { useGlyph } from '@use-glyph/sdk-react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  text: string;
  url?: string;
  hashtags?: string[]; // e.g., ['AOA', 'ApesOnApe']
  mention?: boolean; // Whether to include @apechainapes
  shareType?: 'gallery' | 'general';
  questCode?: string; // Quest code to progress when sharing
  className?: string;
  compact?: boolean; // Smaller button for quest cards
}

export default function ShareButton({ 
  text, 
  url, 
  hashtags = [], 
  mention = false, 
  shareType = 'general',
  questCode,
  className = '',
  compact = false
}: ShareButtonProps) {
  const glyph = (useGlyph() as unknown) as { user?: { id?: string } };
  const userId = glyph?.user?.id || '';

  const handleShare = async () => {
    // Build X share URL
    let shareText = text;
    
    // Add hashtags
    if (hashtags.length > 0) {
      shareText += ' ' + hashtags.map(tag => `#${tag}`).join(' ');
    }
    
    // Add mention
    if (mention) {
      shareText += ' @apechainapes';
    }
    
    // Add URL - always use production URL for sharing
    const productionUrl = 'https://apesonape.io';
    const shareUrl = url || productionUrl;
    
    // Encode and open X share dialog
    const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    
    // Open in new window
    window.open(xShareUrl, '_blank', 'width=550,height=420');
    
    // Track the share (fire and forget)
    if (userId) {
      fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: 'x',
          shareType,
          hashtags,
          mention,
          questCode // Include quest code for specific quest tracking
        })
      }).catch(err => console.error('Error tracking share:', err));
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white transition-colors ${className}`}
        title="Share on X to complete this quest"
      >
        <Share2 className="w-3 h-3" />
        <span>Share</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white transition-colors ${className}`}
      title="Share on X"
    >
      <Share2 className="w-4 h-4" />
      <span>Share on X</span>
    </button>
  );
}

