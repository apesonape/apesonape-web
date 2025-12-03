'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const SEEN_KEY = 'aoa_reveal_2025_christmas_seen';

export default function HolidayPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const holidayAttr = document.documentElement.getAttribute('data-holiday');
      const isDecember = new Date().getMonth() === 11;
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const forceHoliday = /holiday=christmas/i.test(search);
      const forceShow = /showReveal=1/.test(search);
      const isHoliday = forceHoliday || holidayAttr === 'christmas' || isDecember;
      if (!isHoliday && !forceShow) return;
      const seen = typeof window !== 'undefined' ? localStorage.getItem(SEEN_KEY) : '1';
      if (!seen || forceShow) {
        // small delay to ensure DOM is fully ready
        setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem(SEEN_KEY, '1');
        }, 150);
      }
    } catch {
      // noop
    }
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setIsOpen(false)}
      />
      {/* Modal */}
      <div
        className="relative mx-4 w-full max-w-lg glass-dark border border-white/10 rounded-2xl p-6 md:p-8 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aoa-holiday-title"
      >
        <button
          aria-label="Close"
          className="absolute top-3 right-3 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
        <div className="mb-4 flex justify-center">
          <span className="text-4xl">🎄</span>
        </div>
        <h2 id="aoa-holiday-title" className="section-heading text-3xl md:text-4xl mb-3">
          REVEAL IS HERE
        </h2>
        <p className="text-xl md:text-2xl font-semibold text-ape-gold mb-6">
          MERRY CHRISTMAS APES
        </p>
        <div className="space-y-2">
          <Link
            href="/collection"
            className="btn-primary w-full inline-flex items-center justify-center"
          >
            See the new Apes in the Collection
          </Link>
          <button
            className="btn-secondary w-full"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


