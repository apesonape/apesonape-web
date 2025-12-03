'use client';

import React from 'react';

export default function HolidayDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998]"
    >
      {/* Top string lights removed as requested */}

      {/* Christmas Tree - top right */}
      <div className="absolute top-4 right-4 opacity-90 drop-shadow-lg aoa-sway-slow">
        <svg width="84" height="112" viewBox="0 0 84 112" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1DB954"/>
              <stop offset="100%" stopColor="#0F7A3A"/>
            </linearGradient>
          </defs>
          {/* Star */}
          <path d="M42 6l3.1 6.4 7.1 1-5.1 5 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5.1-5 7.1-1L42 6z" fill="#FFD700"/>
          {/* Tree Layers */}
          <path d="M42 18L64 44H20L42 18Z" fill="url(#treeGrad)" />
          <circle cx="30" cy="40" r="3" fill="#E53935"/>
          <circle cx="50" cy="36" r="3" fill="#0054F9"/>
          <path d="M42 32L66 62H18L42 32Z" fill="url(#treeGrad)" />
          <circle cx="28" cy="56" r="3" fill="#FFD700"/>
          <circle cx="56" cy="52" r="3" fill="#E53935"/>
          <path d="M42 48L72 86H12L42 48Z" fill="url(#treeGrad)" />
          <circle cx="36" cy="76" r="3" fill="#0054F9"/>
          <circle cx="52" cy="72" r="3" fill="#FFD700"/>
          {/* Trunk */}
          <rect x="37" y="86" width="10" height="18" rx="2" fill="#8D6E63"/>
          {/* Snow base */}
          <ellipse cx="42" cy="108" rx="28" ry="4" fill="rgba(255,255,255,0.45)"/>
        </svg>
      </div>

      {/* Gifts - bottom left */}
      <div className="absolute bottom-4 left-4 opacity-90 drop-shadow-lg flex items-end gap-3">
        {/* Red gift */}
        <div className="aoa-bob">
          <svg width="64" height="54" viewBox="0 0 64 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="18" width="60" height="34" rx="6" fill="#E53935"/>
            <rect x="28" y="18" width="8" height="34" fill="#FFD700"/>
            <rect x="6" y="8" width="52" height="14" rx="4" fill="#C62828"/>
            <rect x="30" y="8" width="4" height="14" fill="#FFD700"/>
            {/* Bow */}
            <path d="M32 8c-2 4-6 6-10 6 4 0 8 2 10 6 2-4 6-6 10-6-4 0-8-2-10-6z" fill="#FFD700"/>
          </svg>
        </div>
        {/* Green gift */}
        <div className="aoa-bob-slow">
          <svg width="52" height="46" viewBox="0 0 52 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="14" width="48" height="30" rx="6" fill="#1DB954"/>
            <rect x="22" y="14" width="8" height="30" fill="#0054F9"/>
            <rect x="6" y="6" width="40" height="12" rx="4" fill="#128D45"/>
            <rect x="24" y="6" width="4" height="12" fill="#0054F9"/>
            {/* Bow */}
            <path d="M26 6c-1.6 3.2-4.8 4.8-8 4.8 3.2 0 6.4 1.6 8 4.8 1.6-3.2 4.8-4.8 8-4.8-3.2 0-6.4-1.6-8-4.8z" fill="#0054F9"/>
          </svg>
        </div>
      </div>
    </div>
  );
}


